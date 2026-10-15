"""Opt-in web fallback: free web search -> scrape -> the same extractive, cited answer.

Used only when the journalist asks for it after the archive comes up empty. Pages are
processed in memory and never added to the archive. Sources: the Wikipedia API (stable,
official) plus DuckDuckGo via `ddgs` (unofficial, may be rate-limited). Pages whose
robots.txt disallows us are skipped.
"""
import re
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx
import numpy as np
import trafilatura

from .config import TOP_K, WEB_MAX_CHARS, WEB_MAX_PAGES, WEB_TIMEOUT
from .ingest import _splitter
from .rag import _STOPWORDS, _cosine, compose_answer, gate_hits, passage_context
from .vectorstore import get_embeddings

# Wikimedia rejects user agents without contact info.
USER_AGENT = "MediaMindResearchBot/0.1 (+https://github.com/kshitij162005/Arya_MediaMind_Kalvium-Community)"
_HEADERS = {"User-Agent": USER_AGENT}
WIKI_API = "https://en.wikipedia.org/w/api.php"


def _keywords(query: str) -> str:
    words = [w for w in re.findall(r"[\w'/-]+", query) if w.lower() not in _STOPWORDS]
    return " ".join(words) or query


# ---------- search ----------

def search_wikipedia(client: httpx.Client, query: str, limit: int = 3) -> list[dict]:
    res = client.get(WIKI_API, params={
        "action": "query", "list": "search", "srsearch": _keywords(query),
        "srlimit": limit, "format": "json", "formatversion": 2,
    })
    res.raise_for_status()
    titles = [hit["title"] for hit in res.json()["query"]["search"]]

    def fetch(title):
        r = client.get(WIKI_API, params={
            "action": "query", "prop": "extracts|info", "explaintext": 1, "inprop": "url",
            "titles": title, "format": "json", "formatversion": 2,
        })
        r.raise_for_status()
        page = r.json()["query"]["pages"][0]
        return {"title": page["title"], "url": page["fullurl"], "text": page.get("extract", "")}

    with ThreadPoolExecutor(max_workers=limit) as pool:
        return list(pool.map(fetch, titles))


def search_duckduckgo(query: str, limit: int = 5) -> list[dict]:
    from ddgs import DDGS

    results = DDGS().text(query, max_results=limit) or []
    return [{"title": r.get("title") or r["href"], "url": r["href"]} for r in results if r.get("href")]


# ---------- scraping ----------

def _allowed_by_robots(client: httpx.Client, url: str) -> bool:
    parts = urlparse(url)
    try:
        res = client.get(f"{parts.scheme}://{parts.netloc}/robots.txt")
    except httpx.HTTPError:
        return False
    if res.status_code >= 400:  # no robots.txt -> no restrictions
        return True
    parser = RobotFileParser()
    parser.parse(res.text.splitlines())
    return parser.can_fetch(USER_AGENT, url)


def scrape(client: httpx.Client, page: dict) -> dict | None:
    url = page["url"]
    if urlparse(url).scheme not in ("http", "https") or not _allowed_by_robots(client, url):
        return None
    try:
        res = client.get(url)
        res.raise_for_status()
    except httpx.HTTPError:
        return None
    if "html" not in res.headers.get("content-type", ""):
        return None
    text = trafilatura.extract(res.text, include_comments=False, include_tables=False)
    return {**page, "text": text} if text else None


def gather_pages(query: str) -> tuple[list[dict], list[str]]:
    """Returns (pages with extracted text, names of providers that failed)."""
    pages, failed = [], []
    with httpx.Client(headers=_HEADERS, timeout=WEB_TIMEOUT, follow_redirects=True) as client:
        try:
            pages += search_wikipedia(client, query)
        except (httpx.HTTPError, KeyError, ValueError):
            failed.append("Wikipedia")
        try:
            # Wikipedia is already covered through its API.
            hits = [h for h in search_duckduckgo(query) if "wikipedia.org" not in urlparse(h["url"]).netloc]
        except Exception:  # ddgs raises its own exception types on rate limits / blocks
            hits, failed = [], failed + ["DuckDuckGo"]
        with ThreadPoolExecutor(max_workers=max(1, len(hits))) as pool:
            pages += [p for p in pool.map(lambda h: scrape(client, h), hits) if p]

    seen, unique = set(), []
    for p in pages:
        text = (p["text"] or "").strip()
        if len(text) >= 200 and p["url"] not in seen:
            seen.add(p["url"])
            unique.append({**p, "text": text[:WEB_MAX_CHARS]})
    return unique[:WEB_MAX_PAGES], failed


# ---------- answer ----------

def answer_from_web(query: str) -> dict:
    query = query.strip()
    pages, failed = gather_pages(query)
    base = {"query": query, "fetched_on": date.today().isoformat(), "pages_read": len(pages),
            "failed_providers": failed}
    if not pages:
        return {**base, "sufficient": False, "answer": [], "sources": []}

    texts, chunks = {}, []
    for i, page in enumerate(pages):
        doc_id = f"web-{i}"
        texts[doc_id] = page["text"]
        meta = {
            "doc_id": doc_id,
            "title": page["title"],
            "publication": urlparse(page["url"]).netloc.removeprefix("www."),
            "content_type": "web",
            "url": page["url"],
        }
        for chunk in _splitter.create_documents([page["text"]], metadatas=[meta]):
            chunk.metadata["end_index"] = chunk.metadata["start_index"] + len(chunk.page_content)
            chunks.append(chunk)

    # Same scoring as the archive: cosine similarity == Chroma's relevance score for a cosine index.
    emb = get_embeddings()
    q_vec = np.array(emb.embed_query(query))
    scores = _cosine(np.array(emb.embed_documents([c.page_content for c in chunks])), q_vec)
    top = sorted(zip(chunks, scores.tolist()), key=lambda h: h[1], reverse=True)[:TOP_K]
    hits, q_terms = gate_hits(query, top)

    result = compose_answer({"query": query, "hits": hits, "q_terms": q_terms})

    # Web pages are not stored, so ship the passage context with the result for verification.
    for item in result["answer"] + result["sources"]:
        item["passage"] = passage_context(texts[item["doc_id"]], item["start"], item["end"])
    return {**base, **result}

