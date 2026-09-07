"""
Start the local Whisper service.

Usage:
  python run.py                      # listens on 127.0.0.1:8001
  WHISPER_PORT=8002 WHISPER_MODEL=small python run.py

Then point your Node evaluator at it:
  LOCAL_WHISPER_URL=http://127.0.0.1:8001
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from service import app
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("WHISPER_PORT", "8001"))
    # Warm the model so the first request isn't a surprise cold-start.
    try:
        from runner import get_model

        get_model()
        print(f"[whisper] model '{os.environ.get('WHISPER_MODEL', 'base')}' loaded")
    except Exception as exc:
        print(f"[whisper] model preload skipped: {exc}")
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
