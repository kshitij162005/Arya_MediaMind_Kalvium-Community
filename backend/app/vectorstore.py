"""Embeddings + vector database (LangChain FastEmbed + Chroma)."""
from functools import lru_cache

from langchain_chroma import Chroma
from langchain_community.embeddings import FastEmbedEmbeddings

from .config import CHROMA_DIR, COLLECTION_NAME, EMBEDDING_MODEL, MODEL_CACHE_DIR


@lru_cache(maxsize=1)
def get_embeddings() -> FastEmbedEmbeddings:
    # Runs locally (ONNX), no API key needed.
    return FastEmbedEmbeddings(model_name=EMBEDDING_MODEL, cache_dir=str(MODEL_CACHE_DIR))


@lru_cache(maxsize=1)
def get_vector_store() -> Chroma:
    return Chroma(
        collection_name=COLLECTION_NAME,
        embedding_function=get_embeddings(),
        persist_directory=str(CHROMA_DIR),
        collection_metadata={"hnsw:space": "cosine"},
    )
