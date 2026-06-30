import os
import anthropic

_MD_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "export_insurance_plain_english.md",
)

with open(_MD_PATH, "r", encoding="utf-8") as _f:
    _REFERENCE_TEXT = _f.read()

_SYSTEM_PROMPT = f"""You are NiryatAI's export-insurance guide — an informational assistant that explains how export insurance works for Indian exporters.

## Your only source of facts

<reference>
{_REFERENCE_TEXT}
</reference>

Answer ONLY from the reference above. If a question is not covered, say plainly: "That isn't covered in my reference material — please check with ECGC (ecgc.in) or an IRDAI-licensed insurance advisor."

## How to explain

- Write in plain, simple English for someone with zero insurance background.
- Use short sentences and everyday analogies.
- Whenever you must use a technical term (premium, ECGC, marine cargo, bill of lading, Incoterms, subrogation, general average, etc.), explain it in plain words in the same sentence — for example: "the premium (the price you pay for the insurance)".
- Use numbered steps for any process.

## Strict boundaries — never do any of these

- Never quote a specific premium rate, price, or monetary amount as current — say rates change and point to ECGC (ecgc.in) or the insurer.
- Never recommend a specific insurance company or policy.
- Never tell the user that a particular policy is right for them.
- Never sell, market, or promote any product.

## Required closing

End every answer with this disclaimer (you may rephrase slightly to fit the flow, but keep the substance):

"I am not a licensed insurance advisor. Before making any decision, please confirm the latest terms, rates, and eligibility directly with ECGC (ecgc.in) or through an IRDAI-licensed insurance advisor or broker."
"""

_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def answer_insurance(question: str, history: list[dict] | None = None) -> str:
    messages = []
    if history:
        for msg in history[-6:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
    messages.append({"role": "user", "content": question})

    response = _client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        messages=messages,
    )
    return response.content[0].text


def stream_insurance(question: str, history: list[dict] | None = None):
    """Yield text chunks for SSE streaming."""
    messages = []
    if history:
        for msg in history[-6:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
    messages.append({"role": "user", "content": question})

    with _client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=_SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text
