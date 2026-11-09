import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from datetime import datetime
from khata import parse_entry, today_total, save_entry, undo_last, load_entries

NOW = datetime(2026, 11, 9, 18, 30)


def test_digits():
    e = parse_entry("2 kilo chawal 50 rupay", now=NOW)
    assert e["item"] == "rice" and e["qty"] == 2 and e["amount"] == 50


def test_hindi_number_words():
    e = parse_entry("do kilo chawal pachas rupay", now=NOW)
    assert e["qty"] == 2 and e["amount"] == 50


def test_devanagari_digits():
    e = parse_entry("२ kilo chawal ५० rupay", now=NOW)
    assert e["qty"] == 2 and e["amount"] == 50


def test_missing_item_returns_none():
    assert parse_entry("2 kilo 50 rupay", now=NOW) is None


def test_missing_numbers_returns_none():
    assert parse_entry("chawal lao", now=NOW) is None


def test_zero_rejected():
    assert parse_entry("0 kilo chawal 50 rupay", now=NOW) is None


def test_blank_input_returns_none():
    assert parse_entry("", now=NOW) is None
    assert parse_entry(None, now=NOW) is None


def test_item_alias_and_extra_words():
    e = parse_entry("please note 3 biscuit for 45 rupay", now=NOW)
    assert e["item"] == "biscuit" and e["qty"] == 3 and e["amount"] == 45


def test_new_item_can_be_added_to_dictionary():
    e = parse_entry("2 haldi 80", now=NOW)
    assert e["item"] == "turmeric"


def test_hindi_and_marathi_item_words():
    assert parse_entry("2 किलो चावल 50 रुपये", now=NOW)["item"] == "rice"
    assert parse_entry("दोन किलो तांदूळ पन्नास रुपये", now=NOW)["amount"] == 50


def test_currency_symbol_from_real_transcript():
    # Prisma returns transcripts like: "2 किलो चावल ₹50 सेव हो गया।"
    e = parse_entry("2 किलो चावल ₹50 सेव हो गया।", now=NOW)
    assert e is not None
    assert e["item"] == "rice" and e["qty"] == 2 and e["amount"] == 50


def test_rupee_symbol_and_thousands_separator():
    e = parse_entry("1 atta ₹1,200", now=NOW)
    assert e["qty"] == 1 and e["amount"] == 1200


def test_undo_empty_ledger_returns_none(tmp_path):
    assert undo_last(str(tmp_path / "missing.csv")) is None


def test_total_and_undo(tmp_path):
    p = str(tmp_path / "s.csv")
    save_entry(parse_entry("1 doodh 30", now=NOW), p)
    save_entry(parse_entry("2 atta 80", now=NOW), p)
    assert today_total(p, day=NOW.date()) == 110
    removed = undo_last(p)
    assert removed["item"] == "wheat flour"
    assert today_total(p, day=NOW.date()) == 30
    assert len(load_entries(p)) == 1
