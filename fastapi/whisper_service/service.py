"""
FastAPI service exposing local openai-whisper transcription over HTTP.

Endpoints:
  GET  /health      -> {status, model}
  POST /transcribe  -> multipart `file` (audio) -> {text, language, duration, segments, ...}

Run:  python run.py   (or: uvicorn service:app --port 8001)
The Node endpoint api/evaluate-speaking.js calls this when LOCAL_WHISPER_URL is set,
giving you cloud-free transcription for the MET speaking evaluation flow.
"""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from runner import get_model, transcribe

app = FastAPI(title="Local Whisper Service", version="1.0.0")

MAX_AUDIO_BYTES = int(os.environ.get("WHISPER_MAX_BYTES", str(25 * 1024 * 1024)))


@app.get("/health")
def health():
    return {"status": "ok", "model": os.environ.get("WHISPER_MODEL", "base")}


@app.post("/transcribe")
async def transcribe_endpoint(
    file: UploadFile = File(...),
    model: str = Form(None),
    language: str = Form(None),
    task: str = Form("transcribe"),
):
    t0 = time.time()
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="empty file")
    if len(data) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="audio exceeds size limit")

    try:
        result = transcribe(data, model=model, language=language, task=task)
    except Exception as exc:  # surface as 500 so the caller can fall back
        raise HTTPException(status_code=500, detail=f"transcription failed: {exc}")

    result["latency_ms"] = int((time.time() - t0) * 1000)
    result["asrProvider"] = "local-whisper"
    result["asrModel"] = model or os.environ.get("WHISPER_MODEL", "base")
    return result
