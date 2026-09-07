"""
Local Whisper transcription runner (openai/whisper, open-source, no API cost).

- Bootstraps an ffmpeg.exe onto PATH via imageio-ffmpeg (Windows-safe; openai-whisper
  shells out to `ffmpeg` to decode audio and fails without it).
- Loads the model lazily and caches it as a singleton (reload only if the model name changes).
- `transcribe()` returns the full segment list with start/end timings + per-segment
  confidence, which the Node endpoint uses as Delivery / fluency evidence.
"""
import os
import sys
import io
import threading
import warnings
from pathlib import Path

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# FFmpeg bootstrap (imageio-ffmpeg bundles a static ffmpeg.exe)
# ---------------------------------------------------------------------------
def _ensure_ffmpeg_on_path() -> None:
    from shutil import which

    # Already available? Nothing to do.
    if which("ffmpeg"):
        return

    try:
        import imageio_ffmpeg

        src = imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return

    if not src or not os.path.exists(src):
        return

    bin_dir = Path(__file__).resolve().parent / "bin"
    bin_dir.mkdir(exist_ok=True)
    dst = bin_dir / "ffmpeg.exe"
    # Copy once (skip if identical) so the service dir is self-contained.
    if not dst.exists() or os.path.getsize(dst) != os.path.getsize(src):
        import shutil

        shutil.copyfile(src, dst)
    os.environ["PATH"] = str(bin_dir) + os.pathsep + os.environ.get("PATH", "")


_ensure_ffmpeg_on_path()

# ---------------------------------------------------------------------------
# Model management (lazy singleton)
# ---------------------------------------------------------------------------
_MODEL = None
_MODEL_LOCK = threading.Lock()


def get_model(name: str | None = None):
    """Load (and cache) the whisper model. Reloads only when the name changes."""
    global _MODEL
    name = name or os.environ.get("WHISPER_MODEL", "base")
    with _MODEL_LOCK:
        if _MODEL is None or getattr(_MODEL, "_whisper_name", None) != name:
            import whisper
            import torch

            device = "cuda" if torch.cuda.is_available() else "cpu"
            _MODEL = whisper.load_model(name, device=device)
            try:
                _MODEL._whisper_name = name
            except Exception:
                pass
        return _MODEL


def transcribe(
    audio_bytes: bytes,
    model: str | None = None,
    language: str | None = None,
    task: str = "transcribe",
) -> dict:
    """Transcribe raw audio bytes with local openai-whisper.

    Returns: { text, language, duration, segments:[{start,end,text,avg_logprob,no_speech_prob}] }
    """
    import whisper
    import tempfile

    model_obj = get_model(model)

    suffix = ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as fh:
        fh.write(audio_bytes)
        tmp_path = fh.name

    try:
        result = model_obj.transcribe(
            tmp_path,
            language=language,
            task=task,
            verbose=False,
            fp16=False,  # CPU-safe
            temperature=0.0,
        )
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass

    segments = []
    for seg in result.get("segments", []):
        segments.append(
            {
                "start": round(float(seg["start"]), 3),
                "end": round(float(seg["end"]), 3),
                "text": seg["text"].strip(),
                "avg_logprob": round(float(seg.get("avg_logprob", 0.0)), 4),
                "no_speech_prob": round(float(seg.get("no_speech_prob", 0.0)), 4),
            }
        )

    duration = round(segments[-1]["end"], 3) if segments else None
    return {
        "text": (result.get("text") or "").strip(),
        "language": result.get("language"),
        "duration": duration,
        "segments": segments,
    }
