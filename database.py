"""SQLite persistence for VoiceKhata.

The database is local by default so the project works without any account or
network setup. Set VOICEKHATA_DB_PATH to use a different SQLite file.
"""

import os
import sqlite3
from datetime import date, datetime, timedelta
from pathlib import Path


DEFAULT_DB_PATH = Path(
    os.environ.get("VOICEKHATA_DB_PATH", Path(__file__).with_name("voicekhata.db"))
)


def _connection(db_path=DEFAULT_DB_PATH):
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


def init_db(db_path=DEFAULT_DB_PATH):
    """Create the application tables and indexes if they do not exist."""
    with _connection(db_path) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                sale_date TEXT NOT NULL,
                item TEXT NOT NULL,
                qty INTEGER NOT NULL CHECK (qty > 0),
                amount INTEGER NOT NULL CHECK (amount > 0),
                source TEXT NOT NULL CHECK (source IN ('voice', 'typed')),
                language TEXT NOT NULL,
                raw_text TEXT NOT NULL,
                customer_name TEXT
            );
            CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date, id DESC);
            CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_name);

            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE COLLATE NOCASE,
                phone TEXT,
                note TEXT,
                created_at TEXT NOT NULL
            );
            """
        )


def _row_dict(row):
    return dict(row) if row else None


def add_sale(entry, source, language, raw_text, customer_name=None, db_path=DEFAULT_DB_PATH):
    """Save one parsed sale and return its stored record."""
    if not entry:
        raise ValueError("Cannot save an empty sale.")
    if source not in {"voice", "typed"}:
        raise ValueError("Sale source must be 'voice' or 'typed'.")

    now = datetime.now().isoformat(timespec="seconds")
    customer_name = (customer_name or "").strip() or None
    with _connection(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO sales
                (created_at, sale_date, item, qty, amount, source, language, raw_text, customer_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                now,
                entry["date"],
                entry["item"],
                int(entry["qty"]),
                int(entry["amount"]),
                source,
                language,
                raw_text.strip(),
                customer_name,
            ),
        )
        return _row_dict(connection.execute("SELECT * FROM sales WHERE id = ?", (cursor.lastrowid,)).fetchone())


def list_sales(day=None, limit=250, db_path=DEFAULT_DB_PATH):
    """Return newest sales first, optionally limited to one calendar day."""
    query = "SELECT * FROM sales"
    params = []
    if day:
        query += " WHERE sale_date = ?"
        params.append((day.isoformat() if isinstance(day, date) else str(day)))
    query += " ORDER BY id DESC LIMIT ?"
    params.append(int(limit))
    with _connection(db_path) as connection:
        return [_row_dict(row) for row in connection.execute(query, params).fetchall()]


def get_sale(sale_id, db_path=DEFAULT_DB_PATH):
    with _connection(db_path) as connection:
        return _row_dict(connection.execute("SELECT * FROM sales WHERE id = ?", (sale_id,)).fetchone())


def delete_last_sale(day=None, db_path=DEFAULT_DB_PATH):
    """Delete and return the newest sale, optionally only for a selected day."""
    query = "SELECT * FROM sales"
    params = []
    if day:
        query += " WHERE sale_date = ?"
        params.append(day.isoformat() if isinstance(day, date) else str(day))
    query += " ORDER BY id DESC LIMIT 1"
    with _connection(db_path) as connection:
        row = connection.execute(query, params).fetchone()
        if row is None:
            return None
        connection.execute("DELETE FROM sales WHERE id = ?", (row["id"],))
        return _row_dict(row)


def daily_summary(day=None, db_path=DEFAULT_DB_PATH):
    selected_day = day.isoformat() if isinstance(day, date) else (day or date.today().isoformat())
    with _connection(db_path) as connection:
        row = connection.execute(
            """
            SELECT COUNT(*) AS entries, COALESCE(SUM(amount), 0) AS total,
                   COUNT(DISTINCT item) AS item_types
            FROM sales WHERE sale_date = ?
            """,
            (selected_day,),
        ).fetchone()
        return _row_dict(row)


def date_summaries(days=7, db_path=DEFAULT_DB_PATH):
    """Return a continuous recent-day series for the insights screen."""
    today = date.today()
    start = today - timedelta(days=days - 1)
    with _connection(db_path) as connection:
        rows = connection.execute(
            """
            SELECT sale_date, COUNT(*) AS entries, COALESCE(SUM(amount), 0) AS total
            FROM sales WHERE sale_date BETWEEN ? AND ?
            GROUP BY sale_date ORDER BY sale_date
            """,
            (start.isoformat(), today.isoformat()),
        ).fetchall()
    by_day = {row["sale_date"]: _row_dict(row) for row in rows}
    return [by_day.get((start + timedelta(days=index)).isoformat(), {
        "sale_date": (start + timedelta(days=index)).isoformat(), "entries": 0, "total": 0
    }) for index in range(days)]


def top_items(day=None, limit=5, db_path=DEFAULT_DB_PATH):
    selected_day = day.isoformat() if isinstance(day, date) else (day or date.today().isoformat())
    with _connection(db_path) as connection:
        rows = connection.execute(
            """
            SELECT item, COUNT(*) AS entries, SUM(qty) AS quantity, SUM(amount) AS total
            FROM sales WHERE sale_date = ?
            GROUP BY item ORDER BY total DESC, item ASC LIMIT ?
            """,
            (selected_day, int(limit)),
        ).fetchall()
        return [_row_dict(row) for row in rows]


def add_customer(name, phone="", note="", db_path=DEFAULT_DB_PATH):
    name = name.strip()
    if not name:
        raise ValueError("Customer name is required.")
    with _connection(db_path) as connection:
        cursor = connection.execute(
            "INSERT INTO customers (name, phone, note, created_at) VALUES (?, ?, ?, ?)",
            (name, phone.strip() or None, note.strip() or None, datetime.now().isoformat(timespec="seconds")),
        )
        return _row_dict(connection.execute("SELECT * FROM customers WHERE id = ?", (cursor.lastrowid,)).fetchone())


def list_customers(db_path=DEFAULT_DB_PATH):
    with _connection(db_path) as connection:
        rows = connection.execute(
            """
            SELECT c.*, COUNT(s.id) AS sales_count, COALESCE(SUM(s.amount), 0) AS sales_total
            FROM customers c LEFT JOIN sales s ON s.customer_name = c.name
            GROUP BY c.id ORDER BY c.name COLLATE NOCASE
            """
        ).fetchall()
        return [_row_dict(row) for row in rows]


def export_sales(day=None, db_path=DEFAULT_DB_PATH):
    return list_sales(day=day, limit=100000, db_path=db_path)
