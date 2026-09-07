"""
Local, no-API audio evaluation via openai-whisper.

Transcribes an audio file and derives fluency/Delivery signals from Whisper's
segment timings (pauses, words-per-minute). Useful for bulk-evaluating the
recordings already in dist/ without paying for any cloud ASR.

Usage:
  python evaluate_audio.py path/to/audio.webm
  python evaluate_audio.py dist/foo.mp3 --model base --language en --json

Output (text): transcript + a short fluency summary.
Output (--json): full { transcript, language, durationSec, fluency, segments }.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from runner import transcribe


def pause_stats(segments):
    """Coarse fluency signals from Whisper segment boundaries."""
    gaps = []
    for i in range(1, len(segments)):
        g = segments[i]["start"] - segments[i - 1]["end"]
        if g >= 0:
            gaps.append(g)

    wc = sum(len(s["text"].split()) for s in segments)
    dur = segments[-1]["end"] if segments else 0.0
    return {
        "wordCount": wc,
        "durationSec": round(dur, 2),
        "wpm": round(wc / (dur / 60), 1) if dur else None,
        "pausesOver0_5": sum(1 for g in gaps if g >= 0.5),
        "pausesOver1_2": sum(1 for g in gaps if g >= 1.2),
        "longestGapsSec": [round(g, 2) for g in sorted(gaps, reverse=True)[:6]],
        "avgNoSpeechProb": round(
            sum(s["no_speech_prob"] for s in segments) / len(segments), 4
        )
        if segments
        else None,
    }


def main():
    ap = argparse.ArgumentParser(description="Local Whisper audio evaluation (no API).")
    ap.add_argument("audio", help="path to an audio file")
    ap.add_argument("--model", default=os.environ.get("WHISPER_MODEL", "base"))
    ap.add_argument("--language", default="en")
    ap.add_argument("--json", action="store_true", help="emit full JSON")
    args = ap.parse_args()

    with open(args.audio, "rb") as fh:
        data = fh.read()

    res = transcribe(data, model=args.model, language=args.language)
    stats = pause_stats(res["segments"])

    if args.json:
        print(
            json.dumps(
                {
                    "transcript": res["text"],
                    "language": res["language"],
                    "durationSec": res["duration"],
                    "fluency": stats,
                    "segments": res["segments"],
                },
                ensure_ascii=False,
                indent=2,
            )
        )
        return

    print("=== Transcript ===")
    print(res["text"] or "(no speech detected)")
    print("\n=== Fluency (Delivery signal) ===")
    print(f" language      : {res['language']}")
    print(f" duration      : {stats['durationSec']}s")
    print(f" word count    : {stats['wordCount']}")
    print(f" speaking rate : {stats['wpm']} wpm (conversational ~150)")
    print(f" pauses >=0.5s : {stats['pausesOver0_5']}")
    print(f" pauses >=1.2s : {stats['pausesOver1_2']}")
    print(f" longest gaps  : {stats['longestGapsSec']}s")
    print(f" avg no-speech : {stats['avgNoSpeechProb']}")


if __name__ == "__main__":
    main()
