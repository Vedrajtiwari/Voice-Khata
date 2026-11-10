import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from khata import parse_entry


def test_hindi_compound_hundred():
    sale = parse_entry("पांच किलो आटा दो सौ रुपये")
    assert sale is not None
    assert (sale["item"], sale["qty"], sale["amount"]) == ("wheat flour", 5, 200)


def test_hinglish_compound_hundred():
    sale = parse_entry("2 kilo chawal do sau rupay")
    assert sale is not None
    assert (sale["qty"], sale["amount"]) == (2, 200)


def test_compound_hundred_with_tens():
    sale = parse_entry("ek kilo cheeni do sau pachas rupay")
    assert sale is not None
    assert (sale["qty"], sale["amount"]) == (1, 250)


def test_compound_thousands():
    sale = parse_entry("teen kilo chawal ek hazar do sau rupay")
    assert sale is not None
    assert (sale["qty"], sale["amount"]) == (3, 1200)


def test_separate_numbers_stay_separate():
    sale = parse_entry("5 किलो आटा ₹200")
    assert sale is not None
    assert (sale["qty"], sale["amount"]) == (5, 200)
