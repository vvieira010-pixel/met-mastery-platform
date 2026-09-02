import json, os

os.makedirs("output", exist_ok=True)


def q(n, qtype, question, a, b, c, d, correct, expl):
    return {"number": n, "type": qtype, "question": question,
            "options": {"A": a, "B": b, "C": c, "D": d},
            "correct": correct, "explanation": expl}


passages = []


def single(pid, topic, intro, text, qs):
    passages.append({"passageId": pid, "kind": "single", "topic": topic, "intro": intro, "text": text, "questions": qs})
