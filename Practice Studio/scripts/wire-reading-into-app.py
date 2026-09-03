"""Stage reading pack R10 (10 passages) and wire into b2-reading.json."""
import json
from pathlib import Path

ROOT = Path(".")
CUR = ROOT / "Practice Studio" / "current" / "by-topic" / "reading"
SRC = ROOT / "src" / "data" / "exercises" / "reading" / "b2-reading.json"


def load(p, enc="utf-8"):
    return json.loads(Path(p).read_text(encoding=enc))


def save(p, obj, enc="utf-8"):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding=enc)


pack = load(ROOT / "Practice Studio" / "incoming" / "reading" / "reading_10_pack.json")
items = pack["exercises"]

# 1. Per-passage files in current/by-topic/reading
for ex in items:
    slug = ex["id"].replace("r10-", "")
    dst = CUR / f"{slug}.json"
    if dst.exists():
        cur = load(dst)
    else:
        cur = {"skill": "reading", "topic": slug, "totalExercises": 0, "exercises": []}
    seen = {x.get("id") for x in cur.get("exercises", [])}
    if ex["id"] not in seen:
        cur["exercises"].append(ex)
    cur["totalExercises"] = len(cur["exercises"])
    save(dst, cur)

# 2. Refresh per-skill + top-level indexes
topics = {}
for f in sorted(CUR.glob("*.json")):
    if f.name == "index.json":
        continue
    d = load(f)
    topics[f.stem] = d.get("totalExercises", len(d.get("exercises", [])))
save(CUR / "index.json", {"skill": "reading", "topics": topics,
                          "totalExercises": sum(topics.values())})
top = ROOT / "Practice Studio" / "current" / "by-topic" / "index.json"
idx = load(top)
idx["reading"] = topics
save(top, idx)

# 3. App module (moduleType reading_set; stem+question for both converters; keep BOM)
data = load(SRC, enc="utf-8-sig")
mods = data.setdefault("modules", [])
if not any(m.get("id") == "r10_reading_pack" for m in mods):
    mods.append({
        "id": "r10_reading_pack",
        "moduleType": "reading_set",
        "title": "Reading Pack R10 — Education & Work",
        "skill": "reading",
        "levelRange": "B2",
        "items": [{
            "id": ex["id"],
            "type": "read",
            "passage": ex["passage"],
            "source": ex.get("source", ""),
            "questions": [{
                "id": q["id"],
                "stem": q["question"],
                "question": q["question"],
                "options": q["options"],
                "correct": q["correct"],
                "explanation": q.get("explanation", ""),
            } for q in ex["questions"]],
        } for ex in items],
    })
save(SRC, data, enc="utf-8-sig")

nq = sum(len(ex["questions"]) for ex in items)
print(f"passages={len(items)} questions={nq} reading_topics={len(topics)} reading_total={sum(topics.values())}")
