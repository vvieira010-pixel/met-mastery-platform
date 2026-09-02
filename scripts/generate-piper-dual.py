#!/usr/bin/env python3
import json, subprocess, pathlib, wave, tempfile, os, re

base = pathlib.Path(r"C:\Users\vviei\Plarform0.2")
json_path = base / "src/data/exercises/listening/gemini-listening-10.json"
out_dir = base / "public/exercises/audio/listening"
voices_dir = base / "voices"
amy = voices_dir / "en_US-amy-medium.onnx"
ryan = voices_dir / "en_US-ryan-medium.onnx"

data = json.loads(json_path.read_text(encoding="utf-8"))
items = data["items"]

def clean_text(t):
    return re.sub(r'\s+', ' ', t).strip()

def get_segments(script_part):
    # Split by lines, detect Woman:/Man:
    lines = [l.strip() for l in script_part.split("\n") if l.strip()]
    segments = []
    for line in lines:
        # Remove [Audio Script] marker already removed in JS, but handle here just in case
        line = line.replace("[Audio Script]", "").strip()
        if not line:
            continue
        m = re.match(r'^(Woman|Man)\s*:\s*(.*)', line, re.I)
        if m:
            speaker = m.group(1).lower()
            text = m.group(2).strip()
            voice = str(amy) if speaker == "woman" else str(ryan)
            label = speaker
        else:
            # No explicit speaker, decide by content: if script contains both Woman/Man somewhere, default to amy
            text = line
            voice = str(amy)
            label = "neutral"
        if text:
            segments.append((label, voice, clean_text(text)))
    # If no segments found (single paragraph), use whole script as one segment
    if not segments and script_part.strip():
        segments.append(("neutral", str(amy), clean_text(script_part)))
    return segments

def synth(text, model, out_wav):
    # piper --model model --output_file out_wav
    # Use piper.exe from PATH
    proc = subprocess.run(
        ["piper", "--model", model, "--output_file", str(out_wav)],
        input=text.encode("utf-8"),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    if proc.returncode != 0:
        print(f" piper error: {proc.stderr.decode()[:500]}")
        return False
    return True

def concat_wavs(wav_paths, out_path, silence_ms=300):
    # All piper wavs are 22050Hz, 1 channel, 16-bit
    # Add silence between segments
    import struct
    # Read first to get params
    if not wav_paths:
        return
    # Use first file params
    with wave.open(str(wav_paths[0]), 'rb') as w:
        params = w.getparams()
        nchannels, sampwidth, framerate, nframes, comptype, compname = params
    # silence frames
    silence_frames = int(framerate * silence_ms / 1000)
    silence_data = b'\x00' * silence_frames * nchannels * sampwidth
    with wave.open(str(out_path), 'wb') as out:
        out.setnchannels(nchannels)
        out.setsampwidth(sampwidth)
        out.setframerate(framerate)
        out.setcomptype(comptype, compname)
        for i, p in enumerate(wav_paths):
            with wave.open(str(p), 'rb') as w:
                # Ensure same params else skip conversion
                if (w.getnchannels(), w.getsampwidth(), w.getframerate()) != (nchannels, sampwidth, framerate):
                    print(f" warn param mismatch {p}")
                out.writeframes(w.readframes(w.getnframes()))
            if i < len(wav_paths) - 1:
                out.writeframes(silence_data)

out_dir.mkdir(parents=True, exist_ok=True)

for it in items:
    rawQ = it.get("question","")
    parts = rawQ.split("[Question]")
    script_part = parts[0].replace("[Audio Script]","").strip() if len(parts)>1 else rawQ
    # If script_part still contains question, fallback: use script before [Question] else use whole
    segments = get_segments(script_part)
    print(f"[{it['id']}] {len(segments)} segments -> gemini-listening-{it['id']}.wav")
    for label, voice, text in segments:
        print(f"  {label} ({pathlib.Path(voice).stem[:8]}): {text[:60]}...")
    # Generate temp wavs
    tmp_files = []
    for idx, (label, voice, text) in enumerate(segments):
        tmp = pathlib.Path(tempfile.gettempdir()) / f"gemini-{it['id']}-{idx}.wav"
        ok = synth(text, voice, tmp)
        if ok and tmp.exists():
            tmp_files.append(tmp)
        else:
            print(f"  failed segment {idx}")
    # Concat
    out_path = out_dir / f"gemini-listening-{it['id']}.wav"
    if tmp_files:
        concat_wavs(tmp_files, out_path)
        print(f" -> {out_path} {out_path.stat().st_size} bytes")
        # Cleanup temps
        for t in tmp_files:
            try: t.unlink()
            except: pass
    else:
        print(f"  no output for {it['id']}")

print("Done. Checking outputs:")
for p in sorted(out_dir.glob("gemini-listening-*.wav")):
    print(p.name, p.stat().st_size)
