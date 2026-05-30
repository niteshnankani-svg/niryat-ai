import chromadb
from chromadb.utils import embedding_functions

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "niryat_exim"

ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)


def get_collection():
    return chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef,
    )


def query_chromadb(query_text: str, n_results: int = 5) -> dict:
    try:
        collection = get_collection()
        if collection.count() == 0:
            return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
        results = collection.query(
            query_texts=[query_text],
            n_results=min(n_results, collection.count()),
        )
        return results
    except Exception:
        return {"documents": [[]], "metadatas": [[]], "distances": [[]]}
