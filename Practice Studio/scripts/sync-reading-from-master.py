"""Overwrite staged reading copies + app module items from the master pack (match by id)."""
import json
from pathlib import Path

ROOT = Path(".")
CUR = ROOT / "Practice Studio" / "current" / "by-topic" / "reading"
SRC = ROOT / "src" / "data" / "exercises" / "reading" / "b2-reading.json"


def load(p, enc="utf-8"):
    return json.loads(Path(p).read_text(encoding=enc))


def save(p, obj, enc="utf-8"):
    p = Path(p)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding=enc)


pack = load(ROOT / "Practice Studio" / "incoming" / "reading" / "reading_10_pack.json")
by_id = {ex["id"]: ex for ex in pack["exercises"]}

for f in sorted(CUR.glob("*.json")):
    if f.name == "index.json":
        continue
    cur = load(f)
    for i, ex in enumerate(cur.get("exercises", [])):
        if ex.get("id") in by_id:
            cur["exercises"][i] = by_id[ex["id"]]
    save(f, cur)

data = load(SRC, enc="utf-8-sig")
for m in data.get("modules", []):
    if m.get("id") != "r10_reading_pack":
        continue
    for item in m.get("items", []):
        src = by_id.get(item["id"])
        if not src:
            continue
        item["passage"] = src["passage"]
        for q in item.get("questions", []):
            match = next((x for x in src["questions"] if x["id"] == q["id"]), None)
            if match:
                q["stem"] = match["question"]
                q["question"] = match["question"]
                q["options"] = match["options"]
                q["correct"] = match["correct"]
                q["explanation"] = match.get("explanation", "")
save(SRC, data, enc="utf-8-sig")

blob = (ROOT / "Practice Studio" / "incoming" / "reading" / "reading_10_pack.json").read_text()
assert "—" not in blob and "–" not in blob, "dash remains in master"
print(f"synced {len(by_id)} passages; no em/en dashes")
