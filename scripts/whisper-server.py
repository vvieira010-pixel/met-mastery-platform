"""Local Faster-Whisper endpoint for the Practice Studio transcription hook.

Run with a downloaded model directory:
  set WHISPER_MODEL_PATH=E:/hf_cache/models--Systran--faster-whisper-base.en/snapshots/<snapshot>
  python scripts/whisper-server.py

Then set LOCAL_WHISPER_URL=http://127.0.0.1:8011 in the app environment.
The API deliberately exposes transcription only; scoring remains in the Node
server, where authentication, authorization, and the MET rubric are enforced.
"""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, HTTPException, UploadFile
from faster_whisper import WhisperModel


HOST = "127.0.0.1"
PORT = int(os.environ.get("LOCAL_WHISPER_PORT", "8011"))
MAX_AUDIO_BYTES = 15 * 1024 * 1024
MODEL_PATH = os.environ.get("WHISPER_MODEL_PATH", "base.en")
DEVICE = os.environ.get("WHISPER_DEVICE", "auto")
COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

app = FastAPI(title="Local Whisper transcription", docs_url=None, redoc_url=None)
_model: WhisperModel | None = None


def get_model() -> WhisperModel:
    global _model
    if _model is None:
        _model = WhisperModel(MODEL_PATH, device=DEVICE, compute_type=COMPUTE_TYPE)
    return _model


def suffix_for(upload: UploadFile) -> str:
    name = upload.filename or "recording.webm"
    suffix = Path(name).suffix.lower()
    return suffix if suffix in {".flac", ".m4a", ".mp3", ".mp4", ".mpeg", ".ogg", ".wav", ".webm"} else ".webm"


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": MODEL_PATH}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)) -> dict:
    audio = await file.read(MAX_AUDIO_BYTES + 1)
    if not audio:
        raise HTTPException(status_code=400, detail="Audio file is empty.")
    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(status_code=413, detail="Audio file is too large.")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix_for(file)) as tmp:
            tmp.write(audio)
            tmp_path = tmp.name

        segments, info = get_model().transcribe(
            tmp_path,
            language="en",
            beam_size=5,
            vad_filter=True,
            word_timestamps=True,
        )
        rows = list(segments)
        text = " ".join(segment.text.strip() for segment in rows if segment.text.strip()).strip()
        if not text:
            raise HTTPException(status_code=422, detail="No intelligible English speech was transcribed.")

        words = [
            {"start": word.start, "end": word.end, "word": word.word}
            for segment in rows
            for word in (segment.words or [])
            if word.start is not None and word.end is not None
        ]
        response_segments = [
            {
                "start": segment.start,
                "end": segment.end,
                "text": segment.text.strip(),
                "no_speech_prob": segment.no_speech_prob,
            }
            for segment in rows
        ]
        return {
            "text": text,
            "duration": getattr(info, "duration", None),
            "segments": response_segments,
            "words": words,
            "asrModel": Path(MODEL_PATH).name or "faster-whisper",
        }
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except FileNotFoundError:
                pass


if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")
