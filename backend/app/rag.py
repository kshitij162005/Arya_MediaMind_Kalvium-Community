"""RAG pipeline: retrieve from Chroma -> extractive, cited answer.

The answer is built only from sentences that exist verbatim in retrieved
archive passages ("the AI should never be more authoritative than the
archive"). Every answer sentence carries a citation pointing to the exact
character span in the original document.
"""
import re

import numpy as np
from langchain_core.runnables import RunnableLambda

from .config import ANSWER_SENTENCES, MIN_RELEVANCE, MIN_RELATED, MIN_SENTENCE_SCORE, STRONG_RELEVANCE, TOP_K
from .db import get_conn
from .vectorstore import get_embeddings, get_vector_store

_SENTENCE_RE = re.compile(r"[^.!?\n]+(?:[.!?]+[\"”’')\]]*|$)")
_WORD_RE = re.compile(r"[a-z0-9]+")
_STOPWORDS = set("""
a an the and or but of in on at to for from by with about into over after before during between
is are was were be been being do does did has have had what which who whom whose when where why how
this that these those it its as than then there their they them he she his her we our you your i
not no can could would should will shall may might must also any all some more most such very
tell me give show explain describe happen happened happens know information info news
""".split())


def _terms(text: str) -> set[str]:
    """Content words, crudely stemmed by prefix, for the lexical half of hybrid scoring."""
    return {w[:5] for w in _WORD_RE.findall(text.lower()) if w not in _STOPWORDS and (len(w) > 2 or w.isdigit())}


def _overlap(query_terms: set[str], text: str) -> float:
    return len(query_terms & _terms(text)) / len(query_terms) if query_terms else 0.0


# ---------- filters ----------

def build_where(filters: dict) -> dict | None:
    clauses = []
    if filters.get("year_from"):
        clauses.append({"year": {"$gte": int(filters["year_from"])}})
    if filters.get("year_to"):
        clauses.append({"year": {"$lte": int(filters["year_to"])}})
    for key, field in (("content_types", "content_type"), ("authors", "author"),
                       ("publications", "publication"), ("topics", "topic")):
        values = [v for v in filters.get(key) or [] if v]
        if values:
            clauses.append({field: {"$in": values}})
    if not clauses:
        return None
    return clauses[0] if len(clauses) == 1 else {"$and": clauses}


# ---------- pipeline steps ----------

def gate_hits(query: str, hits: list) -> tuple[list, set[str]]:
    """Hybrid gate: a chunk counts as evidence only if it is semantically close AND shares
    vocabulary with the question (or is very close semantically). This is what lets the
    system say "not found" instead of stretching an unrelated document into an answer."""
    q_terms = _terms(query)
    evidence = [
        (doc, score) for doc, score in hits
        if score >= STRONG_RELEVANCE or (score >= MIN_RELEVANCE and _overlap(q_terms, doc.page_content) > 0)
    ]
    return evidence, q_terms


def retrieve(inputs: dict) -> dict:
    hits = get_vector_store().similarity_search_with_relevance_scores(
        inputs["query"], k=TOP_K, filter=build_where(inputs.get("filters") or {})
    )
    evidence, q_terms = gate_hits(inputs["query"], hits)
    return {**inputs, "hits": evidence, "q_terms": q_terms}


def _split_sentences(text: str, base_offset: int):
    for m in _SENTENCE_RE.finditer(text):
        raw = m.group(0)
        stripped = raw.strip()
        if len(stripped.split()) < 6 or stripped.endswith("?"):  # skip headings, fragments, questions
            continue
        start = base_offset + m.start() + (len(raw) - len(raw.lstrip()))
        yield stripped, start, start + len(stripped)


def _cosine(matrix: np.ndarray, vec: np.ndarray) -> np.ndarray:
    return matrix @ vec / (np.linalg.norm(matrix, axis=1) * np.linalg.norm(vec) + 1e-9)


def compose_answer(inputs: dict) -> dict:
    hits = inputs["hits"]
    if not hits:
        return {"query": inputs["query"], "sufficient": False, "answer": [], "sources": []}

    # Number sources by best-matching chunk.
    sources: dict[str, dict] = {}
    for doc, score in hits:
        m = doc.metadata
        src = sources.get(m["doc_id"])
        if src is None or score > src["score"]:
            sources[m["doc_id"]] = {
                "doc_id": m["doc_id"],
                "title": m["title"],
                "author": m.get("author") or None,
                "publication": m.get("publication") or None,
                "date": m.get("date") or None,
                "content_type": m["content_type"],
                "topic": m.get("topic") or None,
                "url": m.get("url") or None,
                "score": round(float(score), 3),
                "snippet": doc.page_content,
                "start": m["start_index"],
                "end": m["end_index"],
            }
    ordered = sorted(sources.values(), key=lambda s: s["score"], reverse=True)
    for n, src in enumerate(ordered, start=1):
        src["n"] = n

    # Candidate sentences from retrieved chunks (deduplicated across overlaps).
    candidates, seen = [], set()
    for doc, chunk_score in hits:
        m = doc.metadata
        for text, start, end in _split_sentences(doc.page_content, m["start_index"]):
            key = (m["doc_id"], text)
            if key in seen:
                continue
            seen.add(key)
            candidates.append({"text": text, "doc_id": m["doc_id"], "start": start, "end": end,
                               "chunk_score": chunk_score})

    if not candidates:
        return {"query": inputs["query"], "sufficient": False, "answer": [], "sources": ordered}

    emb = get_embeddings()
    q_vec = np.array(emb.embed_query(inputs["query"]))
    s_vecs = np.array(emb.embed_documents([c["text"] for c in candidates]))
    sims = _cosine(s_vecs, q_vec)
    for c, sim in zip(candidates, sims):
        c["sim"] = float(sim)
        c["lex"] = _overlap(inputs["q_terms"], c["text"])
        c["score"] = 0.6 * c["sim"] + 0.25 * float(c["chunk_score"]) + 0.15 * c["lex"]

    # Greedy selection with redundancy filter (simple MMR).
    picked: list[int] = []
    for i in sorted(range(len(candidates)), key=lambda i: candidates[i]["score"], reverse=True):
        c = candidates[i]
        if len(picked) >= ANSWER_SENTENCES:
            break
        if c["sim"] < MIN_SENTENCE_SCORE or (c["lex"] == 0 and c["sim"] < STRONG_RELEVANCE):
            continue
        if any(_cosine(s_vecs[[j]], s_vecs[i])[0] > 0.9 for j in picked):
            continue
        picked.append(i)

    if not picked:
        return {"query": inputs["query"], "sufficient": False, "answer": [], "sources": ordered}

    # Present claims chronologically, then in document order — reads as a background narrative.
    def order_key(i):
        src = sources[candidates[i]["doc_id"]]
        return (src["date"] or "9999", src["n"], candidates[i]["start"])

    claims = [candidates[i] for i in sorted(picked, key=order_key)]

    # Renumber: cited sources in order of first citation, then the remaining retrieved ones.
    cited_ids = list(dict.fromkeys(c["doc_id"] for c in claims))
    related = [s for s in ordered if s["doc_id"] not in cited_ids and s["score"] >= MIN_RELATED]
    final = [sources[d] for d in cited_ids] + related
    for n, src in enumerate(final, start=1):
        src["n"] = n
        src["cited"] = src["doc_id"] in cited_ids

    answer = [{
        "text": c["text"],
        "source": sources[c["doc_id"]]["n"],
        "doc_id": c["doc_id"],
        "start": c["start"],
        "end": c["end"],
        "confidence": round(c["sim"], 3),
    } for c in claims]

    return {"query": inputs["query"], "sufficient": True, "answer": answer, "sources": final}


# LangChain (LCEL) orchestration: retrieve | compose
rag_chain = RunnableLambda(retrieve) | RunnableLambda(compose_answer)


def answer_question(query: str, filters: dict | None = None) -> dict:
    return rag_chain.invoke({"query": query.strip(), "filters": filters or {}})


# ---------- passage lookup for citation verification ----------

def get_passage(doc_id: str, start: int, end: int, context_chars: int = 600) -> dict | None:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
    if not row:
        return None
    return passage_context(row["text"], start, end, context_chars)


def passage_context(text: str, start: int, end: int, context_chars: int = 600) -> dict:
    start, end = max(0, start), min(len(text), end)
    before_start = max(0, start - context_chars)
    after_end = min(len(text), end + context_chars)
    return {
        "before": ("…" if before_start > 0 else "") + text[before_start:start],
        "passage": text[start:end],
        "after": text[end:after_end] + ("…" if after_end < len(text) else ""),
    }
