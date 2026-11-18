"""
Universal Document Importer & Vector Indexer.
Extracts text from PDF, DOCX, TXT, CSV, XLSX, and JSON files, chunks them semantically,
and directly indexes them into the PCIS FAISS Vector Store.
"""

import os
import io
import re
import json
import time
import shutil
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

import pandas as pd
from langchain_core.documents import Document
from src.ai.vectorstore.faiss_store import PCISVectorStore
from src.config.database import DatabaseManager

logger = logging.getLogger(__name__)


class UniversalDocumentImporter:
    """
    Universal document processor that supports text extraction from multiple file formats,
    splits them into semantic chunks, and indexes them into the FAISS vector database.
    """

    UPLOAD_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "uploaded_documents")
    )

    def __init__(self, chunk_size: int = 700, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)
        self.vector_store = PCISVectorStore()

    # ── Text Extraction Strategies ──────────────────────────────────────────

    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF using pypdf, pdfplumber, fitz, or regex stream fallback."""
        text_parts = []

        # Strategy 1: pypdf
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page_idx, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted and extracted.strip():
                    text_parts.append(f"[Page {page_idx + 1}]\n{extracted}")
            if text_parts:
                return "\n\n".join(text_parts)
        except Exception as e:
            logger.debug(f"pypdf extraction failed ({e}), trying pdfplumber")

        # Strategy 2: pdfplumber
        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                for page_idx, page in enumerate(pdf.pages):
                    extracted = page.extract_text()
                    if extracted and extracted.strip():
                        text_parts.append(f"[Page {page_idx + 1}]\n{extracted}")
            if text_parts:
                return "\n\n".join(text_parts)
        except Exception as e:
            logger.debug(f"pdfplumber extraction failed ({e}), trying PyMuPDF")

        # Strategy 3: PyMuPDF (fitz)
        try:
            import fitz
            doc = fitz.open(file_path)
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                extracted = page.get_text()
                if extracted and extracted.strip():
                    text_parts.append(f"[Page {page_idx + 1}]\n{extracted}")
            if text_parts:
                return "\n\n".join(text_parts)
        except Exception as e:
            logger.debug(f"fitz extraction failed ({e}), trying binary fallback")

        # Strategy 4: Raw text extraction fallback
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            # Extract ASCII/UTF-8 readable text blocks
            strings = re.findall(b"[\x20-\x7E\r\n\t]{4,}", content)
            raw_text = " ".join(s.decode("latin1", errors="ignore") for s in strings)
            cleaned = re.sub(r"\s+", " ", raw_text).strip()
            if cleaned:
                return cleaned
        except Exception as e:
            logger.error(f"Fallback PDF text extraction error: {e}")

        return f"Document content from {os.path.basename(file_path)}"

    def extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX using python-docx or standard library zipfile XML."""
        # Strategy 1: python-docx
        try:
            import docx
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            if paragraphs:
                return "\n\n".join(paragraphs)
        except Exception as e:
            logger.debug(f"python-docx extraction failed ({e}), trying zipfile xml fallback")

        # Strategy 2: Built-in zipfile + XML parser (zero third-party dependency)
        try:
            import zipfile
            import xml.etree.ElementTree as ET
            with zipfile.ZipFile(file_path) as z:
                xml_content = z.read("word/document.xml")
                tree = ET.fromstring(xml_content)
                namespaces = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
                texts = [node.text for node in tree.iterfind(".//w:t", namespaces) if node.text]
                if texts:
                    return " ".join(texts)
        except Exception as e:
            logger.error(f"DOCX XML extraction failed: {e}")

        return f"Document content from {os.path.basename(file_path)}"

    def extract_text_from_txt(self, file_path: str) -> str:
        """Extract text from plain text or markdown files with auto encoding detection."""
        for enc in ["utf-8", "utf-8-sig", "latin1", "cp1252"]:
            try:
                with open(file_path, "r", encoding=enc) as f:
                    return f.read()
            except Exception:
                continue
        with open(file_path, "rb") as f:
            return f.read().decode("ascii", errors="replace")

    def extract_text_from_csv(self, file_path: str) -> str:
        """Convert CSV dataset rows into semantic descriptive text blocks."""
        df = pd.read_csv(file_path)
        columns = df.columns.tolist()
        filename = os.path.basename(file_path)
        lines = [f"Dataset Table: {filename} (Total records: {len(df)})", f"Columns: {', '.join(columns)}", ""]

        for idx, row in df.iterrows():
            parts = []
            for col in columns:
                val = row.get(col)
                if pd.notna(val) and str(val).strip():
                    parts.append(f"{col}: {val}")
            if parts:
                lines.append(f"Record {idx + 1}: " + " | ".join(parts))

        return "\n".join(lines)

    def extract_text_from_excel(self, file_path: str) -> str:
        """Convert all sheets in Excel file into structured semantic text blocks."""
        lines = [f"Workbook: {os.path.basename(file_path)}", ""]
        try:
            excel_file = pd.ExcelFile(file_path, engine="openpyxl")
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                columns = df.columns.tolist()
                lines.append(f"--- Sheet: {sheet_name} (Total rows: {len(df)}) ---")
                lines.append(f"Columns: {', '.join(str(c) for c in columns)}")
                for idx, row in df.iterrows():
                    parts = []
                    for col in columns:
                        val = row.get(col)
                        if pd.notna(val) and str(val).strip():
                            parts.append(f"{col}: {val}")
                    if parts:
                        lines.append(f"Row {idx + 1}: " + " | ".join(parts))
                lines.append("")
        except Exception as e:
            logger.error(f"Excel parsing error: {e}")
            lines.append(f"Content from Excel file: {os.path.basename(file_path)}")

        return "\n".join(lines)

    def extract_text_from_json(self, file_path: str) -> str:
        """Parse structured JSON file into readable markdown format."""
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            data = json.load(f)

        filename = os.path.basename(file_path)
        lines = [f"JSON Document: {filename}", ""]

        def format_item(item: Any, depth: int = 0) -> List[str]:
            res = []
            indent = "  " * depth
            if isinstance(item, dict):
                for k, v in item.items():
                    if isinstance(v, (dict, list)):
                        res.append(f"{indent}- **{k}**:")
                        res.extend(format_item(v, depth + 1))
                    else:
                        res.append(f"{indent}- **{k}**: {v}")
            elif isinstance(item, list):
                for idx, elem in enumerate(item):
                    if isinstance(elem, (dict, list)):
                        res.append(f"{indent}- Item {idx + 1}:")
                        res.extend(format_item(elem, depth + 1))
                    else:
                        res.append(f"{indent}- {elem}")
            else:
                res.append(f"{indent}{item}")
            return res

        lines.extend(format_item(data))
        return "\n".join(lines)

    # ── Semantic Text Chunker ───────────────────────────────────────────────

    def chunk_text(self, text: str, metadata: Dict[str, Any]) -> List[Document]:
        """
        Split raw text into semantic chunks with overlap and rich metadata.
        """
        if not text or not text.strip():
            return []

        # Split on paragraph boundaries first
        paragraphs = re.split(r"\n\s*\n", text)
        chunks: List[str] = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) <= self.chunk_size:
                current_chunk = f"{current_chunk}\n\n{para}".strip()
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                # If paragraph itself is larger than chunk size, split by lines/sentences
                if len(para) > self.chunk_size:
                    sentences = re.split(r"(?<=[.!?])\s+", para)
                    sub_chunk = ""
                    for sent in sentences:
                        if len(sub_chunk) + len(sent) <= self.chunk_size:
                            sub_chunk = f"{sub_chunk} {sent}".strip()
                        else:
                            if sub_chunk:
                                chunks.append(sub_chunk)
                            sub_chunk = sent
                    if sub_chunk:
                        current_chunk = sub_chunk
                    else:
                        current_chunk = ""
                else:
                    current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)

        total_chunks = len(chunks)
        documents = []
        for i, chunk_text in enumerate(chunks):
            doc_meta = {
                **metadata,
                "chunk_index": i,
                "total_chunks": total_chunks,
                "chunk_preview": chunk_text[:120].replace("\n", " "),
            }
            # Prepend source header to content for high relevance vector matching
            content_with_header = f"[Source Document: {metadata.get('source_file', 'unknown')}]\n{chunk_text}"
            documents.append(Document(page_content=content_with_header, metadata=doc_meta))

        return documents

    # ── Master Ingestion & Indexing Pipeline ────────────────────────────────

    async def process_and_index_file(
        self,
        file_path: str,
        original_filename: str,
        case_id: str = None,
        doc_type: str = "CASE_DOCUMENT",
    ) -> Dict[str, Any]:
        """
        Extracts content from uploaded file, chunks it, saves a copy to data/uploaded_documents/,
        indexes it into FAISS vector store, and registers it in MongoDB.
        """
        start_time = time.time()
        ext = original_filename.split(".")[-1].lower()

        # 1. Extract Text
        if ext == "pdf":
            text = self.extract_text_from_pdf(file_path)
            file_category = "PDF"
        elif ext in ["docx", "doc"]:
            text = self.extract_text_from_docx(file_path)
            file_category = "DOCX"
        elif ext in ["txt", "md", "log"]:
            text = self.extract_text_from_txt(file_path)
            file_category = "TEXT"
        elif ext in ["csv", "tsv"]:
            text = self.extract_text_from_csv(file_path)
            file_category = "CSV"
        elif ext in ["xlsx", "xls"]:
            text = self.extract_text_from_excel(file_path)
            file_category = "EXCEL"
        elif ext == "json":
            text = self.extract_text_from_json(file_path)
            file_category = "JSON"
        else:
            # Fallback text extraction
            text = self.extract_text_from_txt(file_path)
            file_category = ext.upper()

        if not text or not text.strip():
            text = f"Document: {original_filename} (uploaded successfully with minimal text content)."

        # 2. Persist copy in permanent uploaded documents store
        dest_filename = f"{int(time.time())}_{re.sub(r'[^a-zA-Z0-9_.-]', '_', original_filename)}"
        dest_path = os.path.join(self.UPLOAD_DIR, dest_filename)
        shutil.copyfile(file_path, dest_path)

        # 3. Create Chunks
        timestamp_now = datetime.now(timezone.utc).isoformat()
        metadata = {
            "source_file": original_filename,
            "stored_file": dest_filename,
            "file_type": file_category,
            "uploaded_at": timestamp_now,
            "case_id": case_id or "UNASSIGNED",
            "document_type": doc_type,
        }

        docs = self.chunk_text(text, metadata)

        # 4. Add Chunks to FAISS Vector Index
        if docs:
            self.vector_store.load_or_create()
            self.vector_store.add_documents(docs)
            logger.info(f"Indexed {len(docs)} chunks into FAISS for document '{original_filename}'")

        # 5. Persist Document Record in MongoDB (if connected)
        doc_record_id = None
        try:
            db = DatabaseManager.get_database()
            doc_record = {
                "filename": original_filename,
                "stored_filename": dest_filename,
                "file_type": file_category,
                "file_size": os.path.getsize(file_path),
                "case_id": case_id,
                "document_type": doc_type,
                "total_chunks": len(docs),
                "character_count": len(text),
                "extracted_snippet": text[:500],
                "created_at": timestamp_now,
            }
            res = await db["case_documents"].insert_one(doc_record)
            doc_record_id = str(res.inserted_id)
        except Exception as e:
            logger.info(f"MongoDB persistence skipped (offline/standalone): {e}")

        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return {
            "status": "success",
            "document_id": doc_record_id or dest_filename,
            "filename": original_filename,
            "file_type": file_category,
            "total_chunks": len(docs),
            "character_count": len(text),
            "processing_time_ms": elapsed_ms,
            "message": f"Document '{original_filename}' successfully uploaded, chunked ({len(docs)} chunks), and indexed into AI Vector Store.",
        }
