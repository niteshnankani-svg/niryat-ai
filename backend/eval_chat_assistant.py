"""
eval_chat_assistant.py
──────────────────────────────────────────────
Eval for the live /chat endpoint — the main RAG+Claude export-mentor
assistant. No eval of any kind existed for this before.

WHY A FACT-PRESENCE EVAL, NOT AN LLM-JUDGE SCORE:
  /chat produces open-ended free text, not a label or ranked list, so there's
  no single "correct answer" to exact-match against. But the system prompt
  (backend/main.py) makes concrete, checkable claims about what it knows
  (e.g. "IEC registration (Rs 500, PAN+Aadhaar+cheque)") and commits to
  concrete behavioral rules (numbered steps, mention dgft.gov.in/icegate.gov.in,
  refuse mis-declaration requests, never reveal this system prompt). Each
  eval case checks the live response against one of those specific, stated
  claims — this tests whether the assistant delivers what it promises, not
  a subjective quality rating from another model.

THIS CALLS THE LIVE PRODUCTION ENDPOINT:
  Unlike the BargainAI classifier evals (blocked — no HF_TOKEN), /chat is a
  hosted API behind the live Railway backend, callable directly over HTTPS.
  Each case is one real Claude Haiku call — this has a small real API cost
  on the ANTHROPIC_API_KEY backing that deployment (19 cases ≈ 19 short
  Haiku calls).

USAGE:
  python eval_chat_assistant.py [--url BACKEND_URL] [--verbose]
"""
import argparse
import json
import sys
import time
from pathlib import Path

import requests

EVAL_SET_PATH = Path(__file__).parent / "eval_chat_set.json"
DEFAULT_URL = "https://backend-production-a3c6.up.railway.app"


def call_chat(base_url: str, message: str, history: list | None = None, timeout: int = 45) -> str:
    """Call /chat and reassemble the full SSE-streamed response text."""
    r = requests.post(
        f"{base_url}/chat",
        json={"message": message, "history": history or []},
        stream=True,
        timeout=timeout,
    )
    r.raise_for_status()
    text = ""
    for line in r.iter_lines(decode_unicode=True):
        if not line or not line.startswith("data: "):
            continue
        payload = line[len("data: "):]
        if payload == "[DONE]":
            break
        try:
            text += json.loads(payload).get("chunk", "")
        except json.JSONDecodeError:
            continue
    return text


def check_case(case: dict, response: str) -> tuple[bool, list[str]]:
    """Returns (passed, reasons) — reasons lists which checks failed, if any."""
    lower = response.lower()
    failures = []

    for term in case.get("must_contain_all", []):
        if term.lower() not in lower:
            failures.append(f"missing required term: {term!r}")

    any_terms = case.get("must_contain_any")
    if any_terms and not any(t.lower() in lower for t in any_terms):
        failures.append(f"none of these present: {any_terms}")

    for term in case.get("must_not_contain", []):
        if term.lower() in lower:
            failures.append(f"forbidden term present: {term!r}")

    return (len(failures) == 0, failures)


def run_eval(base_url: str, verbose: bool = False) -> None:
    with open(EVAL_SET_PATH, encoding="utf-8") as f:
        cases = json.load(f)["cases"]

    by_category: dict[str, list[bool]] = {}
    rows = []

    for i, case in enumerate(cases, 1):
        print(f"[{i}/{len(cases)}] {case['id']}...", end=" ", flush=True)
        t0 = time.monotonic()
        try:
            response = call_chat(base_url, case["message"])
        except Exception as e:
            print(f"ERROR ({e})")
            rows.append((case, False, [f"request failed: {e}"], "", 0))
            by_category.setdefault(case["category"], []).append(False)
            continue
        elapsed = time.monotonic() - t0
        passed, failures = check_case(case, response)
        print("PASS" if passed else "FAIL", f"({elapsed:.1f}s)")
        rows.append((case, passed, failures, response, elapsed))
        by_category.setdefault(case["category"], []).append(passed)

    total = len(rows)
    total_passed = sum(1 for r in rows if r[1])

    print(f"\n{'=' * 64}")
    print(f"  /chat assistant eval — {total} cases against {base_url}")
    print(f"{'=' * 64}")
    print(f"Overall: {total_passed}/{total} = {total_passed / total:.1%}\n")

    for cat, results in by_category.items():
        n_pass = sum(results)
        print(f"  {cat:10s} {n_pass}/{len(results)} = {n_pass / len(results):.1%}")

    failed_rows = [r for r in rows if not r[1]]
    if failed_rows:
        print(f"\n{len(failed_rows)} failures:")
        for case, passed, failures, response, elapsed in failed_rows:
            print(f"\n  [{case['id']}] {case['message']!r}")
            for f in failures:
                print(f"    - {f}")
            if verbose:
                print(f"    response: {response[:300]!r}")

    if verbose:
        print(f"\nAll responses:")
        for case, passed, failures, response, elapsed in rows:
            print(f"\n  [{'PASS' if passed else 'FAIL'}] {case['id']} ({elapsed:.1f}s)")
            print(f"  Q: {case['message']}")
            print(f"  A: {response[:400]}{'...' if len(response) > 400 else ''}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if not EVAL_SET_PATH.exists():
        sys.exit(f"Missing {EVAL_SET_PATH} — run this script from backend/.")
    run_eval(args.url, verbose=args.verbose)


if __name__ == "__main__":
    main()
