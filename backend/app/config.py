import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data"))
UPLOAD_DIR = DATA_DIR / "uploads"
CHROMA_DIR = DATA_DIR / "chroma"
MODEL_CACHE_DIR = DATA_DIR / "models"
SQLITE_PATH = DATA_DIR / "archive.db"

for d in (DATA_DIR, UPLOAD_DIR, CHROMA_DIR, MODEL_CACHE_DIR):
    d.mkdir(parents=True, exist_ok=True)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_TTL_HOURS = int(os.getenv("JWT_TTL_HOURS", "12"))

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
COLLECTION_NAME = "archive"

CHUNK_SIZE = 800
CHUNK_OVERLAP = 120

# Retrieval / answer tuning
TOP_K = 8                  # chunks retrieved from the vector store
MIN_RELEVANCE = 0.50       # below this a chunk is never evidence
MIN_RELATED = 0.55        # uncited sources below this are not listed as related
STRONG_RELEVANCE = 0.68    # above this a chunk/sentence is evidence even with no shared keywords
ANSWER_SENTENCES = 6       # max sentences in the extractive answer
MIN_SENTENCE_SCORE = 0.53  # a sentence must be at least this close to the query

# Opt-in web fallback
WEB_MAX_PAGES = 6          # pages read per web search
WEB_MAX_CHARS = 20_000     # text embedded per page (keeps embedding fast)
WEB_SAVE_MAX_CHARS = 200_000  # text offered for "Save to archive" per page
WEB_TIMEOUT = 8.0          # seconds per HTTP request

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

CONTENT_TYPES = ["article", "interview", "footage_notes", "document"]
