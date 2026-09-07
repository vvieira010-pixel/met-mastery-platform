"""Build nx.Graph from merged raw, cluster, render viz + report."""
import json, subprocess, sys
from pathlib import Path

import networkx as nx
from graphify.cluster import cluster, label_communities_by_hub, score_all
from graphify import export, analyze, report as report_mod

OUT = Path("graphify-out")
raw = json.loads(OUT.joinpath(".graphify_merged_raw.json").read_text(encoding="utf-8"))
detect = json.loads(OUT.joinpath(".graphify_detect.json").read_text(encoding="utf-8"))

G = nx.Graph()
for n in raw["nodes"]:
    nid = n["id"]
    if not nid:
        continue
    G.add_node(nid, **{k: v for k, v in n.items() if k != "id"})
for e in raw["edges"]:
    s, t = e.get("source"), e.get("target")
    if not s or not t or s == t:
        continue
    G.add_edge(s, t, **{k: v for k, v in e.items() if k not in ("source", "target")})

print(f"nx.Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges", flush=True)

communities = cluster(G, resolution=1.0)
labels = label_communities_by_hub(G, communities)
cohesion = score_all(G, communities)
print(f"communities: {len(communities)}", flush=True)

# exports
export.to_json(G, communities, str(OUT / "graph.json"), force=True,
               community_labels=labels, built_at_commit=None)
try:
    export.to_svg(G, communities, str(OUT / "graph.svg"), community_labels=labels)
    print("wrote graph.svg", flush=True)
except Exception as ex:
    print("to_svg skipped (matplotlib missing):", ex, flush=True)
export.to_graphml(G, communities, str(OUT / "graph.graphml"))
print("wrote graph.json / graph.graphml", flush=True)

# analysis
god = analyze.god_nodes(G, top_n=12)
try:
    qs = analyze.suggest_questions(G, communities, labels, top_n=7)
except Exception as ex:
    print("suggest_questions failed:", ex, flush=True)
    qs = []
token_cost = {"input": raw.get("input_tokens", 0), "output": raw.get("output_tokens", 0)}

# report (best-effort)
try:
    md = report_mod.generate(
        G, communities, cohesion, labels, god, [], detect,
        token_cost, detect["scan_root"], suggested_questions=qs,
    )
    OUT.joinpath("GRAPH_REPORT.md").write_text(md, encoding="utf-8")
    print("wrote GRAPH_REPORT.md", flush=True)
except Exception as ex:
    print("report.generate failed:", repr(ex), flush=True)
    # minimal fallback report
    lines = ["# GRAPH_REPORT", "", f"nodes={G.number_of_nodes()} edges={G.number_of_edges()} communities={len(communities)}", ""]
    OUT.joinpath("GRAPH_REPORT.md").write_text("\n".join(lines), encoding="utf-8")

# callflow html
try:
    p = report_mod.__file__  # noop
    from graphify import callflow_html
    out = callflow_html.write_callflow_html(
        graphify_out=str(OUT), graph=str(OUT / "graph.json"),
        report=str(OUT / "GRAPH_REPORT.md"), output=str(OUT / "graph.html"),
        lang="en",
    )
    print("wrote", out, flush=True)
except Exception as ex:
    print("callflow_html failed:", repr(ex), flush=True)

# community summary for quick view
summary = []
for cid in sorted(communities, key=lambda c: -len(communities[c])):
    members = communities[cid]
    if len(members) < 3:
        continue
    summary.append((cid, labels.get(cid, f"community {cid}"), len(members),
                    round(cohesion.get(cid, 0.0), 3)))
summary.sort(key=lambda x: -x[2])
print("\nTOP COMMUNITIES:")
for cid, lab, sz, coh in summary[:25]:
    print(f"  [{cid}] {lab}  nodes={sz}  cohesion={coh}")
