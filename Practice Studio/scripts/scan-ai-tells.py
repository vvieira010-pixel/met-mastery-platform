"""Scan bank masters for humanizer patterns. Reports hits, changes nothing."""
import json
import re
from pathlib import Path

INC = Path("Practice Studio/incoming")
FILES = {
    "grammar": INC / "grammar" / "grammar_92_questions.json",
    "writing": INC / "writing" / "met_writing_76_prompts.json",
    "speaking": INC / "speaking" / "Describe the Image Exercises" / "met_speaking_29_prompts.json",
    "vocab": INC / "vocabulary" / "b2_vocabulary_55_questions.json",
}

AI_WORDS = ["crucial", "delve", "vibrant", "tapestry", "pivotal", "showcase", "showcasing",
            "testament", "underscore", "underscores", "fostering", "garner", "interplay",
            "intricate", "intricacies", "enduring", "additionally", "pivotal",
            "breathtaking", "renowned", "nestled", "boasts", "groundbreaking",
            "key role", "pivotal moment", "marking a", "serves as", "stands as",
            "not only", "not just about", "it's not merely", "from vibrant",
            "in the heart of", "must-visit", "stunning", "indelible", "evolving landscape"]

PATTERNS = {
    "em_dash": "—",
    "en_dash": "–",
    "dbl_hyphen": "--",
}


def texts(doc, skill):
    if skill == "grammar":
        for q in doc.get("questions", []):
            yield q["id"], "question", q.get("question", "")
            for k, v in q.get("options", {}).items():
                yield q["id"], f"option_{k}", v
            yield q["id"], "explanation", q.get("explanation", "")
    elif skill == "writing":
        for p in doc.get("prompts", []):
            yield p["id"], "prompt", p.get("prompt", "")
    elif skill == "speaking":
        for pack in doc.get("prompts", []):
            for t in pack.get("tasks", []):
                yield f"s{pack['setId']}t{t['number']}", "prompt", t.get("prompt", "")
    else:
        for q in doc.get("questions", []):
            yield q["id"], "question", q.get("question", "")
            for i, v in enumerate(q.get("options", [])):
                yield q["id"], f"option_{i}", v if isinstance(v, str) else str(v)
            yield q["id"], "explanation", q.get("explanation", "")


for skill, path in FILES.items():
    doc = json.loads(path.read_text(encoding="utf-8"))
    hits = {}
    n = 0
    for _id, field, text in texts(doc, skill):
        n += 1
        low = text.lower()
        for w in AI_WORDS:
            if w.lower() in low:
                hits.setdefault(w, []).append(f"{_id}/{field}")
        for name, ch in PATTERNS.items():
            if ch in text:
                hits.setdefault(name, []).append(f"{_id}/{field}")
    print(f"== {skill}: {n} strings ==")
    for w, ids in sorted(hits.items(), key=lambda x: -len(x[1])):
        print(f"  {w}: {len(ids)} e.g. {ids[:4]}")
