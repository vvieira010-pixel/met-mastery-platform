"""Convert incoming packs to app-native bank files under src/. Run once with: py "Practice Studio/scripts/wire-packs-into-app.py\""""
import json
from pathlib import Path

ROOT = Path(".")
INC = ROOT / "Practice Studio" / "incoming"
SRC = ROOT / "src" / "data" / "exercises"


def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def dump_js(path, export_name, obj):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    body = json.dumps(obj, ensure_ascii=False, indent=2)
    path.write_text(f"export const {export_name} = {body};\n", encoding="utf-8")


TITLES = {
    "work_career": "Work and Career",
    "healthcare": "Healthcare and Patient Care",
    "education": "Education and Learning",
    "technology": "Technology and Digital Life",
    "environment": "Environment and Sustainability",
    "community": "Community and Public Services",
    "travel_culture": "Travel, Culture, and Moving Abroad",
    "money_consumer": "Money, Consumer Choices, and Advertising",
    "family_relationships": "Family, Relationships, and Social Life",
    "media_news": "Media, News, and Communication",
    "general": "General Vocabulary",
}

# 1. Grammar 92 -> mcq bank (fixes getGrammarExercises nil-spread)
g = load(INC / "grammar" / "grammar_92_questions.json")
mcqs = []
for q in g["questions"]:
    opts = [q["options"][k] for k in ("A", "B", "C", "D")]
    mcqs.append({
        "id": q["id"], "type": "mcq", "level": q.get("level", "B2"),
        "skill": "Grammar", "category": q.get("category"),
        "question": q["question"], "options": opts,
        "correct": ("A", "B", "C", "D").index(q["correct_answer"]),
        "explanation": q.get("explanation", ""),
    })
dump_js(SRC / "grammar" / "grammar-92.js", "grammarMCQs", mcqs)

# 2. Vocabulary 55 -> general bucket
v = load(INC / "vocabulary" / "b2_vocabulary_55_questions.json")
vout = []
for q in v["questions"]:
    vout.append({
        "id": q["id"], "type": "mcq", "topic": TITLES["general"],
        "level": q.get("level", "B2"), "question": q["question"],
        "options": q["options"], "correct": q["options"].index(q["correct"]),
        "explanation": q.get("explanation", ""),
    })
dump_js(SRC / "vocabulary" / "vocab-55.js", "vocabAddon", {"general": vout})

# 3+4. Speaking 29 sets (tasks 2-5; task 1 needs an image per README) + writing 76
SPK_MAP = {"Shopping": "money_consumer", "Parks": "community", "Work": "work_career",
    "Food": "money_consumer", "Travel": "travel_culture", "Education": "education",
    "Health and Fitness": "healthcare", "Music": "media_news", "Vacation": "travel_culture",
    "Library": "education", "Healthcare": "healthcare", "Museums": "travel_culture",
    "Transportation": "travel_culture", "Family": "family_relationships", "Sports": "community",
    "Cafés": "money_consumer", "Technology": "technology", "Pets": "family_relationships",
    "Weather": "environment", "Community": "community", "Environment": "environment",
    "Books": "education", "Jobs": "work_career", "Online Learning": "education",
    "Housing": "community", "Science": "technology", "Movies": "media_news",
    "Public Safety": "community", "Social Media": "media_news"}
WRI_MAP = {"Education": "education", "Technology": "technology", "Work": "work_career",
    "Environment": "environment", "Health": "healthcare", "Culture": "travel_culture",
    "Transportation": "travel_culture", "Social Media": "media_news", "Housing": "community",
    "Science": "technology"}

s = load(INC / "speaking" / "Describe the Image Exercises" / "met_speaking_29_prompts.json")
spk = {}
for pack in s["prompts"]:
    bucket = SPK_MAP[pack["topic"]]
    for t in pack["tasks"]:
        if t["number"] == 1:
            continue  # picture description without linked image
        spk.setdefault(bucket, []).append({
            "id": f"spk_{pack['setId']}_{t['number']}", "type": "speak",
            "topic": TITLES[bucket], "level": "B2", "prompt": t["prompt"],
            "targetSeconds": t["seconds"], "metTask": t["type"], "setId": pack["setId"],
        })
dump_js(SRC / "vocabulary" / "speaking-29.js", "speakingAddon", spk)

w = load(INC / "writing" / "met_writing_76_prompts.json")
wri = {}
for p in w["prompts"]:
    bucket = WRI_MAP[p["topic"]]
    wri.setdefault(bucket, []).append({
        "id": p["id"], "type": "short", "topic": TITLES[bucket],
        "level": "B2", "prompt": p["prompt"], "rubric": p.get("instructions", ""),
        "targetWords": 100 if p.get("task") == 1 else 250,
        "timeMinutes": p.get("time_minutes"), "kind": p.get("kind"),
    })
dump_js(SRC / "vocabulary" / "writing-76.js", "writingAddon", wri)

n_spk = sum(len(v) for v in spk.values())
n_wri = sum(len(v) for v in wri.values())
print(f"grammar={len(mcqs)} vocab={len(vout)} speaking={n_spk} writing={n_wri}")
