#!/usr/bin/env python3
r"""Small local Piper HTTP bridge used by the Listening exercise editor.

The browser cannot execute the Piper CLI directly. This server keeps the
model local and exposes the `/synthesize` contract used by `src/lib/tts-utils.js`.

Usage:
  .venv-tts\Scripts\python.exe scripts/piper-server.py --model path\to\voice.onnx
  .venv-tts\Scripts\python.exe scripts/piper-server.py --female-model female.onnx --male-model male.onnx
"""

import argparse
import io
import json
import threading
import wave
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from piper.voice import PiperVoice


MAX_TEXT_CHARS = 8000


def parse_args():
    parser = argparse.ArgumentParser(description="Serve one or two local Piper voices to the browser.")
    parser.add_argument("--model", help="One Piper .onnx model; used for both genders when separate models are not supplied.")
    parser.add_argument("--female-model", help="Optional Piper .onnx model selected for female dialogue turns.")
    parser.add_argument("--male-model", help="Optional Piper .onnx model selected for male dialogue turns.")
    parser.add_argument("--config", help="Optional path to the model .onnx.json config.")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=5050)
    parser.add_argument("--cuda", action="store_true", help="Use CUDA when supported by the installed Piper runtime.")
    return parser.parse_args()


class PiperHandler(BaseHTTPRequestHandler):
    voices = {}
    voice_lock = threading.Lock()

    def log_message(self, fmt, *args):
        print(f"[piper] {self.address_string()} - {fmt % args}")

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def _json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path.rstrip("/") == "/health":
            self._json(200, {"ok": True, "provider": "piper"})
            return
        self._json(404, {"detail": "Not found"})

    def do_POST(self):
        if self.path.rstrip("/") != "/synthesize":
            self._json(404, {"detail": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 20000:
                raise ValueError("Request body is missing or too large.")
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            text = str(payload.get("text", "")).strip()
            if not text:
                raise ValueError("Missing text.")
            if len(text) > MAX_TEXT_CHARS:
                raise ValueError(f"Text is too long (maximum {MAX_TEXT_CHARS} characters).")

            output = io.BytesIO()
            gender = str(payload.get("gender", "female")).lower()
            voice = self.voices.get(gender) or self.voices.get("female")
            with self.voice_lock:
                with wave.open(output, "wb") as wav_file:
                    voice.synthesize_wav(text, wav_file)
            body = output.getvalue()
            self.send_response(200)
            self._cors()
            self.send_header("Content-Type", "audio/wav")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (ValueError, json.JSONDecodeError) as exc:
            self._json(400, {"detail": str(exc)})
        except Exception as exc:
            print(f"[piper] synthesis failed: {exc}")
            self._json(500, {"detail": "Piper synthesis failed. Check the model and server console."})


def main():
    args = parse_args()
    model_paths = {
        "female": Path(args.female_model or args.model).expanduser().resolve() if (args.female_model or args.model) else None,
        "male": Path(args.male_model or args.female_model or args.model).expanduser().resolve() if (args.male_model or args.female_model or args.model) else None,
    }
    if not model_paths["female"]:
        raise SystemExit("Provide --model, or provide --female-model and --male-model.")
    for gender, model_path in model_paths.items():
        if not model_path.exists():
            raise SystemExit(f"Piper {gender} model not found: {model_path}")
    config_path = Path(args.config).expanduser().resolve() if args.config else None
    for gender, model_path in model_paths.items():
        print(f"[piper] loading {gender} voice {model_path}")
        PiperHandler.voices[gender] = PiperVoice.load(model_path, config_path=config_path, use_cuda=args.cuda)
    server = ThreadingHTTPServer((args.host, args.port), PiperHandler)
    print(f"[piper] ready at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[piper] stopping")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
