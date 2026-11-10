"""Parsing and CSV persistence for VoiceKhata.

The functions in this module deliberately have no Streamlit dependency. That
makes the ledger easy to test locally and keeps the app logic small.
"""

import csv
import re
from datetime import date, datetime
from pathlib import Path

ITEMS = {
    "chawal": "rice", "rice": "rice", "atta": "wheat flour", "doodh": "milk",
    "milk": "milk", "cheeni": "sugar", "sugar": "sugar", "namak": "salt",
    "tel": "oil", "oil": "oil", "dal": "lentils", "chai": "tea",
    "tea": "tea", "biscuit": "biscuit", "haldi": "turmeric", "sabun": "soap",
    "soap": "soap", "चावल": "rice", "आटा": "wheat flour",
    "दूध": "milk", "चीनी": "sugar", "नमक": "salt", "तेल": "oil", "दाल": "lentils",
    "चाय": "tea", "बिस्कुट": "biscuit", "हल्दी": "turmeric", "साबुन": "soap",
    "तांदूळ": "rice", "पीठ": "wheat flour", "साखर": "sugar",
    "मीठ": "salt", "डाळ": "lentils", "चहा": "tea", "बिस्कीट": "biscuit",
}

ITEM_LABELS = {
    "rice": "Rice / चावल / तांदूळ", "wheat flour": "Atta / आटा / पीठ", "milk": "Milk / दूध",
    "sugar": "Sugar / चीनी / साखर", "salt": "Salt / नमक / मीठ", "oil": "Oil / तेल",
    "lentils": "Dal / दाल / डाळ", "tea": "Tea / चाय / चहा", "biscuit": "Biscuit / बिस्कुट",
    "turmeric": "Haldi / हल्दी", "soap": "Soap / साबुन",
}

NUMBER_WORDS = {
    "ek": 1, "do": 2, "teen": 3, "char": 4, "chaar": 4, "paanch": 5, "panch": 5,
    "chhe": 6, "chhah": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10,
    "bees": 20, "tees": 30, "chalis": 40, "pachas": 50, "saath": 60,
    "sattar": 70, "assi": 80, "nabbe": 90, "sau": 100,
    "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "छह": 6,
    "सात": 7, "आठ": 8, "नौ": 9, "दस": 10, "पचास": 50,
    "दोन": 2, "पाच": 5, "सहा": 6, "नऊ": 9, "दहा": 10, "पन्नास": 50,
}

# Hindi digits to ASCII digits, so Devanagari transcripts also work
DEVANAGARI = str.maketrans("०१२३४५६७८९", "0123456789")

CSV_FIELDS = ["date", "time", "item", "qty", "amount"]


MULTIPLIERS = {
    "सौ": 100, "sau": 100, "hundred": 100,
    "हज़ार": 1000, "हजार": 1000, "hazaar": 1000, "hazar": 1000, "thousand": 1000,
}


def _numbers(text):
    """Extract numeric values from ASCII, Devanagari, or Hindi-word text.

    Real speech transcripts arrive with currency symbols and thousands
    separators ("₹50", "₹1,200"), and shopkeepers say "do sau" rather than
    "two hundred", so place words are composed instead of read as separate
    amounts.
    """
    nums = []
    text = text.translate(DEVANAGARI).replace("₹", " ").replace("$", " ").replace(",", "")
    total = 0        # magnitude accumulated in the current number ("ek hazar")
    group = None     # plain value waiting to be flushed ("do" before "sau")
    for tok in re.findall(r"\S+", text.lower(), flags=re.UNICODE):
        tok = tok.strip(".,!?;:()[]{}\"'")
        if tok in MULTIPLIERS:
            total += (group if group is not None else 1) * MULTIPLIERS[tok]
            group = None
            continue
        if tok.isdigit():
            value = int(tok)
        elif tok in NUMBER_WORDS:
            value = NUMBER_WORDS[tok]
        else:
            continue
        if group is None:
            group = value
        elif group >= 100 and value < 100:
            group += value            # "do sau pachas" -> 250
        elif total:
            total += group            # "ek hazar" + "do sau" -> 1200
            group = value
        else:
            nums.append(group)        # two plain numbers: qty, price
            group = value
    if group is not None:
        total += group
    if total:
        nums.append(total)
    return nums


def parse_entry(text, now=None):
    """Turn a transcript like '2 kilo chawal 50 rupay' into a sale dict.
    Returns None if the item or the two numbers are missing."""
    if not isinstance(text, str) or not text.strip():
        return None

    now = now or datetime.now()
    t = text.lower().translate(DEVANAGARI)
    item = next((en for phrase, en in ITEMS.items()
                 if re.search(rf"(?<![A-Za-z]){re.escape(phrase)}(?![A-Za-z])", t)), None)
    nums = _numbers(t)
    if item is None or len(nums) < 2:
        return None
    qty, amount = nums[0], nums[1]
    if qty <= 0 or amount <= 0:
        return None
    return {
        "date": now.date().isoformat(),
        "time": now.strftime("%H:%M:%S"),
        "item": item,
        "qty": qty,
        "amount": amount,
    }


def save_entry(entry, path="sales.csv"):
    """Append one validated entry to the CSV ledger."""
    if not entry:
        raise ValueError("Cannot save an empty ledger entry.")

    path = Path(path)
    is_new = not path.exists() or path.stat().st_size == 0
    with path.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        if is_new:
            writer.writeheader()
        writer.writerow(entry)


def load_entries(path="sales.csv"):
    path = Path(path)
    if not path.exists() or path.stat().st_size == 0:
        return []
    with path.open(encoding="utf-8", newline="") as f:
        return [row for row in csv.DictReader(f) if row.get("date")]


def today_entries(path="sales.csv", day=None):
    day = (day or date.today()).isoformat()
    return [r for r in load_entries(path) if r["date"] == day]


def today_total(path="sales.csv", day=None):
    return sum(int(float(r["amount"])) for r in today_entries(path, day))


def undo_last(path="sales.csv"):
    """Remove the most recent entry. Returns the removed row or None."""
    rows = load_entries(path)
    if not rows:
        return None
    removed = rows.pop()
    path = Path(path)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    return removed


def confirmation_text(entry, total):
    return (f"{entry['qty']} {entry['item']}, {entry['amount']} rupay, "
            f"save ho gaya. Aaj ka total {total} rupay.")
