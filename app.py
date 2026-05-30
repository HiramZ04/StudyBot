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
    allow_origins=["*"],
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


@app.post("/chat")
def chat(body: ChatRequest):
    return {"response": assistant.ask(body.message)}


@app.post("/summary")
def summary(body: SummaryRequest):
    return {"response": assistant.summarize(body.topic)}


@app.post("/quiz")
def quiz(body: QuizRequest):
    return {"response": assistant.generate_quiz(body.topic, body.num_questions)}


@app.get("/files")
def files():
    return {"files": assistant.list_files_json()}


@app.delete("/clear")
def clear():
    assistant.clear()
    return {"status": "cleared"}
