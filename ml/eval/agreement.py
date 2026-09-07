#!/usr/bin/env python3
"""Agreement metrics for rubric scoring.

Two jobs, same math:

  1. HUMAN CEILING — score the teacher's pass 1 against pass 2. This number is
     the target every model is measured against. Do this first; if the ceiling
     is 0.70, demanding 0.85 from a model is not a stretch goal, it is nonsense.

  2. MODEL vs GOLD — score model output against adjudicated labels.

Usage
-----
  # human ceiling (two passes, different display IDs, mapping.json links them)
  python ml/eval/agreement.py --a pass1.csv --b pass2.csv --mapping mapping.json \
      --dims task,organization,language

  # model vs adjudicated gold (both keyed by sample_id)
  python ml/eval/agreement.py --a model_scores.csv --b gold.csv --dims task,language,delivery

  # subgroup fairness slices
  python ml/eval/agreement.py --a model.csv --b gold.csv --dims task --slice-by cefr_band

  python ml/eval/agreement.py --selftest

Metrics: quadratic weighted kappa (primary), Spearman rho, MAE, exact and
adjacent agreement, signed bias, and bootstrap 95% intervals. At the sample
sizes this project has, a point estimate without an interval is not a result.
"""

import argparse
import csv
import json
import sys

import numpy as np

BAND_MIN = 0.0
BAND_MAX = 4.0
BAND_STEP = 0.5
DEFAULT_TARGET_FRACTION = 0.90


# ── io ───────────────────────────────────────────────────────────────────────
def read_csv(path):
    with open(path, newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def load_mapping(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def pair_by_mapping(rows_a, rows_b, mapping, key_a="pass1", key_b="pass2"):
    """Join two passes whose display IDs differ (double-blind export)."""
    a_id_to_sample = {m["display_id"]: m["sample_id"] for m in mapping[key_a]}
    b_id_to_sample = {m["display_id"]: m["sample_id"] for m in mapping[key_b]}
    a = {}
    for r in rows_a:
        sid = a_id_to_sample.get(r.get("display_id"))
        if sid:
            a[sid] = r
    b = {}
    for r in rows_b:
        sid = b_id_to_sample.get(r.get("display_id"))
        if sid:
            b[sid] = r
    common = sorted(set(a) & set(b))
    return [a[s] for s in common], [b[s] for s in common]


def pair_by_sample_id(rows_a, rows_b):
    a = {r.get("sample_id"): r for r in rows_a if r.get("sample_id")}
    b = {r.get("sample_id"): r for r in rows_b if r.get("sample_id")}
    common = sorted(set(a) & set(b))
    if not common:
        raise SystemExit("No overlapping sample_id values. Pass --mapping for double-blind exports.")
    return [a[s] for s in common], [b[s] for s in common]


def to_float(value):
    if value is None:
        return np.nan
    s = str(value).strip()
    if not s:
        return np.nan
    try:
        return float(s)
    except ValueError:
        return np.nan


# ── metrics ──────────────────────────────────────────────────────────────────
def _categories(min_band=BAND_MIN, max_band=BAND_MAX, step=BAND_STEP):
    return np.round(np.arange(min_band, max_band + step / 2, step), 6)


def qwk(y_true, y_pred, cats=None):
    """Quadratic weighted kappa. Penalises far-off disagreements quadratically."""
    cats = _categories() if cats is None else cats
    yt = np.asarray(y_true, dtype=float)
    yp = np.asarray(y_pred, dtype=float)
    ok = np.isfinite(yt) & np.isfinite(yp)
    yt, yp = yt[ok], yp[ok]
    if yt.size == 0:
        return float("nan")

    k = len(cats)
    idx_t = np.searchsorted(cats, yt)
    idx_p = np.searchsorted(cats, yp)

    observed = np.zeros((k, k))
    for i, j in zip(idx_t, idx_p):
        observed[i, j] += 1

    hist_t = observed.sum(axis=1)
    hist_p = observed.sum(axis=0)
    expected = np.outer(hist_t, hist_p) / max(observed.sum(), 1e-12)

    diff = np.arange(k)[:, None] - np.arange(k)[None, :]
    weights = (diff.astype(float) ** 2) / ((k - 1) ** 2)

    denom = (weights * expected).sum()
    if denom == 0:
        return 1.0
    return float(1.0 - (weights * observed).sum() / denom)


def _rankdata(x):
    order = np.argsort(x, kind="mergesort")
    ranks = np.empty(len(x), dtype=float)
    ranks[order] = np.arange(1, len(x) + 1, dtype=float)
    # average ties
    xs = np.asarray(x)[order]
    i = 0
    while i < len(xs):
        j = i
        while j + 1 < len(xs) and xs[j + 1] == xs[i]:
            j += 1
        if j > i:
            ranks[order[i : j + 1]] = (i + j + 2) / 2.0
        i = j + 1
    return ranks


def spearman(y_true, y_pred):
    yt = np.asarray(y_true, dtype=float)
    yp = np.asarray(y_pred, dtype=float)
    ok = np.isfinite(yt) & np.isfinite(yp)
    yt, yp = yt[ok], yp[ok]
    if yt.size < 3 or np.all(yt == yt[0]) or np.all(yp == yp[0]):
        return float("nan")
    rt, rp = _rankdata(yt), _rankdata(yp)
    rt -= rt.mean()
    rp -= rp.mean()
    denom = np.sqrt((rt**2).sum() * (rp**2).sum())
    if denom == 0:
        return float("nan")
    return float((rt * rp).sum() / denom)


def bootstrap_ci(y_true, y_pred, fn=qwk, n_boot=2000, seed=0, cats=None):
    yt = np.asarray(y_true, dtype=float)
    yp = np.asarray(y_pred, dtype=float)
    ok = np.isfinite(yt) & np.isfinite(yp)
    yt, yp = yt[ok], yp[ok]
    if yt.size < 5:
        return (float("nan"), float("nan"))
    rng = np.random.default_rng(seed)
    vals = []
    n = yt.size
    for _ in range(n_boot):
        idx = rng.integers(0, n, n)
        vals.append(fn(yt[idx], yp[idx], cats=cats) if cats is not None else fn(yt[idx], yp[idx]))
    vals = np.array([v for v in vals if np.isfinite(v)])
    if vals.size == 0:
        return (float("nan"), float("nan"))
    return (float(np.percentile(vals, 2.5)), float(np.percentile(vals, 97.5)))


def score_dimension(y_true, y_pred, label, cats=None, n_boot=2000):
    yt = np.asarray(y_true, dtype=float)
    yp = np.asarray(y_pred, dtype=float)
    ok = np.isfinite(yt) & np.isfinite(yp)
    yt_c, yp_c = yt[ok], yp[ok]
    n = int(yt_c.size)

    k = qwk(yt, yp, cats=cats)
    lo, hi = bootstrap_ci(yt, yp, n_boot=n_boot, cats=cats)
    diff = yp_c - yt_c
    result = {
        "dimension": label,
        "n": n,
        "qwk": k,
        "qwk_ci95": [lo, hi],
        "spearman": spearman(yt, yp),
        "mae": float(np.mean(np.abs(diff))) if n else float("nan"),
        "exact_agreement": float(np.mean(diff == 0)) if n else float("nan"),
        "adjacent_agreement": float(np.mean(np.abs(diff) <= 0.5)) if n else float("nan"),
        "mean_signed_error": float(np.mean(diff)) if n else float("nan"),
    }
    return result


# ── reporting ────────────────────────────────────────────────────────────────
def fmt(value, digits=3):
    if value is None or (isinstance(value, float) and not np.isfinite(value)):
        return "n/a"
    return f"{value:.{digits}f}"


def print_table(title, results):
    print(f"\n{title}")
    print(f"  {'dimension':<16}{'n':>5}{'QWK':>8}{'95% CI':>18}{'rho':>8}{'MAE':>7}{'exact':>8}{'±0.5':>8}{'bias':>8}")
    for r in results:
        lo, hi = r["qwk_ci95"]
        ci = f"[{fmt(lo, 2)}, {fmt(hi, 2)}]" if np.isfinite(lo) else "n/a"
        print(
            f"  {r['dimension']:<16}{r['n']:>5}{fmt(r['qwk']):>8}{ci:>18}"
            f"{fmt(r['spearman'], 2):>8}{fmt(r['mae'], 2):>7}"
            f"{fmt(r['exact_agreement'], 2):>8}{fmt(r['adjacent_agreement'], 2):>8}"
            f"{fmt(r['mean_signed_error'], 2):>8}"
        )


def print_slices(title, slices):
    print(f"\n{title}")
    for name, results in slices.items():
        qs = [r["qwk"] for r in results if np.isfinite(r["qwk"])]
        if not qs:
            continue
        worst, best = min(qs), max(qs)
        flag = "  <-- GAP" if (best - worst) > 0.10 else ""
        detail = ", ".join(f"{r['dimension']}={fmt(r['qwk'], 2)}" for r in results)
        print(f"  {name:<24} {detail}   gap={fmt(best - worst, 2)}{flag}")


# ── self test ────────────────────────────────────────────────────────────────
def selftest():
    cats = np.round(np.arange(0.0, 4.5, 0.5), 6)
    ok = True

    identical = np.array([0.0, 1.0, 2.5, 4.0])
    v = qwk(identical, identical, cats=cats)
    ok &= abs(v - 1.0) < 1e-9
    print(f"identity -> QWK {v:.4f} (expect 1.0)")

    constant = np.full(8, 2.0)
    v = qwk(np.array([0.0, 1.0, 2.0, 3.0, 4.0, 0.5, 1.5, 3.5]), constant, cats=cats)
    ok &= abs(v) < 1e-9
    print(f"constant rater -> QWK {v:.4f} (expect 0.0)")

    reversed_ = np.array([4.0, 3.0, 2.0, 1.0, 0.0])
    v = qwk(np.array([0.0, 1.0, 2.0, 3.0, 4.0]), reversed_, cats=cats)
    ok &= v < 0
    print(f"reversed -> QWK {v:.4f} (expect negative)")

    v = spearman(np.array([1.0, 2.0, 3.0, 4.0]), np.array([1.0, 2.0, 3.0, 4.0]))
    ok &= abs(v - 1.0) < 1e-9
    print(f"spearman identity -> {v:.4f} (expect 1.0)")

    print("\nSELFTEST", "PASSED" if ok else "FAILED")
    return 0 if ok else 1


# ── main ─────────────────────────────────────────────────────────────────────
def main(argv=None):
    p = argparse.ArgumentParser(description="Rubric agreement metrics (QWK + bootstrap CIs).")
    p.add_argument("--a", help="CSV for rater A / model scores")
    p.add_argument("--b", help="CSV for rater B / gold labels")
    p.add_argument("--mapping", help="mapping.json from export-gold-candidates (double-blind)")
    p.add_argument("--dims", default="", help="comma-separated rubric dimensions")
    p.add_argument("--join", default="sample_id", choices=["sample_id", "mapping"])
    p.add_argument("--slice-by", default="", help="column in file A to subgroup by")
    p.add_argument("--overall-column", default="overall")
    p.add_argument("--n-boot", type=int, default=2000)
    p.add_argument("--json", dest="json_out", help="write results as JSON to this path")
    p.add_argument("--selftest", action="store_true")
    args = p.parse_args(argv)

    if args.selftest:
        return selftest()
    if not (args.a and args.b):
        p.error("--a and --b are required")

    rows_a, rows_b = read_csv(args.a), read_csv(args.b)
    if args.mapping or args.join == "mapping":
        if not args.mapping:
            p.error("--mapping is required to join double-blind passes")
        m = load_mapping(args.mapping)
        rows_a, rows_b = pair_by_mapping(rows_a, rows_b, m)
    else:
        rows_a, rows_b = pair_by_sample_id(rows_a, rows_b)

    if not rows_a:
        raise SystemExit("No paired rows. Check the join.")

    dims = [d.strip() for d in args.dims.split(",") if d.strip()]
    if not dims:
        dims = [c for c in rows_a[0].keys() if c in ("task", "organization", "language", "delivery")]
    if not dims:
        raise SystemExit("No dimensions. Pass --dims task,organization,language")

    cats = _categories()
    results = []
    for d in dims:
        yt = np.array([to_float(r.get(d)) for r in rows_b])
        yp = np.array([to_float(r.get(d)) for r in rows_a])
        results.append(score_dimension(yt, yp, d, cats=cats, n_boot=args.n_boot))

    print(f"Paired samples: {len(rows_a)}   dimensions: {', '.join(dims)}")
    print_table("Agreement", results)

    if args.overall_column in (rows_a[0] or {}):
        yt = np.array([to_float(r.get(args.overall_column)) for r in rows_b])
        yp = np.array([to_float(r.get(args.overall_column)) for r in rows_a])
        if np.isfinite(yt).any() and np.isfinite(yp).any():
            print_table("Overall", [score_dimension(yt, yp, args.overall_column, cats=cats, n_boot=args.n_boot)])

    slices = {}
    if args.slice_by and args.slice_by in (rows_a[0] or {}):
        groups = {}
        for ra, rb in zip(rows_a, rows_b):
            groups.setdefault(str(ra.get(args.slice_by) or "unknown"), []).append((ra, rb))
        for name, pairs in sorted(groups.items()):
            if len(pairs) < 5:
                continue
            sub = []
            for d in dims:
                yt = np.array([to_float(rb.get(d)) for _, rb in pairs])
                yp = np.array([to_float(ra.get(d)) for ra, _ in pairs])
                sub.append(score_dimension(yt, yp, d, cats=cats, n_boot=min(args.n_boot, 500)))
            slices[name] = sub
        if slices:
            print_slices(f"Subgroups by {args.slice_by} (gap > 0.10 is a release blocker)", slices)

    mean_qwk = float(np.nanmean([r["qwk"] for r in results]))
    print(f"\nMean QWK across dimensions: {fmt(mean_qwk)}")
    print(f"Model target at {DEFAULT_TARGET_FRACTION:.0%} of this ceiling: {fmt(mean_qwk * DEFAULT_TARGET_FRACTION)}")
    print(f"Note: at n={len(rows_a)}, treat QWK differences under ~0.05 as noise.")

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as fh:
            json.dump(
                {
                    "n": len(rows_a),
                    "dimensions": results,
                    "subgroups": {k: v for k, v in slices.items()},
                    "mean_qwk": mean_qwk,
                    "model_target": mean_qwk * DEFAULT_TARGET_FRACTION,
                },
                fh,
                indent=2,
            )
        print(f"\nWrote {args.json_out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
