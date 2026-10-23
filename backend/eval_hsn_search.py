"""
eval_hsn_search.py
──────────────────────────────────────────────
Real retrieval eval for trade_intel.search_hs_codes() — the function added
in PR #1 to stop the chat assistant from guessing HS/HSN codes.

WHY A RETRIEVAL EVAL, NOT A CLASSIFICATION ONE:
  search_hs_codes() returns a RANKED LIST of candidate HS headings for a
  free-text product description, not a single label — so the right metrics
  are retrieval metrics (is the correct code in the list, and how high up),
  not classification metrics (precision/recall/F1 per class).

METRICS REPORTED:
  - Top-1 accuracy   — is the correct HS code the very first result?
  - Top-3 accuracy   — is it in the first 3?
  - Top-6 accuracy   — is it in the full default result set (limit=6)?
  - MRR              — mean reciprocal rank (1/rank of the correct answer,
                        0 if absent) — rewards ranking it higher, not just
                        "present somewhere"
  - No-match rate    — how often the function returns nothing at all

GROUNDING:
  Every (query, expected_hs_code) pair in eval_set.json was built from a
  real entry in backend/products.json (ground truth hs_code verified
  against that file directly, not guessed), with the query written as
  natural phrasing a real exporter might type — not copy-pasted from the
  formal tariff-schedule text, since that would trivially match and
  wouldn't test anything. One deliberate no-match case (a nonsense
  product) checks the function doesn't force a match where none exists.

USAGE:
  python eval_hsn_search.py            # full report
  python eval_hsn_search.py --verbose  # + per-query detail
"""
import argparse
import json
import sys
from pathlib import Path

from trade_intel import search_hs_codes

EVAL_SET_PATH = Path(__file__).parent / "eval_hsn_set.json"


def run_eval(verbose: bool = False) -> None:
    with open(EVAL_SET_PATH, encoding="utf-8") as f:
        cases = json.load(f)["cases"]

    top1 = top3 = top6 = 0
    reciprocal_ranks = []
    no_match_correct = 0  # the deliberate no-match case(s) correctly returning nothing
    no_match_total = 0
    scored_cases = [c for c in cases if c["expected_hs_code"] is not None]
    rows = []

    for case in cases:
        query = case["query"]
        expected = case["expected_hs_code"]
        results = search_hs_codes(query)
        result_codes = [r["hs_code"] for r in results]

        if expected is None:
            no_match_total += 1
            ok = len(results) == 0
            no_match_correct += int(ok)
            rows.append((query, expected, result_codes, ok, None))
            continue

        rank = result_codes.index(expected) + 1 if expected in result_codes else None
        if rank == 1:
            top1 += 1
        if rank is not None and rank <= 3:
            top3 += 1
        if rank is not None and rank <= 6:
            top6 += 1
        reciprocal_ranks.append(1 / rank if rank else 0)
        rows.append((query, expected, result_codes, rank is not None, rank))

    n = len(scored_cases)
    mrr = sum(reciprocal_ranks) / n if n else 0

    print(f"\n{'=' * 64}")
    print(f"  search_hs_codes() retrieval eval — {len(cases)} cases "
          f"({n} scored, {no_match_total} no-match checks)")
    print(f"{'=' * 64}")
    print(f"Top-1 accuracy : {top1}/{n} = {top1 / n:.1%}")
    print(f"Top-3 accuracy : {top3}/{n} = {top3 / n:.1%}")
    print(f"Top-6 accuracy : {top6}/{n} = {top6 / n:.1%}  (full default result set)")
    print(f"MRR            : {mrr:.3f}")
    if no_match_total:
        print(f"No-match cases : {no_match_correct}/{no_match_total} correctly returned nothing")

    misses = [r for r in rows if r[1] is not None and not r[3]]
    if misses:
        print(f"\n{len(misses)} complete misses (correct code never appeared in results):")
        for query, expected, result_codes, _, _ in misses:
            print(f"  [{expected}] {query!r} -> got {result_codes}")

    if verbose:
        print(f"\nPer-query detail:")
        for query, expected, result_codes, ok, rank in rows:
            tag = f"rank={rank}" if rank else ("no-match (expected)" if expected is None else "MISS")
            print(f"  {'OK ' if ok else 'BAD'} [{expected}] {query!r} -> {result_codes}  ({tag})")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if not EVAL_SET_PATH.exists():
        sys.exit(f"Missing {EVAL_SET_PATH} — run this script from backend/.")
    run_eval(verbose=args.verbose)


if __name__ == "__main__":
    main()
