"""
NiryatAI Credits System
JSON-file backed credit ledger — same pattern as registered_emails.json.
Razorpay verification is mocked (no live key configured yet): any payment_id
prefixed "mock_" is accepted so the frontend flow can be fully exercised.
"""

import os
import json
import datetime

_DIR = os.path.dirname(os.path.abspath(__file__))
CREDITS_FILE = os.path.join(_DIR, "credits.json")

WELCOME_CREDITS = 20
MAX_DEDUCT_PER_CALL = 50  # highest legitimate action cost (buyer unlock = 5); blocks abuse via inflated amounts

TIERS = {
    "50":  {"credits": 50,  "price_inr": 199},
    "200": {"credits": 200, "price_inr": 499},
    "500": {"credits": 500, "price_inr": 999},
}

PROMO_CODES = {
    "NIRYAT50": 50,
    "EXPORT100": 100,
}


def _load() -> dict:
    try:
        with open(CREDITS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _save(data: dict):
    with open(CREDITS_FILE, "w") as f:
        json.dump(data, f, indent=2)


def _ensure_account(data: dict, email: str) -> dict:
    key = email.lower()
    if key not in data:
        data[key] = {
            "balance": WELCOME_CREDITS,
            "redeemed_promos": [],
            "history": [{
                "type": "bonus",
                "amount": WELCOME_CREDITS,
                "reason": "Welcome bonus",
                "at": datetime.datetime.now().isoformat(),
            }],
        }
    return data[key]


def get_account(email: str) -> dict:
    data = _load()
    account = _ensure_account(data, email)
    _save(data)
    return account


def deduct(email: str, amount: int, reason: str) -> dict:
    # Defense in depth — the API layer also validates this, but deduct() must
    # never let a non-positive or oversized amount flip into a balance credit.
    if not isinstance(amount, int) or not (0 < amount <= MAX_DEDUCT_PER_CALL):
        return {"ok": False, "balance": None, "message": "Invalid deduction amount"}
    data = _load()
    account = _ensure_account(data, email)
    if account["balance"] < amount:
        return {"ok": False, "balance": account["balance"], "message": "Insufficient credits"}
    account["balance"] -= amount
    account["history"].append({
        "type": "deduct", "amount": -amount, "reason": reason,
        "at": datetime.datetime.now().isoformat(),
    })
    _save(data)
    return {"ok": True, "balance": account["balance"]}


def add(email: str, amount: int, reason: str) -> dict:
    data = _load()
    account = _ensure_account(data, email)
    account["balance"] += amount
    account["history"].append({
        "type": "credit", "amount": amount, "reason": reason,
        "at": datetime.datetime.now().isoformat(),
    })
    _save(data)
    return {"ok": True, "balance": account["balance"]}


def purchase(email: str, tier: str, payment_id: str) -> dict:
    if tier not in TIERS:
        return {"ok": False, "message": f"Unknown tier: {tier}"}
    # Mock Razorpay verification — real integration will verify payment_id/signature
    # against the Razorpay API once RAZORPAY_KEY is configured.
    if not payment_id or not payment_id.startswith("mock_"):
        return {"ok": False, "message": "Payment verification failed"}
    amount = TIERS[tier]["credits"]
    result = add(email, amount, f"Purchased {amount} credits (tier {tier})")
    return {"ok": True, "balance": result["balance"], "credits_added": amount}


def apply_promo(email: str, code: str) -> dict:
    code = code.strip().upper()
    if code not in PROMO_CODES:
        return {"ok": False, "message": "Invalid promo code"}
    data = _load()
    account = _ensure_account(data, email)
    if code in account["redeemed_promos"]:
        return {"ok": False, "message": "Promo code already redeemed"}
    amount = PROMO_CODES[code]
    account["balance"] += amount
    account["redeemed_promos"].append(code)
    account["history"].append({
        "type": "promo", "amount": amount, "reason": f"Promo code {code}",
        "at": datetime.datetime.now().isoformat(),
    })
    _save(data)
    return {"ok": True, "balance": account["balance"], "credits_added": amount}
