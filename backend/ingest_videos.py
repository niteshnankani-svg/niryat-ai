"""
Ingest video session summaries into a SEPARATE ChromaDB collection.

Study material lives in `niryat_exim`; this script populates `niryat_videos`
so the two knowledge sources stay segregated and can be queried, weighted,
or re-ingested independently. One chunk per markdown section — the summaries
are already structured, so section-level chunks stay semantically coherent.

Run after build_video_db.py:  python3 ingest_videos.py
"""

import os
import json
import hashlib
import chromadb
from chromadb.utils import embedding_functions

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_VOLUME_MOUNT = os.environ.get("RAILWAY_VOLUME_MOUNT_PATH")
CHROMA_PATH = (
    os.path.join(_VOLUME_MOUNT, "chroma_store") if _VOLUME_MOUNT
    else os.path.join(SCRIPT_DIR, "chroma_db")
)
DB_JSON = os.path.join(SCRIPT_DIR, "data", "video_summaries", "video_summaries.json")
COLLECTION_NAME = "niryat_videos"


def ingest(force: bool = True) -> int:
    """
    Populate the niryat_videos collection. Returns the resulting doc count.
    If force=False, skips work (and returns the existing count) when the
    collection is already populated — used for the startup self-heal check,
    so a normal boot with an intact volume doesn't redo embedding work.
    """
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    if not force:
        try:
            existing = client.get_collection(COLLECTION_NAME, embedding_function=ef)
            if existing.count() > 0:
                return existing.count()
        except Exception:
            pass  # doesn't exist yet — fall through and build it

    with open(DB_JSON, encoding="utf-8") as f:
        db = json.load(f)

    # Rebuild from scratch so edits to summaries never leave stale chunks.
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"Dropped existing '{COLLECTION_NAME}'")
    except Exception:
        pass
    collection = client.create_collection(name=COLLECTION_NAME, embedding_function=ef)

    ids, docs, metas = [], [], []
    for session in db["sessions"]:
        for i, section in enumerate(session["sections"]):
            # Prefix each chunk with its session + section so the embedding
            # and the retrieved text both carry context.
            doc = (
                f"{session['title']} — {section['heading']}\n\n"
                f"{section['content']}"
            )
            ids.append(hashlib.md5(f"{session['slug']}_{i}".encode()).hexdigest())
            docs.append(doc)
            metas.append({
                "source_type": "course_video",
                "slug": session["slug"],
                "day": session["day"],
                "session_title": session["shortTitle"],
                "section": section["heading"],
                "chunk_index": i,
            })

    collection.upsert(ids=ids, documents=docs, metadatas=metas)
    print(f"Ingested {len(docs)} section-chunks from {db['count']} sessions "
          f"into '{COLLECTION_NAME}' (total: {collection.count()})")
    return collection.count()


def main():
    count = ingest(force=True)
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    # Sanity: confirm the study-material collection is untouched and separate.
    for c in client.list_collections():
        col = client.get_collection(c.name)
        print(f"  collection '{c.name}': {col.count()} docs")


if __name__ == "__main__":
    main()
