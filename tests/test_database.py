import os
import sys
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from database import add_customer, add_sale, daily_summary, delete_last_sale, init_db, list_customers, list_sales, top_items
from khata import parse_entry


NOW = datetime(2026, 11, 9, 18, 30)


def test_sales_are_stored_summarized_and_undone(tmp_path):
    path = tmp_path / "voicekhata.db"
    init_db(path)
    first = add_sale(parse_entry("2 kilo chawal 50 rupay", now=NOW), "typed", "hi", "2 kilo chawal 50 rupay", db_path=path)
    second = add_sale(parse_entry("1 doodh 30", now=NOW), "voice", "hi", "1 doodh 30", db_path=path)

    assert first["id"] < second["id"]
    assert daily_summary(NOW.date(), path) == {"entries": 2, "total": 80, "item_types": 2}
    assert [row["item"] for row in list_sales(NOW.date(), db_path=path)] == ["milk", "rice"]
    assert top_items(NOW.date(), db_path=path)[0]["item"] == "rice"

    removed = delete_last_sale(NOW.date(), path)
    assert removed["item"] == "milk"
    assert daily_summary(NOW.date(), path)["total"] == 50


def test_customer_list_includes_linked_sales_total(tmp_path):
    path = tmp_path / "voicekhata.db"
    init_db(path)
    add_customer("Ramesh", "9999999999", "Regular", path)
    add_sale(parse_entry("1 atta 80", now=NOW), "typed", "en", "1 atta 80", "Ramesh", path)

    customer = list_customers(path)[0]
    assert customer["name"] == "Ramesh"
    assert customer["sales_count"] == 1
    assert customer["sales_total"] == 80
