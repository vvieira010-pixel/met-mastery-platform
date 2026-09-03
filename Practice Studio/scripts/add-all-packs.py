"""Merge incoming practice packs (writing/speaking/vocabulary) into current/. Grammar handled by add-grammar-pack.mjs."""
import json
import shutil
from pathlib import Path

BASE = Path("Practice Studio")
CUR = BASE / "current" / "by-topic"
SKILLS = BASE / "current" / "skills"


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def save(p, obj):
    p = Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def merge_list(dst, items, key):
    old = dst.get("exercises", []) or []
    seen = set()
    for x in old:
        k = key(x)
        if k is not None:
            seen.add(k)
    merged = list(old)
    for x in items:
        k = key(x)
        if k is None or k not in seen:
            merged.append(x)
            if k is not None:
                seen.add(k)
    dst["exercises"] = merged
    dst["totalExercises"] = len(merged)
    return len(merged) - len(old)


def refresh_plain_index(skill):
    d = CUR / skill
    topics = {}
    for f in sorted(d.glob("*.json")):
        if f.name == "index.json":
            continue
        try:
            item = load(f)
        except Exception:
            continue
        topics[f.stem] = item.get("totalExercises", len(item.get("exercises", [])))
    save(d / "index.json", topics)
    return topics


# 1. Writing: master + by-topic merge
w_master = BASE / "incoming" / "writing" / "met_writing_76_prompts.json"
w_dest = SKILLS / "writing" / "met_writing_76_prompts.json"
w_dest.parent.mkdir(parents=True, exist_ok=True)
if not w_dest.exists():
    shutil.copyfile(w_master, w_dest)
w_added = 0
for src in sorted((BASE / "incoming" / "writing" / "by-topic").glob("*.json")):
    if src.name == "index.json":
        continue
    data = load(src)
    items = data.get("exercises", [])
    dst = CUR / "writing" / src.name
    if dst.exists():
        cur = load(dst)
    else:
        cur = {"skill": "writing", "topic": data.get("topic", src.stem),
               "totalExercises": 0, "exercises": []}
    cur.setdefault("skill", "writing")
    w_added += merge_list(cur, items, key=lambda x: x.get("id"))
    save(dst, cur)
w_topics = refresh_plain_index("writing")

# 2. Speaking: master + by-topic merge (skip task 1 picture descriptions per README)
s_master = BASE / "incoming" / "speaking" / "Describe the Image Exercises" / "met_speaking_29_prompts.json"
s_dest = SKILLS / "speaking" / "met_speaking_29_prompts.json"
s_dest.parent.mkdir(parents=True, exist_ok=True)
if not s_dest.exists():
    shutil.copyfile(s_master, s_dest)
for name in ["60-second-speaking-tasks.json", "describe-the-picture-60-second-tasks.json"]:
    src = BASE / "incoming" / "speaking" / "60 seconds" / name
    dst = SKILLS / "speaking" / "60 seconds" / name
    if src.exists() and not dst.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
for name in ["90-second-speaking-tasks.json"]:
    src = BASE / "incoming" / "speaking" / "90 seconds" / name
    dst = SKILLS / "speaking" / "90 seconds" / name
    if src.exists() and not dst.exists():
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dst)
s_added = 0
for src in sorted((BASE / "incoming" / "speaking" / "by-topic").glob("*.json")):
    if src.name == "index.json":
        continue
    data = load(src)
    items = data.get("exercises", [])
    dst = CUR / "speaking" / src.name
    if dst.exists():
        cur = load(dst)
    else:
        cur = {"skill": "speaking", "topic": src.stem, "totalExercises": 0, "exercises": []}
    cur.setdefault("skill", "speaking")
    s_added += merge_list(cur, items, key=lambda x: (x.get("setId"), x.get("number")))
    save(dst, cur)
s_topics = refresh_plain_index("speaking")

# 3. Vocabulary: master + by-type + by-topic (uncategorized has no topic metadata)
v_master = BASE / "incoming" / "vocabulary" / "b2_vocabulary_55_questions.json"
v_dest = SKILLS / "vocabulary" / "b2_vocabulary_55_questions.json"
v_dest.parent.mkdir(parents=True, exist_ok=True)
if not v_dest.exists():
    shutil.copyfile(v_master, v_dest)
vdata = load(v_master)
by_type = {}
for q in vdata.get("questions", []):
    by_type.setdefault(q.get("type"), []).append(q)
for t, qs in by_type.items():
    tdir = t.replace("_", "-")
    src = BASE / "incoming" / "vocabulary" / tdir / f"{tdir}-questions.json"
    if src.exists():
        cur = load(src)
        qkey = "questions"
        old = cur.get(qkey, [])
        seen = {x.get("id") for x in old if x.get("id")}
        new = [x for x in qs if x.get("id") not in seen]
        cur[qkey] = old + new
        cur["total_questions"] = len(cur[qkey])
        save(src, cur)
    dst = SKILLS / "vocabulary" / "by-type" / f"{tdir}-questions.json"
    if dst.exists():
        cur = load(dst)
    else:
        cur = {"title": t, "level": "B2", "type": t, "total_questions": 0, "questions": []}
    old = cur.get("questions", [])
    seen = {x.get("id") for x in old if x.get("id")}
    new = [x for x in qs if x.get("id") not in seen]
    cur["questions"] = old + new
    cur["total_questions"] = len(cur["questions"])
    save(dst, cur)
v_added = 0
for src in sorted((BASE / "incoming" / "vocabulary" / "by-topic").glob("*.json")):
    if src.name == "index.json":
        continue
    data = load(src)
    dst = CUR / "vocabulary" / src.name
    if dst.exists():
        cur = load(dst)
    else:
        cur = {"skill": "vocabulary", "topic": src.stem, "totalExercises": 0, "exercises": []}
    cur.setdefault("skill", "vocabulary")
    v_added += merge_list(cur, data.get("exercises", []), key=lambda x: x.get("id"))
    save(dst, cur)
v_topics = refresh_plain_index("vocabulary")

# 4. Top-level index sync (grammar section from per-skill wrapped index)
top = CUR / "index.json"
idx = load(top)
gidx = load(CUR / "grammar" / "index.json")
idx["grammar"] = gidx.get("topics", {})
idx["writing"] = w_topics
idx["speaking"] = s_topics
idx["vocabulary"] = v_topics
save(top, idx)

print(f"writing: +{w_added} topics={len(w_topics)} total={sum(w_topics.values())}")
print(f"speaking: +{s_added} topics={len(s_topics)} total={sum(s_topics.values())}")
print(f"vocabulary: +{v_added} topics={len(v_topics)} total={sum(v_topics.values())}")
print(f"grammar topics={len(idx['grammar'])} total={sum(idx['grammar'].values())}")
