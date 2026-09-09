#!/usr/bin/env python3
"""
Regenerate MET Part 1 19 short conversations with Chatterbox Nano.
Reads src/data/exercises/listening/met-part1-19-chatterbox.json scripts,
splits by speaker tags (N:, A:, B:, Barista:, etc.), synthesizes dual-voice
via Chatterbox, concatenates with ffmpeg.

Requires: chatterbox-tts==0.1.2, torch, torchaudio, ffmpeg on PATH
Models: ResembleAI/chatterbox-nano (auto-download to hf_cache)
Output: public/audio/listening/part1/part1_conv01-19.mp3

Usage:
  python scripts/generate-chatterbox-part1-19.py [--dry] [--only 01,05]
  # dry = print plan without synthesizing
"""
import argparse, json, re, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "src/data/exercises/listening/met-part1-19-chatterbox.json"
OUT_DIR = ROOT / "public/audio/listening/part1"

# Speaker voice presets — adjust to your Chatterbox voices
VOICE_MAP = {
    "N": None,  # narrator neutral
    "A": "default",
    "B": "default",
}

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--dry", action="store_true", help="print plan only")
    p.add_argument("--only", type=str, default="", help="comma ids e.g. 01,05 or p1_01")
    p.add_argument("--force", action="store_true", help="overwrite existing mp3s (creates 19 NEW files)")
    p.add_argument("--device", type=str, default="cpu", help="cpu | cuda | mps")
    p.add_argument("--nano", action="store_true", help="use chatterbox-nano from E:/hf_cache (30%% faster)")
    return p.parse_args()

def load_items():
    data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    mods = data.get("modules", [])
    for m in mods:
        if m["id"] == "met_part1_19_chatterbox":
            return m["items"]
    raise SystemExit("module met_part1_19_chatterbox not found")

def split_script(script: str):
    """Split 'Speaker: text' lines into (speaker, text)."""
    parts = []
    for line in script.splitlines():
        line=line.strip()
        if not line: continue
        m = re.match(r"^([A-Za-z ]+):\s*(.+)$", line)
        if m:
            speaker = m.group(1).strip()
            # normalize narrator variations
            if speaker.lower().startswith("n"): speaker="N"
            parts.append((speaker, m.group(2)))
        else:
            parts.append(("N", line))
    return parts

# singleton TTS to avoid reloading model per turn
_TTS_SINGLETON = {"model": None, "device": None, "nano": None}

def get_tts(device="cpu", use_nano=False):
    global _TTS_SINGLETON
    key = (device, use_nano)
    if _TTS_SINGLETON["model"] is not None and (_TTS_SINGLETON["device"], _TTS_SINGLETON["nano"]) == key:
        return _TTS_SINGLETON["model"]
    from chatterbox.tts import ChatterboxTTS  # type: ignore
    from pathlib import Path as _P
    if use_nano:
        # E:\hf_cache nano snapshot — bypass HF download
        nano_roots = [
            _P(r"E:\hf_cache\models--ResembleAI--chatterbox-nano\snapshots\71ccd1d0081b430592cea481f4307e764e07bc64"),
            _P(r"E:\hf_cache\models--ResembleAI--chatterbox-nano\snapshots") / sorted([p.name for p in _P(r"E:\hf_cache\models--ResembleAI--chatterbox-nano\snapshots").glob("*") if p.is_dir()])[-1] if list(_P(r"E:\hf_cache\models--ResembleAI--chatterbox-nano\snapshots").glob("*")) else _P("."),
        ]
        for root in nano_roots:
            if (root / "t3_nano_v1.safetensors").exists():
                print(f"  loading nano from {root}")
                tts = ChatterboxTTS.from_local(root, device)
                _TTS_SINGLETON["model"] = tts
                _TTS_SINGLETON["device"] = device
                _TTS_SINGLETON["nano"] = use_nano
                return tts
        print("  nano snapshot not found, falling back to full model")
    # full model via HF (HF_HOME=E:\hf_cache will hit cache)
    try:
        tts = ChatterboxTTS.from_pretrained(device)
    except TypeError:
        tts = ChatterboxTTS.from_pretrained()
        if hasattr(tts, "to"):
            try: tts.to(device)
            except Exception: pass
    _TTS_SINGLETON["model"] = tts
    _TTS_SINGLETON["device"] = device
    _TTS_SINGLETON["nano"] = use_nano
    return tts

def synth_chatterbox(text: str, out_wav: Path, speaker: str="", device="cpu", use_nano=False):
    try:
        tts = get_tts(device, use_nano=use_nano)
        wav = tts.generate(text)  # returns Tensor [1, samples] watermarked
        import torchaudio
        sr = getattr(tts, "sr", 22050)
        out_wav.parent.mkdir(parents=True, exist_ok=True)
        torchaudio.save(str(out_wav), wav.cpu(), sr)
        return True
    except Exception as e:
        import traceback
        print(f"  chatterbox failed ({e}) for: {text[:60]}")
        traceback.print_exc(limit=3)
        return False

def concat_with_ffmpeg(wavs, out_mp3: Path):
    if not wavs: return False
    # create concat demuxer file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False, encoding="utf-8") as f:
        for w in wavs:
            f.write(f"file '{w.as_posix()}'\n")
        list_file = Path(f.name)
    cmd = ["ffmpeg","-y","-f","concat","-safe","0","-i",str(list_file),"-c:a","libmp3lame","-q:a","2",str(out_mp3)]
    result = subprocess.run(cmd, capture_output=True, text=True)
    list_file.unlink(missing_ok=True)
    if result.returncode != 0:
        print(result.stderr[-500:])
        return False
    return True

def main():
    args = parse_args()
    items = load_items()
    filt = set(x.strip().lower() for x in args.only.split(",") if x.strip()) if args.only else None

    for item in items:
        audio_file = item["audioFile"]  # part1/part1_conv01.mp3
        m = re.search(r"part1_conv(\d+)", audio_file)
        num = m.group(1) if m else item["id"]
        if filt and not any(f in num or f in item["id"].lower() for f in filt):
            continue
        script = item.get("script","")
        parts = split_script(script)
        out_mp3 = ROOT / f"public/audio/listening/{audio_file}"
        out_mp3.parent.mkdir(parents=True, exist_ok=True)
        print(f"\n{item['id']} -> {audio_file} ({len(parts)} turns) -> {out_mp3}")
        for sp, txt in parts:
            print(f"  {sp}: {txt[:70]}")

        if args.dry:
            continue
        if out_mp3.exists() and not args.force:
            print(f"  exists ({out_mp3.stat().st_size} bytes) — skipping (use --force to overwrite)")
            continue
        # synthesize each turn to temp wavs then concat
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            wavs=[]
            for idx,(sp,txt) in enumerate(parts):
                wav = tmp / f"turn_{idx:02d}.wav"
                ok = synth_chatterbox(txt, wav, sp, device=args.device, use_nano=args.nano)
                if ok and wav.exists():
                    wavs.append(wav)
                else:
                    print(f"  failed turn {idx} — aborting {item['id']}")
                    wavs=[]
                    break
            if wavs and not args.dry:
                ok = concat_with_ffmpeg(wavs, out_mp3)
                print(f"  {'wrote' if ok else 'failed'} {out_mp3} ({out_mp3.stat().st_size if out_mp3.exists() else 0} bytes)")

    print("\nDone. If chatterbox was unavailable, install: pip install chatterbox-tts torch torchaudio")
    print("Or keep existing mp3s — they are already 19 files (109k-143k each) in public/audio/listening/part1/")

if __name__ == "__main__":
    main()
