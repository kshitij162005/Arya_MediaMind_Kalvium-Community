# Product Requirements Document (PRD)

## Product Name
**MediaMind: Media Archive Research Assistant**

| | |
|---|---|
| **Version** | 2.0 (MVP delivered + post-MVP features) |
| **Last updated** | 16 October 2026 |
| **Status** | MVP complete. All 10 functional requirements implemented. |
| **Setup and technical docs** | [README.md](README.md) |

### Revision history

| Version | Changes |
|---|---|
| 1.0 | Initial requirements and MVP scope. |
| 2.0 | Implementation status for every requirement; documented design decisions; added post-MVP features (opt-in web fallback, save to archive, home dashboard, personalisation settings, copy with citations); measured performance; known gaps and roadmap. |

## 1. Problem Statement

A media company has decades of articles, interview transcripts, and archived footage notes. Journalists struggle to quickly find relevant historical information while working on developing stories.

The product should allow journalists to **search the company's archive using natural language**, retrieve relevant historical context, and see **accurate source attribution** for every piece of information.

## 2. Goal

Build an internal research assistant that helps journalists:

- Find relevant historical content quickly.
- Understand the background/context of a developing story.
- Verify information against original sources.
- Easily identify where each piece of information came from.

## 3. Target Users

### Primary User
**Journalists / Reporters**

### Secondary Users
- Editors
- Researchers
- Archive teams

## 4. Key Product Principle

> **The AI should never be more authoritative than the archive.**

Every generated answer should be **grounded in retrieved company sources, transparent about its evidence, and easy for a journalist to verify.**

### How the product enforces this principle

This principle drove the main design decision: **answers are extractive, not generated.**

| Decision | Why |
|---|---|
| Answers are made only of sentences copied **verbatim** from archived documents. No language model writes or rewords text. | The system can't state anything the archive doesn't say, so made-up claims are impossible by design. |
| Every sentence stores its exact position in the source document. | Citations can be checked down to the exact sentence, not just the document. |
| A **hybrid relevance check** (meaning match plus keyword overlap) must pass before anything counts as evidence. | Stops the system from stretching an unrelated document into an answer. |
| When nothing passes, the product says **"Not enough information in the archive"** and generates nothing. | An honest "I don't know" is worth more than a plausible guess. |
| Web results are **opt-in, visually separated and labelled "unverified"**, and never mixed into archive answers. | Outside information can't be mistaken for verified archive content. |

## 5. Core Functionalities

Each section below gives the original requirement, followed by how it was delivered.

### 5.1 Archive Upload & Indexing

The system should allow authorized users to upload/archive articles, interview transcripts, footage notes, PDFs/documents and text files. For each document, store metadata such as title, date, author, source/publication, content type and URL/file reference. The system should process and index the content for search.

**Delivered:**
- Upload of **PDF, DOCX, TXT and MD** files, or pasted text.
- Details stored for each document: title, date, author, publication, content type (article, interview, footage notes, document), topic and URL. The original file is kept for download.
- Processing: text extraction, then splitting into passages (800 characters with 120 overlap), then a local embedding model (`bge-small-en-v1.5`), then the ChromaDB vector index. The full text is also stored in SQLite as the source of truth.
- The Archive view shows counts per type, a document table, search, filter-by-type tiles and delete (which removes the document from every store).

### 5.2 Natural Language Search

Journalists should be able to search the archive using questions rather than exact keywords, e.g. *"What happened during the 2019 protests in Mumbai?"*, and get back relevant articles, interviews, footage notes and historical events.

**Delivered:** semantic search over passage embeddings, so a question finds relevant passages even when the words differ. Suggested questions on the home screen are built from the most recently added documents.

### 5.3 Contextual Answer Generation

The system should generate a concise answer based **only on retrieved archive content**, giving historical context instead of requiring the journalist to read dozens of documents.

**Delivered:** a **"Background"** answer of up to 6 sentences, picked by relevance and with near-duplicates removed, then **ordered chronologically** by source date so it reads as a timeline of events.

### 5.4 Source Attribution

Every generated claim should have a source reference. Sources should display title, author, publication date, source type and a link or archive reference. Journalists should be able to open the original source.

**Delivered:** every sentence has a numbered citation. Source cards show title, type, author, publication, date, a snippet and the match score, plus actions to view the passage or open the document.

### 5.5 Search Results

Along with the answer, show the underlying documents.

**Delivered:** a **Sources** list, with cited sources first and then *"Related, not cited"* documents that matched but weren't quoted. Users can hide related sources in Settings.

### 5.6 Source Verification

Journalists should be able to click a citation and see the **exact relevant passage** from the original document, to prevent misinterpretation, made-up information and incorrect attribution.

**Delivered:** clicking a citation opens a side panel that shows the claim, then the **exact sentence highlighted** within about 600 characters of surrounding text. **Open full document** shows the whole original, scrolled to the highlighted passage, with the uploaded file available to download.

### 5.7 Filters

Results should be filterable by date/year, content type, author, publication/source and topic.

**Delivered:** all five filters. Their options (authors, publications, topics, year range) come from the actual archive contents. Changing a filter re-runs the current search. Topic chips on the home screen run a search with that topic filter applied.

## 6. Basic User Flow

```text
Journalist enters question (optionally with filters)
        ↓
System searches archive (semantic retrieval, filters applied)
        ↓
Relevant passages retrieved → relevance check (meaning + keywords)
        ↓
Most relevant sentences extracted verbatim, ordered by date
        ↓
Citations attached to every sentence
        ↓
Journalist clicks a citation → exact passage highlighted
        ↓
Original document opened
        ↓
(If nothing found: "Not enough information" → optional, labelled web search → optional save to archive)
```

## 7. Functional Requirements: Status

| ID | Requirement | Status | Implementation |
|---|---|---|---|
| FR1 | Authorized users can upload archive documents | ✅ Done | `POST /api/documents`; login required. *Role limits: see §11.* |
| FR2 | System extracts and indexes document content | ✅ Done | `ingest.py`: pypdf, python-docx, LangChain splitter, FastEmbed, ChromaDB |
| FR3 | Users can search using natural-language queries | ✅ Done | `POST /api/search` |
| FR4 | System retrieves semantically relevant documents | ✅ Done | Vector similarity in ChromaDB, plus the hybrid relevance check |
| FR5 | System generates answers from retrieved documents | ✅ Done | Extractive answer chain in `rag.py` (LangChain LCEL) |
| FR6 | Every answer must provide source attribution | ✅ Done | Every sentence carries a citation number and its exact position in the source |
| FR7 | Users can view the exact source passage behind a citation | ✅ Done | `GET /api/documents/{id}/passage` and the passage side panel |
| FR8 | Users can open the original document | ✅ Done | `GET /api/documents/{id}` and `/file`, and the document viewer |
| FR9 | Users can filter results by date, author, source and content type | ✅ Done | Plus topic. Chroma metadata filters. |
| FR10 | System should clearly indicate when sufficient information is not found | ✅ Done | `sufficient: false` and the "Not enough information in the archive" message |

## 8. Non-Functional Requirements: Status

| Requirement | Target | Status |
|---|---|---|
| **Accuracy** | Source-grounded answers; no unsupported claims | ✅ Met by design: extractive answers can't contain text that isn't in a source. The relevance check refuses weak matches. |
| **Performance** | A few seconds for normal queries | ✅ Archive search takes **~0.1–0.5 s** on a laptop CPU. The opt-in web search takes ~10–15 s because it fetches live pages. |
| **Security** | Only authorized employees can access internal archives | ⚠️ Partial: every data endpoint needs a login (PBKDF2-hashed passwords, JWT sessions). Open sign-up and broad upload rights remain (see §11). |
| **Scalability** | Millions of archived documents | ⚠️ Not yet: the current storage (SQLite + embedded Chroma) suits demo and team-sized archives. The migration path is in §11. |

## 9. MVP Scope: Delivered

| # | MVP item | Status |
|---|---|---|
| 1 | Document upload | ✅ |
| 2 | Document processing/indexing | ✅ |
| 3 | Natural-language search | ✅ |
| 4 | AI-generated contextual answers | ✅ Extractive (see §4) |
| 5 | Citations/source attribution | ✅ |
| 6 | Source passage preview | ✅ |
| 7 | Basic filters | ✅ |
| 8 | User authentication | ✅ |

### Out of Scope for MVP (unchanged)

- Automated news writing
- Publishing articles
- Social-media monitoring
- Video generation
- Journalist collaboration tools
- Automated fact-checking against the entire internet
- Complex newsroom workflow management

> **Note on the web fallback (§10.1):** this is *not* automated fact-checking against the internet. It is a manual research aid that the journalist triggers only after the archive has no answer. It never checks or changes archive answers, and its results are always labelled unverified.

## 10. Post-MVP Features (Delivered)

### 10.1 Opt-in web fallback
- **Trigger:** when the archive has no answer, a **"Search the web instead"** button appears. It never runs automatically, and it can be turned off in Settings.
- **Sources:** the Wikipedia API (official and stable) and DuckDuckGo. Pages that disallow crawlers in `robots.txt` are skipped. No API keys and no cost.
- **Same method as the archive:** answers are verbatim and cited, and the passage view works the same way.
- **Kept separate:** a distinct "From the web" section, marked *"Not from the archive and not verified by the newsroom"*. Web pages are processed in memory and **not** added to the archive automatically.

### 10.2 Save web sources to the archive
- **Save to archive** on any web source opens the upload form prefilled with the title, author, date and publication (extracted from the page), plus the URL and full text. **Everything is editable before saving.**
- Saved pages are indexed like any upload and are then marked **"✓ In archive"** in future web results (matched by URL), which prevents duplicates.

### 10.3 Search home dashboard
- **Archive stats:** documents (with a breakdown by type), searchable passages, years covered, and your searches with the share answered from the archive.
- **Activity:** recently added documents (open in the viewer), recent searches (run again in one click), and topic chips that run a filtered search.

### 10.4 Personalisation (Settings)
- **Appearance:** light, dark or system theme, 6 accent colours, comfortable or compact density, three text sizes, serif or sans typeface for answers, with a live preview.
- **Search preferences:** show or hide related sources, match scores, the home dashboard and the web fallback offer.
- **Account:** name, email, role and sign out. Preferences are stored per device.

### 10.5 Research workflow helpers
- **Copy with citations:** copies the answer with `[n]` markers and a formatted source list for pasting into drafts.
- **Search history:** grouped by day, with answered and not-found status, filter indicators and one-click re-run.
- **Keyboard:** `/` focuses search, and `Esc` closes panels.
- **Responsive layout:** works on phones and tablets.

## 11. Known Gaps & Roadmap

| Area | Gap | Planned approach |
|---|---|---|
| **Access control** | Anyone who can reach the app can register, and all roles can upload and delete. | Restrict sign-up to the company email domain or invites; role-based permissions (journalist: search; archivist: upload; admin: delete and manage users). |
| **Scalability** | SQLite + embedded Chroma; uploads are indexed while the user waits. | Postgres + pgvector (or a managed vector DB), background indexing jobs, bulk import. |
| **Answer fluency** | Verbatim sentences can read less smoothly than written prose. | Optional rewording step with strict claim checking against the cited passages. |
| **Retrieval quality** | Relevance thresholds are hand-tuned. | Cross-encoder re-ranking; an evaluation set of real journalist questions. |
| **Citations** | Citations point to text positions, not PDF page numbers. | Store page boundaries at extraction time and show page numbers. |
| **Feedback** | No signal on answer quality. | Helpful / wrong-citation feedback on each answer, feeding the success metrics below. |
| **Exploration** | Results are a list. | Timeline view of events, "more like this" for each source. |

## 12. Success Metrics

The MVP will be considered successful if:

| Metric | How MediaMind supports measuring it |
|---|---|
| Journalists find relevant historical sources significantly faster than manual archive searches | Response time is shown on every answer; search history records every query. |
| Most generated claims have valid source citations | **100% by construction:** every answer sentence is a verbatim quote with a citation. |
| Journalists can trace an answer back to the original document | Citation → exact highlighted passage → full original, in two clicks. |
| Search results are relevant to the journalist's query | Answered vs not-found rate shown on the dashboard and in history; match score on every source. |
| The system does not present unsupported information as fact | Extractive answers plus the relevance check; web content always labelled unverified. |
