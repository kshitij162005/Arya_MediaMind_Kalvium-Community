"""SQLite store for users, document metadata/full text and search history.

Vectors live in Chroma (see rag.py); this database is the system of record
for documents so the original text can always be shown next to a citation.
"""
import json
import sqlite3
from contextlib import contextmanager

from .config import SQLITE_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'journalist',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    publication TEXT,
    date TEXT,               -- ISO yyyy-mm-dd
    year INTEGER,
    content_type TEXT NOT NULL,
    topic TEXT,
    url TEXT,
    file_name TEXT,
    file_path TEXT,
    text TEXT NOT NULL,
    chunk_count INTEGER NOT NULL DEFAULT 0,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    query TEXT NOT NULL,
    filters TEXT NOT NULL,
    result_count INTEGER NOT NULL,
    sufficient INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
"""


def connect():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def get_conn():
    conn = connect()
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        conn.executescript(SCHEMA)


def row_to_dict(row):
    return dict(row) if row else None


def log_search(user_id, query, filters, result_count, sufficient):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO searches (user_id, query, filters, result_count, sufficient) VALUES (?,?,?,?,?)",
            (user_id, query, json.dumps(filters), result_count, int(sufficient)),
        )
