"""
NiryatAI Document Ingestion Pipeline
Walks through niryat-data/ folder, extracts text from PDF/XLSX/DOCX files,
chunks them, embeds with sentence-transformers, and stores in ChromaDB.
"""

import os
import re
import hashlib
import pdfplumber
import pandas as pd
from docx import Document
import chromadb
from chromadb.utils import embedding_functions

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "niryat-data")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "backend", "chroma_db")
COLLECTION_NAME = "niryat_exim"
CHUNK_SIZE = 400
CHUNK_OVERLAP = 50


def extract_pdf(filepath: str) -> str:
    text = ""
    try:
        with pdfplumber.open(filepath) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"  Error reading PDF {filepath}: {e}")
    return text


def extract_xlsx(filepath: str) -> str:
    text = ""
    try:
        xls = pd.ExcelFile(filepath)
        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            text += f"\n--- Sheet: {sheet_name} ---\n"
            text += df.to_string(index=False) + "\n"
    except Exception as e:
        print(f"  Error reading XLSX {filepath}: {e}")
    return text


def extract_docx(filepath: str) -> str:
    text = ""
    try:
        doc = Document(filepath)
        for para in doc.paragraphs:
            if para.text.strip():
                text += para.text + "\n"
    except Exception as e:
        print(f"  Error reading DOCX {filepath}: {e}")
    return text


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    words = text.split()
    if len(words) <= chunk_size:
        return [text.strip()] if text.strip() else []

    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        start = end - overlap
    return chunks


EXTRACTORS = {
    ".pdf": extract_pdf,
    ".xlsx": extract_xlsx,
    ".xls": extract_xlsx,
    ".docx": extract_docx,
}


def main():
    data_dir = os.path.abspath(DATA_DIR)
    print(f"Scanning: {data_dir}")

    if not os.path.exists(data_dir):
        print(f"Data directory not found: {data_dir}")
        return

    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=ef,
    )

    print(f"ChromaDB collection '{COLLECTION_NAME}' — existing docs: {collection.count()}")

    all_chunks = []
    all_ids = []
    all_metadatas = []

    for root, _, files in os.walk(data_dir):
        for filename in sorted(files):
            filepath = os.path.join(root, filename)
            ext = os.path.splitext(filename)[1].lower()

            if ext not in EXTRACTORS:
                continue

            print(f"Processing: {filename}")
            text = EXTRACTORS[ext](filepath)

            if not text.strip():
                print(f"  No text extracted, skipping.")
                continue

            text = re.sub(r"\n{3,}", "\n\n", text)
            chunks = chunk_text(text)
            print(f"  Extracted {len(text)} chars → {len(chunks)} chunks")

            for i, chunk in enumerate(chunks):
                doc_id = hashlib.md5(f"{filename}_{i}".encode()).hexdigest()
                all_chunks.append(chunk)
                all_ids.append(doc_id)
                all_metadatas.append({
                    "source": filename,
                    "chunk_index": i,
                    "folder": os.path.basename(root),
                })

    if not all_chunks:
        print("No documents found to ingest.")
        return

    batch_size = 100
    for i in range(0, len(all_chunks), batch_size):
        batch_end = min(i + batch_size, len(all_chunks))
        collection.upsert(
            ids=all_ids[i:batch_end],
            documents=all_chunks[i:batch_end],
            metadatas=all_metadatas[i:batch_end],
        )
        print(f"  Upserted batch {i // batch_size + 1} ({batch_end}/{len(all_chunks)})")

    print(f"\nDone! Total docs in collection: {collection.count()}")


if __name__ == "__main__":
    main()
