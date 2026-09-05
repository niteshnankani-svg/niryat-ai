import os
import chromadb
from chromadb.utils import embedding_functions

# On Railway, once a volume is attached to this service, RAILWAY_VOLUME_MOUNT_PATH
# is auto-injected and points at the persistent mount — use it so embeddings
# survive redeploys instead of living on the container's ephemeral disk.
# Subfolder name is "chroma_store" (not "chroma_db") to avoid colliding with
# an earlier self-heal run that already created a "chroma_db" dir on the volume.
_VOLUME_MOUNT = os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")
CHROMA_PATH = os.path.join(_VOLUME_MOUNT, "chroma_store") if _VOLUME_MOUNT else "./chroma_db"

STUDY_COLLECTION = "niryat_exim"      # official study material / documents
VIDEO_COLLECTION = "niryat_videos"    # live course video session summaries

ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)


def get_collection(name: str = STUDY_COLLECTION):
    return chroma_client.get_or_create_collection(
        name=name,
        embedding_function=ef,
    )


def _query(name: str, query_text: str, n_results: int) -> dict:
    try:
        collection = get_collection(name)
        if collection.count() == 0:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        return collection.query(
            query_texts=[query_text],
            n_results=min(n_results, collection.count()),
        )
    except Exception:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}


def query_chromadb(query_text: str, n_results: int = 3) -> dict:
    """Study-material collection only (kept for backwards compatibility)."""
    return _query(STUDY_COLLECTION, query_text, n_results)


def query_videos(query_text: str, n_results: int = 3) -> dict:
    """Video-summary collection only."""
    return _query(VIDEO_COLLECTION, query_text, n_results)


def collection_counts() -> dict:
    """Doc counts for both collections — used by /health to confirm the
    persistent volume actually has data, not just that it's mounted."""
    counts = {}
    for name in (STUDY_COLLECTION, VIDEO_COLLECTION):
        try:
            counts[name] = get_collection(name).count()
        except Exception:
            counts[name] = None
    return counts


def query_labeled_context(query_text: str, n_study: int = 3, n_video: int = 3) -> str:
    """
    Query BOTH knowledge sources and return a single context string in which
    every chunk is labeled by origin, so the LLM can attribute its answer to
    the live course sessions vs. the official study material.
    """
    blocks = []

    video = _query(VIDEO_COLLECTION, query_text, n_video)
    for doc, meta in zip(video["documents"][0], video["metadatas"][0]):
        label = meta.get("session_title", "Live session")
        blocks.append(f"[COURSE VIDEO — {label}]\n{doc}")

    study = _query(STUDY_COLLECTION, query_text, n_study)
    for doc, meta in zip(study["documents"][0], study["metadatas"][0]):
        label = meta.get("source", "document")
        blocks.append(f"[STUDY MATERIAL — {label}]\n{doc}")

    return "\n---\n".join(blocks)
