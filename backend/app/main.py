import json
import time
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel, Field

from . import auth
from .config import CONTENT_TYPES, CORS_ORIGINS
from .db import get_conn, init_db, log_search, row_to_dict
from .ingest import IngestError, delete_document, ingest_document
from .rag import answer_question, get_passage
from .vectorstore import get_vector_store

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    get_vector_store()  # load the embedding model once, before the first request
    yield


app = FastAPI(title="Media Archive Research Assistant API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

DOC_LIST_FIELDS = "id, title, author, publication, date, year, content_type, topic, url, file_name, chunk_count, created_at"


# ---------- auth ----------

class RegisterBody(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    name: str = Field(min_length=1)
    password: str = Field(min_length=8)


class LoginBody(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str


@app.post("/api/auth/register")
def register(body: RegisterBody):
    if auth.get_user_by_email(body.email):
        raise HTTPException(409, "An account with this email already exists")
    user = auth.create_user(body.email, body.name, body.password)
    return {"token": auth.create_token(user), "user": auth.public_user(user)}


@app.post("/api/auth/login")
def login(body: LoginBody):
    user = auth.get_user_by_email(body.email)
    if not user or not auth.verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Incorrect email or password")
    return {"token": auth.create_token(user), "user": auth.public_user(user)}


@app.get("/api/auth/me")
def me(user=Depends(auth.current_user)):
    return auth.public_user(user)


# ---------- search ----------

class SearchFilters(BaseModel):
    year_from: int | None = None
    year_to: int | None = None
    content_types: list[str] = []
    authors: list[str] = []
    publications: list[str] = []
    topics: list[str] = []


class SearchBody(BaseModel):
    query: str = Field(min_length=3, max_length=500)
    filters: SearchFilters = SearchFilters()


@app.post("/api/search")
def search(body: SearchBody, user=Depends(auth.current_user)):
    t0 = time.perf_counter()
    filters = body.filters.model_dump()
    result = answer_question(body.query, filters)
    result["took_ms"] = int((time.perf_counter() - t0) * 1000)
    log_search(user["id"], body.query, filters, len(result["sources"]), result["sufficient"])
    return result


@app.get("/api/searches")
def search_history(limit: int = 50, user=Depends(auth.current_user)):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM searches WHERE user_id = ? ORDER BY id DESC LIMIT ?", (user["id"], limit)
        ).fetchall()
    return [{**dict(r), "filters": json.loads(r["filters"]), "sufficient": bool(r["sufficient"])} for r in rows]


@app.delete("/api/searches")
def clear_history(user=Depends(auth.current_user)):
    with get_conn() as conn:
        conn.execute("DELETE FROM searches WHERE user_id = ?", (user["id"],))
    return {"ok": True}


@app.get("/api/facets")
def facets(user=Depends(auth.current_user)):
    with get_conn() as conn:
        def distinct(col):
            return [r[0] for r in conn.execute(
                f"SELECT DISTINCT {col} FROM documents WHERE {col} IS NOT NULL AND {col} != '' ORDER BY {col}")]
        years = conn.execute("SELECT MIN(year), MAX(year) FROM documents WHERE year IS NOT NULL").fetchone()
        return {
            "content_types": CONTENT_TYPES,
            "authors": distinct("author"),
            "publications": distinct("publication"),
            "topics": distinct("topic"),
            "year_min": years[0],
            "year_max": years[1],
        }


# ---------- documents ----------

@app.get("/api/documents")
def list_documents(q: str = "", content_type: str = "", sort: str = "date", limit: int | None = Query(None, ge=1),
                   user=Depends(auth.current_user)):
    sql = f"SELECT {DOC_LIST_FIELDS} FROM documents WHERE 1=1"
    params = []
    if q:
        sql += " AND (title LIKE ? OR author LIKE ? OR publication LIKE ? OR topic LIKE ?)"
        params += [f"%{q}%"] * 4
    if content_type:
        sql += " AND content_type = ?"
        params.append(content_type)
    # "recent" = most recently added to the archive, "date" = by publication date.
    sql += " ORDER BY created_at DESC, rowid DESC" if sort == "recent" else " ORDER BY date DESC, created_at DESC"
    if limit:
        sql += " LIMIT ?"
        params.append(limit)
    with get_conn() as conn:
        return [dict(r) for r in conn.execute(sql, params).fetchall()]


@app.post("/api/documents")
async def upload_document(
    title: str = Form(...),
    content_type: str = Form(...),
    author: str = Form(""),
    publication: str = Form(""),
    date: str = Form(""),
    topic: str = Form(""),
    url: str = Form(""),
    text: str = Form(""),
    file: UploadFile | None = File(None),
    user=Depends(auth.require_uploader),
):
    if file is None and not text.strip():
        raise HTTPException(400, "Attach a file or paste the document text")
    try:
        doc = ingest_document(
            title=title, content_type=content_type, author=author, publication=publication,
            date=date, topic=topic, url=url, uploaded_by=user["id"],
            text=text if file is None else None,
            file_name=file.filename if file else None,
            file_bytes=await file.read() if file else None,
        )
    except IngestError as e:
        raise HTTPException(400, str(e))
    doc.pop("text", None)
    doc.pop("file_path", None)
    return doc


@app.get("/api/documents/{doc_id}")
def get_document(doc_id: str, user=Depends(auth.current_user)):
    with get_conn() as conn:
        doc = row_to_dict(conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone())
    if not doc:
        raise HTTPException(404, "Document not found")
    doc.pop("file_path", None)
    return doc


@app.get("/api/documents/{doc_id}/passage")
def document_passage(doc_id: str, start: int = Query(ge=0), end: int = Query(ge=0),
                     user=Depends(auth.current_user)):
    passage = get_passage(doc_id, start, end)
    if passage is None:
        raise HTTPException(404, "Document not found")
    return passage


@app.get("/api/documents/{doc_id}/file")
def document_file(doc_id: str, user=Depends(auth.current_user)):
    with get_conn() as conn:
        doc = row_to_dict(conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone())
    if not doc:
        raise HTTPException(404, "Document not found")
    if doc["file_path"] and Path(doc["file_path"]).exists():
        return FileResponse(doc["file_path"], filename=doc["file_name"])
    return PlainTextResponse(doc["text"])


@app.delete("/api/documents/{doc_id}")
def remove_document(doc_id: str, user=Depends(auth.require_uploader)):
    if not delete_document(doc_id):
        raise HTTPException(404, "Document not found")
    return {"ok": True}


@app.get("/api/health")
def health():
    return {"ok": True}
