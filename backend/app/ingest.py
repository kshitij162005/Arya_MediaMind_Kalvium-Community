"""Document upload -> text extraction -> chunking -> embedding -> vector index."""
import io
import uuid
from datetime import date as date_cls

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import CHUNK_OVERLAP, CHUNK_SIZE, CONTENT_TYPES, UPLOAD_DIR
from .db import get_conn, row_to_dict
from .vectorstore import get_vector_store

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=["\n\n", "\n", ". ", " ", ""],
    add_start_index=True,
)


class IngestError(ValueError):
    pass


def extract_text(filename: str, data: bytes) -> str:
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in SUPPORTED_EXTENSIONS:
        raise IngestError(f"Unsupported file type '{ext or filename}'. Use PDF, DOCX, TXT or MD.")
    if ext == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(data))
        return "\n\n".join((page.extract_text() or "").strip() for page in reader.pages)
    if ext == ".docx":
        import docx

        return "\n\n".join(p.text for p in docx.Document(io.BytesIO(data)).paragraphs if p.text.strip())
    return data.decode("utf-8", errors="replace")


def _normalize(text: str) -> str:
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").split("\n")]
    return "\n".join(lines).strip()


def ingest_document(*, title, content_type, text=None, file_name=None, file_bytes=None,
                    author="", publication="", date="", topic="", url="", uploaded_by=None) -> dict:
    if content_type not in CONTENT_TYPES:
        raise IngestError(f"content_type must be one of {CONTENT_TYPES}")
    if not title.strip():
        raise IngestError("Title is required")

    year = None
    if date:
        try:
            year = date_cls.fromisoformat(date).year
        except ValueError:
            raise IngestError("Date must be in YYYY-MM-DD format")

    doc_id = uuid.uuid4().hex[:12]
    file_path = None
    if file_bytes is not None:
        text = extract_text(file_name, file_bytes)
        file_path = UPLOAD_DIR / f"{doc_id}_{file_name}"
        file_path.write_bytes(file_bytes)

    text = _normalize(text or "")
    if len(text) < 20:
        raise IngestError("No readable text found in this document")

    meta = {
        "doc_id": doc_id,
        "title": title.strip(),
        "author": author.strip(),
        "publication": publication.strip(),
        "date": date,
        "year": year or 0,
        "content_type": content_type,
        "topic": topic.strip(),
    }

    chunks = _splitter.create_documents([text], metadatas=[meta])
    for i, chunk in enumerate(chunks):
        chunk.metadata["chunk_index"] = i
        chunk.metadata["end_index"] = chunk.metadata["start_index"] + len(chunk.page_content)

    get_vector_store().add_documents(chunks, ids=[f"{doc_id}:{i}" for i in range(len(chunks))])

    with get_conn() as conn:
        conn.execute(
            """INSERT INTO documents (id, title, author, publication, date, year, content_type, topic,
               url, file_name, file_path, text, chunk_count, uploaded_by)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (doc_id, meta["title"], meta["author"], meta["publication"], date or None, year,
             content_type, meta["topic"], url.strip() or None, file_name, str(file_path) if file_path else None,
             text, len(chunks), uploaded_by),
        )
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone()
    return row_to_dict(row)


def delete_document(doc_id: str) -> bool:
    with get_conn() as conn:
        row = row_to_dict(conn.execute("SELECT * FROM documents WHERE id = ?", (doc_id,)).fetchone())
        if not row:
            return False
        conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
    get_vector_store().delete(ids=[f"{doc_id}:{i}" for i in range(row["chunk_count"])])
    if row["file_path"]:
        from pathlib import Path

        Path(row["file_path"]).unlink(missing_ok=True)
    return True
