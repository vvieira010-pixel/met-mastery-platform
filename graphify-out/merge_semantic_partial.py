"""Merge AST + semantic chunks 01-07 into .graphify_merged_raw.json."""
import json
from pathlib import Path

OUT = Path("graphify-out")
AST = json.loads(OUT.joinpath(".graphify_ast.json").read_text(encoding="utf-8"))

nodes = {}
edges = {}
hyperedges = []
input_tokens = AST.get("input_tokens", 0)
output_tokens = AST.get("output_tokens", 0)
failed = list(AST.get("failed_sources", []))

for n in AST.get("nodes", []):
    nodes[n["id"]] = n
for e in AST.get("edges", []):
    key = (e.get("source"), e.get("target"), e.get("relation"))
    edges[key] = e

for i in range(1, 8):
    p = OUT / f".graphify_chunk_{i:02d}.json"
    if not p.exists():
        continue
    chunk = json.loads(p.read_text(encoding="utf-8"))
    input_tokens += chunk.get("input_tokens", 0)
    output_tokens += chunk.get("output_tokens", 0)
    failed.extend(chunk.get("failed_sources", []))
    for n in chunk.get("nodes", []):
        nid = n["id"]
        if nid in nodes:
            # merge non-null attrs from semantic into existing
            for k, v in n.items():
                if v is not None:
                    nodes[nid][k] = v
        else:
            nodes[nid] = n
    for e in chunk.get("edges", []):
        key = (e.get("source"), e.get("target"), e.get("relation"))
        edges[key] = e
    hyperedges.extend(chunk.get("hyperedges", []))

raw = {
    "nodes": list(nodes.values()),
    "edges": list(edges.values()),
    "hyperedges": hyperedges,
    "input_tokens": input_tokens,
    "output_tokens": output_tokens,
    "failed_sources": failed,
    "extraction_method": "ast(code) + partial-llm(docs): chunks 01-07/19 extracted; chunks 08-19 pending rate-limit reset 2026-09-07T09:23Z",
}
OUT.joinpath(".graphify_merged_raw.json").write_text(json.dumps(raw, ensure_ascii=False))
print(f"merged: {len(raw['nodes'])} nodes, {len(raw['edges'])} edges, {len(raw['hyperedges'])} hyperedges")
