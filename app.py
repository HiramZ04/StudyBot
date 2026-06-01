"""
StudyBot API Server

Endpoints:
    POST   /chat          — Q&A from study materials
    POST   /summary       — Generate a summary (optional topic)
    POST   /quiz          — Generate quiz questions (optional topic)
    GET    /files         — List loaded study materials
    DELETE /clear         — Clear history and unload all documents
"""

import os
import shutil
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from rag import Assistant

load_dotenv()


def load_config_from_env() -> dict:
    return {
        "api_key": os.getenv("OPENAI_API_KEY"),
        "base_url": os.getenv("OPENAI_BASE_URL"),
        "model": os.getenv("MODEL"),
        "vision_model": os.getenv("VISION_MODEL"),
        "embedding_model": os.getenv("EMBEDDING_MODEL"),
        "upload_dir": os.getenv("UPLOAD_DIR"),
        "top_k": os.getenv("TOP_K"),
        "chunk_size": os.getenv("CHUNK_SIZE"),
        "chunk_overlap": os.getenv("CHUNK_OVERLAP"),
    }


app = FastAPI(title="StudyBot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

assistant = Assistant.from_config(load_config_from_env())

class ChatRequest(BaseModel):
    message: str

class SummaryRequest(BaseModel):
    topic: str | None = None

class QuizRequest(BaseModel):
    topic: str | None = None
    num_questions: int = 5


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    """Upload a file to the database (in memory)"""
    if not file.filename:
        return {"error": "No filename provided"}
    
    try:
        contents = await file.read()
        results = assistant.add_documents_from_content([(file.filename, contents)])
        if results.get(file.filename):
            return {
                "status": "success",
                "filename": file.filename,
                "message": f"File '{file.filename}' uploaded and indexed"
            }
        else:
            return {
                "status": "error",
                "filename": file.filename,
                "message": f"File '{file.filename}' is not supported or is empty"
            }
    except Exception as e:
        return {
            "status": "error",
            "filename": file.filename,
            "message": str(e)
        }


@app.delete("/files/{filename}")
def delete_file(filename: str):
    """Delete a specific file from the database."""
    success = assistant.remove_file(filename)
    
    if success:
        return {
            "status": "success",
            "filename": filename,
            "message": f"File '{filename}' removed from database"
        }
    else:
        return {
            "status": "error",
            "filename": filename,
            "message": f"File '{filename}' not found in database"
        }


@app.post("/chat")
def chat(body: ChatRequest):
    result = assistant.ask(body.message)
    return result


@app.post("/summary")
def summary(body: SummaryRequest):
    result = assistant.summarize(body.topic)
    return result


@app.post("/quiz")
def quiz(body: QuizRequest):
    result = assistant.generate_quiz(body.topic, body.num_questions)
    return result


@app.get("/files")
def files():
    raw = assistant.list_files_json()
    # different on frontend
    return [
        {
            "fileName": f["filename"],
            "type": f["type"],
            "source": f["source"],
        }
        for f in raw
    ]


@app.delete("/clear")
def clear():
    assistant.clear()
    return {"status": "cleared"}
