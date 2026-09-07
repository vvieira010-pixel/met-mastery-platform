"""Structural (no-LLM) doc extractor + merge with AST + cluster + render.

Deliverable until the LLM-semantic pass (rate-limited until 09:03 UTC) can run.
Builds:
  graphify-out/graph.json   (merged, clustered)
  graphify-out/graph.svg
  graphify-out/graph.graphml
  graphify-out/graph.html   (callflow interactive viz)
  graphify-out/GRAPH_REPORT.md
"""
import json, re, sys, math
from pathlib import Path

ROOT = Path(".")
DETECT = Path("graphify-out/.graphify_detect.json")
AST = Path("graphify-out/.graphify_ast.json")
OUT = Path("graphify-out")
OUT.mkdir(exist_ok=True)

detect = json.loads(DETECT.read_text(encoding="utf-8"))
scan_root = Path(detect["scan_root"])

doc_files = [Path(f) for f in (detect["files"].get("document", []) + detect["files"].get("paper", []))]

slug_re = re.compile(r"[^a-z0-9]+")
def slug(s):
    return slug_re.sub("_", s.strip().lower()).strip("_")[:60] or "x"

def rel(p):
    try:
        return Path(p).relative_to(scan_root).as_posix()
    except Exception:
        return Path(p).as_posix()

# normalized rel path -> doc file node id
rel_ids = {}
for p in doc_files:
    rid = slug(rel(p).replace("/", "_"))
    rel_ids[rel(p)] = rid
    rel_ids[rel(p).lower()] = rid

def parse_frontmatter(text):
    meta = {}
    m = re.match(r"^\ufeff?---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip()
    return meta

link_re = re.compile(r"\[[^\]]*\]\(([^)]+)\)")
heading_re = re.compile(r"^(#{1,3})\s+(.+?)\s*#*\s*$", re.MULTILINE)
anchor_re = re.compile(r"\[[^\]]+\]\(#([a-z0-9_-]+)\)", re.IGNORECASE)

nodes = []
edges = []
seen_node = set()
seen_edge = set()
fm_cache = {}

def add_node(nid, label, file_type, source_file, fm):
    if nid in seen_node:
        return
    seen_node.add(nid)
    nodes.append({
        "id": nid, "label": label, "file_type": file_type,
        "source_file": source_file, "source_location": None,
        "source_url": fm.get("source_url"), "captured_at": fm.get("captured_at"),
        "author": fm.get("author"), "contributor": fm.get("contributor"),
        "_origin": "struct",
    })

def add_edge(s, t, relation, conf, score, sf, sl=None):
    key = (s, t, relation)
    if s == t or key in seen_edge:
        return
    seen_edge.add(key)
    edges.append({
        "source": s, "target": t, "relation": relation, "confidence": conf,
        "confidence_score": score, "source_file": sf, "source_location": sl,
        "weight": 1.0, "_origin": "struct",
    })

for p in doc_files:
    try:
        text = p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    rf = rel(p)
    fid = rel_ids[rf]
    fm = parse_frontmatter(text)
    fm_cache[fid] = fm
    add_node(fid, p.name, "document", rf, fm)
    # headings -> topic nodes (cap 15)
    for hh in heading_re.finditer(text):
        level = len(hh.group(1))
        htext = hh.group(2).strip()
        if level > 3 or not htext:
            continue
        hid = f"{fid}_{slug(htext)}"
        add_node(hid, htext, "rationale", rf, fm)
        add_edge(fid, hid, "conceptually_related_to", "EXTRACTED", 1.0, rf, hh.start())
    # cross-file links -> references edges
    for lm in link_re.finditer(text):
        target = lm.group(1).strip()
        if target.startswith("#") or target.startswith("http") or target.startswith("mailto"):
            continue
        tpath = (p.parent / target.split("#")[0]).resolve()
        try:
            trel = tpath.relative_to(scan_root).as_posix()
        except Exception:
            continue
        tid = rel_ids.get(trel) or rel_ids.get(trel.lower())
        if tid and tid != fid:
            add_edge(fid, tid, "references", "EXTRACTED", 1.0, rf, lm.start())

# merge AST
ast = json.loads(AST.read_text(encoding="utf-8"))
ast_nodes = ast.get("nodes", [])
ast_edges = ast.get("edges", [])

# de-dup struct nodes vs ast ids
ast_ids = {n["id"] for n in ast_nodes}
final_nodes = list(ast_nodes)
for n in nodes:
    if n["id"] in ast_ids:
        ast_ids.add(n["id"])
        continue
    final_nodes.append(n)

final_edges = list(ast_edges) + edges

raw = {
    "nodes": final_nodes, "edges": final_edges,
    "input_tokens": ast.get("input_tokens", 0),
    "output_tokens": ast.get("output_tokens", 0),
    "failed_sources": ast.get("failed_sources", []),
    "extraction_method": "ast(code)+structural(docs); llm-semantic layer pending rate-limit reset 2026-09-07T09:03Z",
}
OUT.joinpath(".graphify_merged_raw.json").write_text(json.dumps(raw, ensure_ascii=False))

print(f"merged: {len(final_nodes)} nodes, {len(final_edges)} edges "
      f"(ast {len(ast_nodes)}/{len(ast_edges)} + struct {len(nodes)}/{len(edges)} / docs {len(doc_files)})")
