# MediaMind: Media Archive Research Assistant

An internal research assistant that lets journalists ask the archive questions in plain language and get a short, cited background answer. Every sentence links back to the exact passage in the original document. See [media_archive_research_assistant_prd.md](media_archive_research_assistant_prd.md) for the full requirements.

## How it works (RAG pipeline)

```
Upload (PDF / DOCX / TXT / MD / pasted text) + metadata
   → text extraction → chunking (LangChain RecursiveCharacterTextSplitter)
   → embeddings (BAAI/bge-small-en-v1.5 via FastEmbed, runs locally)
   → vector database (ChromaDB)

Question
   → retrieve top chunks from Chroma (with metadata filters)
   → hybrid relevance gate (vector score + keyword overlap)
   → extractive answer: the most relevant sentences, copied verbatim, each cited
   → "not enough information" when nothing passes the gate
```

The retrieve → compose steps are orchestrated as a LangChain (LCEL) runnable chain in [backend/app/rag.py](backend/app/rag.py).

**No LLM is used.** Answers are made only of sentences that exist word for word in the archive, so the system can't state anything the sources don't say ("the AI should never be more authoritative than the archive"). Each citation stores the character offsets of its sentence, so the UI can show the exact passage highlighted in the original.

| PRD requirement | Where |
|---|---|
| FR1/FR2 upload, extract and index | `POST /api/documents`, [ingest.py](backend/app/ingest.py) |
| FR3/FR4 natural language and semantic retrieval | `POST /api/search`, [rag.py](backend/app/rag.py) |
| FR5/FR6 answer with source attribution | extractive answer; every sentence has a citation |
| FR7 exact passage | `GET /api/documents/{id}/passage`, the side panel in the UI |
| FR8 open original | `GET /api/documents/{id}` and `/file`, the document viewer |
| FR9 filters | year range, content type, author, publication, topic |
| FR10 insufficient information | `sufficient: false`, shown as "Not enough information in the archive" |
| Auth | email + password, PBKDF2 hashes, JWT bearer tokens |

## Project layout

```
backend/            FastAPI + LangChain + ChromaDB (Python)
  app/main.py         API routes
  app/rag.py          retrieval + extractive answer chain
  app/ingest.py       extraction, chunking, indexing
  app/vectorstore.py  embeddings + Chroma
  app/db.py           SQLite: users, document metadata/text, search history
  seed.py             demo user + 10 fictional sample documents
  data/               created at runtime (SQLite, Chroma, uploads, model cache)
frontend/           React + Vite UI
  src/components/     Login, Search, Filters, Sources, Passage panel, Archive, Upload, History
  _old/               backup of the previous static UI (not used by the app)
```

## Running locally

Requirements: Python 3.10+ and Node 18+.

**1. Backend** (first run downloads the ~65 MB embedding model):

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python seed.py            # demo user + sample archive (use --reset to start over)
.venv/bin/uvicorn app.main:app --reload --port 8000
```

**2. Frontend** (in a second terminal):

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in with **demo@mediamind.news / demo1234**, or create an account. The Vite dev server proxies `/api` to the backend on port 8000.

Try *"What happened during the 2019 protests in Mumbai?"*, then turn on the **Interview** filter, or ask something the archive can't answer (e.g. *"Who won the 2011 cricket world cup?"*) to see the "not found" state.

## Configuration

Environment variables (all optional): `JWT_SECRET` (**set this in any shared deployment**), `JWT_TTL_HOURS`, `DATA_DIR`, `EMBEDDING_MODEL`, `CORS_ORIGINS`. Retrieval thresholds are in [backend/app/config.py](backend/app/config.py).

The sample documents in `seed.py` are fictional and exist only for demo purposes.
