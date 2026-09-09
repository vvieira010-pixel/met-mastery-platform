#!/usr/bin/env python3
"""
Synthesize audio for a MET homework-suite JSON with Chatterbox TTS.

Reads a suite JSON (grammar/vocab + reading + listening + writing + speaking),
renders TTS-friendly text per section, synthesizes per turn/sentence with
Chatterbox (nano by default), concatenates with ffmpeg and writes a manifest.

Usage:
  .venv-tts/Scripts/python.exe scripts/chatterbox-suite.py \
      --suite src/data/exercises/mixed/b1-homework-suite.json \
      [--out public/audio/suite] [--model nano|full] [--device cpu] \
      [--only L1,R1] [--dry] [--force]

Output:
  <out>/<suite-stem>/<job>.mp3  +  <out>/<suite-stem>/manifest.json

Requires: chatterbox-tts (system python 3.13), torch, torchaudio, ffmpeg on PATH.
Models are loaded from E:\\hf_cache (no download).
"""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

NANO_SNAP = Path(r"E:\hf_cache\models--ResembleAI--chatterbox-nano\snapshots")
FULL_SNAP = Path(r"E:\hf_cache\models--ResembleAI--chatterbox\snapshots")

# Reference clips for voice cloning (chatterbox-nano output, 24 kHz mono)
REF_FEMALE = ROOT / "public/audio/listening/script-q13-q19-nano/part1_turn01_female.wav"
REF_MALE = ROOT / "public/audio/listening/script-q13-q19-nano/part1_turn02_male.wav"

_TTS = {"model": None, "key": None}


# ---------------------------------------------------------------- model ----
def _latest_snapshot(base: Path) -> Path:
    snaps = [p for p in base.glob("*") if p.is_dir()]
    if not snaps:
        raise SystemExit(f"no model snapshot under {base}")
    return sorted(snaps)[-1]


def get_tts(device="cpu", model="nano"):
    key = (device, model)
    if _TTS["model"] is not None and _TTS["key"] == key:
        return _TTS["model"]
    from chatterbox.tts import ChatterboxTTS  # type: ignore

    if model == "nano":
        root = _latest_snapshot(NANO_SNAP)
        tts = ChatterboxTTS.from_local(root, device)
    else:
        root = _latest_snapshot(FULL_SNAP)
        tts = ChatterboxTTS.from_local(root, device)
    _TTS["model"] = tts
    _TTS["key"] = key
    print(f"  [model] {model} from {root.name} on {device} (sr={getattr(tts,'sr','?')})")
    return tts


# ----------------------------------------------------------------- text ----
def tts_text(s: str) -> str:
    """Make JSON content readable for a TTS engine."""
    s = re.sub(r"_{3,}", " blank ", s)
    s = s.replace("->", " to ")
    s = s.replace("e.g.", "for example")
    s = s.replace("i.e.", "that is")
    s = s.replace("etc.", "etcetera")
    s = re.sub(r"\s+", " ", s).strip()
    return s


def split_sentences(s: str):
    s = tts_text(s)
    parts = re.split(r"(?<=[.!?])\s+", s)
    return [p.strip() for p in parts if p.strip()]


def speaker_turns(script: str):
    """Split 'Speaker A: text' lines into (voice, text)."""
    turns = []
    for line in script.splitlines():
        line = line.strip()
        if not line:
            continue
        m = re.match(r"^([A-Za-z0-9 ]+):\s*(.+)$", line)
        if m:
            sp = m.group(1).strip().lower()
            voice = "F" if sp.endswith("a") else "M"
            turns.append((voice, tts_text(m.group(2))))
        else:
            turns.append(("F", tts_text(line)))
    return turns


def options_text(item) -> str:
    opts = item.get("options", {})
    return " ".join(f"Option {k}. {tts_text(v)}." for k, v in opts.items())


def question_text(item) -> str:
    n = item.get("id")
    return f"Question {n}. {tts_text(item.get('question',''))} {options_text(item)}"


# ----------------------------------------------------------------- plan ----
def build_plan(suite: dict):
    jobs = []

    # Grammar & vocabulary -------------------------------------------------
    for it in suite.get("grammar_and_vocabulary", {}).get("items", []):
        jobs.append({
            "id": f"GV_q{it['id']:02d}",
            "kind": "grammar",
            "title": f"Grammar question {it['id']}",
            "turns": [("N", question_text(it))],
        })

    # Reading --------------------------------------------------------------
    for t in suite.get("reading", {}).get("texts", []):
        rid = t.get("id", "R")
        jobs.append({
            "id": f"{rid}_passage",
            "kind": "reading-passage",
            "title": t.get("title", rid),
            "turns": [("N", s) for s in split_sentences(f"{t.get('title','')}. {t.get('content','')}")],
        })
        for it in t.get("items", []):
            jobs.append({
                "id": f"{rid}_q{it['id']:02d}",
                "kind": "reading-question",
                "title": f"{rid} question {it['id']}",
                "turns": [("N", question_text(it))],
            })

    # Listening ------------------------------------------------------------
    for sc in suite.get("listening", {}).get("scripts", []):
        lid = sc.get("id", "L")
        jobs.append({
            "id": f"{lid}_dialogue",
            "kind": "listening-dialogue",
            "title": sc.get("title", lid),
            "turns": speaker_turns(sc.get("content", "")),
        })
        for it in sc.get("items", []):
            jobs.append({
                "id": f"{lid}_q{it['id']:02d}",
                "kind": "listening-question",
                "title": f"{lid} question {it['id']}",
                "turns": [("N", question_text(it))],
            })

    # Writing / speaking ---------------------------------------------------
    w = suite.get("writing", {}).get("task")
    if w:
        jobs.append({
            "id": "W_task",
            "kind": "writing-prompt",
            "title": "Writing task",
            "turns": [("N", f"Writing task. {tts_text(w.get('prompt',''))}")],
        })
    s = suite.get("speaking", {}).get("task")
    if s:
        jobs.append({
            "id": "S_task",
            "kind": "speaking-prompt",
            "title": "Speaking task",
            "turns": [("N", f"Speaking task. {tts_text(s.get('prompt',''))}")],
        })
    return jobs


# ---------------------------------------------------------------- audio ----
def synth(tts, text: str, voice: str, wav: Path, exaggeration=0.5, cfg=0.5):
    import torchaudio

    ref = None
    if voice == "F" and REF_FEMALE.exists():
        ref = str(REF_FEMALE)
    elif voice == "M" and REF_MALE.exists():
        ref = str(REF_MALE)

    try:
        if ref:
            wav_t = tts.generate(text, audio_prompt_path=ref, exaggeration=exaggeration, cfg_weight=cfg)
        else:
            wav_t = tts.generate(text, exaggeration=exaggeration, cfg_weight=cfg)
    except TypeError:
        wav_t = tts.generate(text)

    sr = getattr(tts, "sr", 24000)
    wav.parent.mkdir(parents=True, exist_ok=True)
    torchaudio.save(str(wav), wav_t.cpu(), sr)
    return wav_t.shape[-1] / sr


def concat(wavs, out_mp3: Path, gap_ms=260):
    """Concatenate wavs with a short silence between turns."""
    if not wavs:
        return False
    import torch
    import torchaudio

    sr = getattr(_TTS["model"], "sr", 24000)
    silence = torch.zeros(1, int(sr * gap_ms / 1000))
    chunks = []
    for i, w in enumerate(wavs):
        t, _ = torchaudio.load(str(w))
        chunks.append(t)
        if i < len(wavs) - 1:
            chunks.append(silence)
    cat = torch.cat(chunks, dim=-1)

    out_mp3.parent.mkdir(parents=True, exist_ok=True)
    tmp_wav = out_mp3.with_suffix(".concat.wav")
    torchaudio.save(str(tmp_wav), cat, sr)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp_wav),
           "-c:a", "libmp3lame", "-q:a", "2", "-ar", "44100", str(out_mp3)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    tmp_wav.unlink(missing_ok=True)
    if r.returncode != 0:
        print(r.stderr[-400:])
        return False
    return True


# ----------------------------------------------------------------- main ----
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--suite", required=True)
    ap.add_argument("--out", default=str(ROOT / "public/audio/suite"))
    ap.add_argument("--model", default="nano", choices=["nano", "full"])
    ap.add_argument("--device", default="cpu")
    ap.add_argument("--only", default="", help="comma job ids or prefixes, e.g. L1,GV_q01")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--exaggeration", type=float, default=0.5)
    ap.add_argument("--cfg", type=float, default=0.5)
    args = ap.parse_args()

    suite_path = Path(args.suite)
    if not suite_path.is_absolute():
        suite_path = ROOT / suite_path
    suite = json.loads(suite_path.read_text(encoding="utf-8"))
    stem = suite_path.stem
    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = ROOT / out_dir
    out_dir = out_dir / stem

    jobs = build_plan(suite)
    filt = [x.strip().lower() for x in args.only.split(",") if x.strip()]
    if filt:
        jobs = [j for j in jobs if any(j["id"].lower().startswith(f) for f in filt)]

    total_chars = sum(len(t) for j in jobs for _, t in j["turns"])
    print(f"suite: {suite.get('title')}")
    print(f"jobs: {len(jobs)}  chars: {total_chars}  -> {out_dir}\n")

    if args.dry:
        for j in jobs:
            print(f"[{j['id']}] {j['kind']} ({len(j['turns'])} turns)")
            for v, t in j["turns"]:
                print(f"   {v}: {t[:100]}")
        return

    tts = get_tts(args.device, args.model)
    manifest = {"suite": stem, "title": suite.get("title"), "engine": f"chatterbox-{args.model}",
                "device": args.device, "files": []}

    for j in jobs:
        out_mp3 = out_dir / f"{j['id']}.mp3"
        print(f"[{j['id']}] {j['kind']} — {len(j['turns'])} turn(s)")
        if out_mp3.exists() and not args.force:
            print(f"   exists ({out_mp3.stat().st_size} B) — skip (--force to overwrite)")
            manifest["files"].append({"id": j["id"], "kind": j["kind"], "title": j["title"],
                                      "file": out_mp3.name, "skipped": True})
            continue
        with tempfile.TemporaryDirectory() as tmp:
            tmp = Path(tmp)
            wavs, secs = [], 0.0
            for i, (v, t) in enumerate(j["turns"]):
                w = tmp / f"t{i:02d}.wav"
                d = synth(tts, t, v, w, args.exaggeration, args.cfg)
                secs += d
                wavs.append(w)
                print(f"   {v}: {d:5.1f}s  {t[:70]}")
            if concat(wavs, out_mp3):
                print(f"   -> {out_mp3.name} ({out_mp3.stat().st_size} B, {secs:.1f}s audio)")
                manifest["files"].append({"id": j["id"], "kind": j["kind"], "title": j["title"],
                                          "file": out_mp3.name, "duration_s": round(secs, 1),
                                          "turns": [{"voice": v, "text": t} for v, t in j["turns"]]})
            else:
                print("   FAILED")

    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nmanifest: {out_dir / 'manifest.json'}")


if __name__ == "__main__":
    main()
