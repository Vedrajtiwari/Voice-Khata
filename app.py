"""VoiceKhata — Stitch-inspired counter UI backed by SQLite."""

import csv
import hashlib
from datetime import date
from io import StringIO
from pathlib import Path

import streamlit as st

from database import (
    DEFAULT_DB_PATH, add_customer, add_sale, daily_summary, date_summaries,
    delete_last_sale, export_sales, init_db, list_customers, list_sales, top_items,
)
from gnani_client import has_api_key, speak, transcribe
from khata import ITEM_LABELS, parse_entry
from ui_text import LANGUAGES, t


st.set_page_config(
    page_title="VoiceKhata | Voice sales ledger",
    page_icon="🧾",
    layout="wide",
    initial_sidebar_state="collapsed",
)
init_db()

LOGO_PATH = Path(__file__).parent / "assets" / "voicekhata-logo.svg"


def state_defaults():
    for key, value in {
        "language": "hi", "dark_theme": False, "voice_reply": False,
        "show_tips": True, "last_audio": None, "page": "home",
    }.items():
        st.session_state.setdefault(key, value)


state_defaults()


def copy(key, language=None):
    return t(key, language or st.session_state.language)


def language_label(code):
    item = LANGUAGES[code]
    return f"{item['label']} · {item['name']}"


def source_label(source):
    return "🎙️ Voice" if source == "voice" else "⌨️ Keyboard"


def apply_stitch_theme():
    dark = st.session_state.dark_theme
    colors = (
        {"bg": "#101923", "surface": "#172330", "text": "#EFF7FF", "muted": "#A7B6C6", "line": "#2F4356", "soft": "#173E35"}
        if dark else
        {"bg": "#F7F8FC", "surface": "#FFFFFF", "text": "#183B56", "muted": "#5C7087", "line": "#E2E8F0", "soft": "#E7F6F1"}
    )
    st.markdown(
        f"""
        <style>
        :root {{ --vk-bg:{colors['bg']}; --vk-surface:{colors['surface']}; --vk-text:{colors['text']}; --vk-muted:{colors['muted']}; --vk-line:{colors['line']}; --vk-soft:{colors['soft']}; --vk-green:#16735B; --vk-navy:#183B56; --vk-amber:#D97706; --vk-coral:#C94B5C; }}
        .stApp, [data-testid="stAppViewContainer"] {{ background:var(--vk-bg); color:var(--vk-text); }}
        [data-testid="stHeader"], [data-testid="stToolbar"] {{ background:transparent; }}
        [data-testid="stSidebar"] {{ display:none; }}
        .block-container {{ max-width: 1410px; padding-top: .8rem; padding-bottom: 3.5rem; }}
        .vk-nav {{ background:var(--vk-surface); border:1px solid var(--vk-line); border-radius:16px; padding:.5rem 1rem; box-shadow:0 3px 12px rgba(24,59,86,.05); }}
        .vk-shop {{ background:var(--vk-surface); border:1px solid var(--vk-line); border-radius:14px; padding:.8rem 1rem; margin:.75rem 0 1.25rem; box-shadow:0 2px 8px rgba(24,59,86,.04); }}
        .vk-card {{ background:var(--vk-surface); border:1px solid var(--vk-line); border-radius:18px; padding:1.35rem; box-shadow:0 4px 14px rgba(24,59,86,.05); }}
        .vk-side-card {{ background:var(--vk-surface); border:1px solid var(--vk-line); border-radius:16px; padding:1rem; margin-bottom:1rem; box-shadow:0 3px 10px rgba(24,59,86,.045); }}
        .vk-title {{ color:var(--vk-text); font-weight:800; font-size:1.9rem; letter-spacing:-.04em; margin:0; }}
        .vk-subtitle, .vk-muted {{ color:var(--vk-muted); }}
        .vk-kicker {{ color:var(--vk-muted); font-size:.87rem; margin:.22rem 0 0; }}
        .vk-heading {{ color:var(--vk-navy); font-size:1.15rem; font-weight:800; margin:0; }}
        .vk-pill {{ display:inline-block; background:var(--vk-soft); color:#16735B; border:1px solid #BFE8D9; border-radius:999px; padding:.22rem .62rem; font-size:.72rem; font-weight:800; margin-left:.45rem; vertical-align:middle; }}
        .vk-status {{ display:inline-flex; align-items:center; gap:.4rem; color:#12624E; background:var(--vk-soft); border:1px solid #B9E9D8; border-radius:999px; padding:.3rem .6rem; font-size:.77rem; font-weight:800; }}
        .vk-mic {{ margin:1rem auto; max-width:520px; text-align:center; background:linear-gradient(180deg,var(--vk-soft),var(--vk-surface)); border:1px solid var(--vk-line); border-radius:18px; padding:1.15rem; }}
        .vk-mic-icon {{ width:78px; height:78px; display:flex; align-items:center; justify-content:center; border-radius:50%; margin:0 auto .65rem; background:#16735B; color:#fff; font-size:2rem; border:6px solid #fff; box-shadow:0 0 0 15px rgba(22,115,91,.12), 0 10px 25px rgba(22,115,91,.24); }}
        .vk-catalog {{ display:inline-block; margin:.18rem; padding:.38rem .56rem; border-radius:9px; color:var(--vk-text); background:var(--vk-soft); border:1px solid var(--vk-line); font-size:.82rem; font-weight:650; }}
        .vk-tip {{ border-left:4px solid var(--vk-amber); padding:.65rem .75rem; margin:.55rem 0; background:#FFF8E7; color:#794B02; border-radius:0 10px 10px 0; font-size:.86rem; }}
        div[data-testid="stMetric"] {{ background:var(--vk-surface); border:1px solid var(--vk-line); border-radius:14px; padding:.85rem 1rem; box-shadow:0 3px 10px rgba(24,59,86,.04); }}
        div[data-testid="stMetric"] label, div[data-testid="stMetric"] [data-testid="stMetricValue"] {{ color:var(--vk-text) !important; font-variant-numeric:tabular-nums; }}
        div[data-testid="stTabs"] button {{ min-height:44px; color:var(--vk-muted); font-weight:750; }}
        div[data-testid="stTabs"] button[aria-selected="true"] {{ color:#16735B; }}
        .stButton>button, .stDownloadButton>button {{ min-height:46px; border-radius:11px; font-weight:750; }}
        .stTextInput input, .stTextArea textarea {{ border-radius:11px; min-height:44px; }}
        @media(max-width:720px) {{
          .block-container {{ padding-left:.75rem; padding-right:.75rem; padding-top:.35rem; }}
          .vk-title {{ font-size:1.5rem; }}
          .vk-card {{ padding:1rem; border-radius:15px; }}
          .vk-nav {{ padding:.45rem .65rem; }}
          .vk-mic {{ padding:.9rem; }}
          .vk-mic-icon {{ width:66px; height:66px; font-size:1.7rem; }}
          [data-testid="stHorizontalBlock"] {{ gap:.65rem; }}
        }}
        </style>
        """,
        unsafe_allow_html=True,
    )


apply_stitch_theme()


def csv_download(rows):
    buffer = StringIO()
    fields = ("id", "created_at", "sale_date", "item", "qty", "amount", "source", "language", "raw_text", "customer_name")
    writer = csv.DictWriter(buffer, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def save_sale(raw_text, source, customer_name=""):
    language = st.session_state.language
    parsed = parse_entry(raw_text)
    if not parsed:
        st.warning(copy("invalid", language))
        return False
    add_sale(parsed, source, language, raw_text, customer_name)
    total = daily_summary(parsed["date"])["total"]
    st.success(f"✓ {copy('saved')} · {parsed['qty']} {parsed['item']} · ₹{parsed['amount']:,} · {copy('total_sales')} ₹{total:,}")
    if st.session_state.voice_reply:
        audio = speak(
            f"{parsed['qty']} {parsed['item']}, {parsed['amount']} rupay, save ho gaya.",
            language_code=LANGUAGES[language]["gnani"],
        )
        if audio:
            st.audio(audio, format="audio/wav")
        else:
            st.caption("Voice confirmation unavailable; the sale is still saved.")
    return True


def header():
    left, center, right = st.columns([.17, .63, .20], vertical_alignment="center")
    with left:
        with st.popover("☰  Menu", use_container_width=True):
            st.selectbox("Language / भाषा", list(LANGUAGES), format_func=language_label, key="language")
            st.toggle(copy("dark_theme"), key="dark_theme")
            st.toggle(copy("voice_reply"), key="voice_reply")
            st.toggle(copy("quick_tips"), key="show_tips")
            st.divider()
            st.radio(
                "Navigation", ["home", "ledger", "insights", "customers", "settings"],
                key="page", format_func=lambda item: {
                    "home": "🏠 Counter", "ledger": "🧾 Daily ledger", "insights": "📈 Reports",
                    "customers": "👥 Customers", "settings": "⚙️ Settings",
                }[item],
            )
    with center:
        icon, words = st.columns([.11, .89], vertical_alignment="center")
        if LOGO_PATH.exists():
            icon.image(str(LOGO_PATH), width=42)
        else:
            icon.markdown('<span style="font-size:28px">🧾</span>', unsafe_allow_html=True)
        words.markdown('<p class="vk-title">VoiceKhata <span class="vk-pill">खाता, अब आवाज़ से</span></p>', unsafe_allow_html=True)
    with right:
        text = "● Gnani configured" if has_api_key() else "○ Typed mode ready"
        st.markdown(f'<div style="text-align:right"><span class="vk-status">{text}</span></div>', unsafe_allow_html=True)

    st.markdown(
        '<div class="vk-shop"><b style="color:#183B56">🏪 VoiceKhata Counter</b> '
        '<span class="vk-pill">Main Counter</span><br><span class="vk-kicker">Fast voice and keyboard sales entry · SQLite ledger active</span></div>',
        unsafe_allow_html=True,
    )


def catalog_card():
    st.markdown('<div class="vk-side-card"><p class="vk-heading">📦 Kirana Catalog</p><p class="vk-kicker">Tap or say a familiar item name.</p>', unsafe_allow_html=True)
    st.markdown("".join(f'<span class="vk-catalog">{name}</span>' for name in ITEM_LABELS.values()), unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)


def settings_card():
    language = st.session_state.language
    st.markdown('<div class="vk-side-card"><p class="vk-heading">⚙️ Counter & Voice Settings</p><p class="vk-kicker">Your preferences are saved for this session.</p></div>', unsafe_allow_html=True)
    voice_status = "ON" if st.session_state.voice_reply else "OFF"
    tips_status = "ON" if st.session_state.show_tips else "OFF"
    st.markdown(f"<div class='vk-side-card'><b>{copy('voice_reply', language)}</b><br><span class='vk-kicker'>Gnani Timbre TTS · {voice_status}</span><hr style='border:none;border-top:1px solid var(--vk-line);margin:.8rem 0'><b>{copy('quick_tips', language)}</b><br><span class='vk-kicker'>{tips_status} · change from Menu</span></div>", unsafe_allow_html=True)
    st.caption("🔒 Every sale is saved to the local SQLite ledger.")


def sale_table(rows):
    if not rows:
        st.info(copy("empty"), icon="🧾")
        return
    st.dataframe(
        [{
            "Time": sale["created_at"].replace("T", " ")[-8:],
            "Item details": ITEM_LABELS.get(sale["item"], sale["item"]),
            "Qty": sale["qty"], "Verification": source_label(sale["source"]),
            "Amount (₹)": sale["amount"],
        } for sale in rows],
        hide_index=True,
        width="stretch",
    )
    st.markdown("#### Entry details")
    for sale in rows[:8]:
        with st.expander(f"{sale['created_at'].replace('T', ' ')[-8:]} · {sale['item']} · ₹{sale['amount']:,}"):
            st.write(f"**Spoken/typed text:** {sale['raw_text']}")
            st.write(f"**Source:** {source_label(sale['source'])} · **Language:** {language_label(sale['language'])}")
            if sale.get("customer_name"):
                st.write(f"**Customer:** {sale['customer_name']}")


def home():
    language = st.session_state.language
    main, side = st.columns([1.9, .92], gap="large")
    with main:
        st.markdown('<div class="vk-card">', unsafe_allow_html=True)
        st.markdown(f'<p class="vk-heading">Fast Counter Entry <span class="vk-pill">{language_label(language)}</span></p><p class="vk-kicker">{copy("tagline", language)}</p>', unsafe_allow_html=True)
        voice_tab, type_tab = st.tabs([f"🎙️ {copy('voice', language)}", f"⌨️ {copy('type', language)}"])
        with voice_tab:
            st.markdown('<div class="vk-mic"><div class="vk-mic-icon">🎙</div><b>Tap to speak · Mic dabayein aur bolein</b><br><span class="vk-kicker">“2 kilo chawal 50 rupay”</span></div>', unsafe_allow_html=True)
            recording = st.audio_input("Record sale", key="voice_sale", label_visibility="collapsed")
            if recording is not None:
                digest = hashlib.sha256(recording.getvalue()).hexdigest()
                if st.session_state.last_audio != digest:
                    st.session_state.last_audio = digest
                    try:
                        with st.spinner("Listening…"):
                            transcript = transcribe(recording.getvalue(), LANGUAGES[language]["gnani"])
                        if transcript:
                            st.caption(f"Transcript: {transcript}")
                            save_sale(transcript, "voice")
                        else:
                            st.warning(copy("invalid", language))
                    except Exception:
                        st.error(copy("voice_unavailable", language))
        with type_tab:
            with st.form("sale_form", clear_on_submit=True):
                raw_text = st.text_input(copy("sale_details", language), placeholder="2 kilo chawal 50 rupay")
                customer = st.text_input(copy("customer", language), placeholder="Optional")
                submitted = st.form_submit_button(copy("save", language), type="primary", width="stretch")
            if submitted:
                if raw_text.strip():
                    save_sale(raw_text.strip(), "typed", customer)
                else:
                    st.warning(copy("no_input", language))
        st.markdown('</div>', unsafe_allow_html=True)

        st.markdown('<div style="height:1rem"></div>', unsafe_allow_html=True)
        st.markdown('<div class="vk-card">', unsafe_allow_html=True)
        st.markdown(f'<p class="vk-heading">{copy("ledger", language)} <span class="vk-pill">{copy("today", language)}</span></p><p class="vk-kicker">Live counter sales recorded safely in your local database.</p>', unsafe_allow_html=True)
        summary = daily_summary()
        a, b, c = st.columns(3)
        a.metric("Today cash", f"₹{summary['total']:,}")
        b.metric(copy("entries", language), summary["entries"])
        c.metric(copy("total_sales", language), f"₹{summary['total']:,}")
        rows = list_sales(day=date.today())
        st.markdown("#### All entries")
        sale_table(rows)
        undo, download = st.columns(2)
        with undo:
            if st.button(f"↩️ {copy('undo', language)}", disabled=not rows, width="stretch"):
                delete_last_sale(day=date.today())
                st.rerun()
        with download:
            st.download_button(
                f"⇩ {copy('download', language)}", csv_download(rows),
                file_name=f"voicekhata-{date.today().isoformat()}.csv", mime="text/csv",
                disabled=not rows, width="stretch",
            )
        st.markdown('</div>', unsafe_allow_html=True)
    with side:
        settings_card()
        catalog_card()
        if st.session_state.show_tips:
            st.markdown('<div class="vk-side-card"><p class="vk-heading">💡 Counter Speech Tips</p><p class="vk-kicker">Fast entries, fewer mistakes.</p><div class="vk-tip">Always say the amount: “Chawal 50 rupay”.</div><div class="vk-tip">Hindi, English, Marathi words and Devanagari digits work.</div><div class="vk-tip">If voice fails, use the Keyboard tab — the database still works.</div></div>', unsafe_allow_html=True)


def ledger_page():
    language = st.session_state.language
    st.markdown(f'<div class="vk-card"><p class="vk-heading">{copy("ledger", language)}</p><p class="vk-kicker">Review any day, including every saved transaction detail.</p>', unsafe_allow_html=True)
    selected = st.date_input("Date", value=date.today(), max_value=date.today())
    summary = daily_summary(selected)
    a, b, c = st.columns(3)
    a.metric(copy("entries", language), summary["entries"])
    b.metric(copy("total_sales", language), f"₹{summary['total']:,}")
    c.metric("Unique items", summary["item_types"])
    rows = list_sales(selected)
    sale_table(rows)
    st.markdown('</div>', unsafe_allow_html=True)


def insights_page():
    language = st.session_state.language
    summaries = date_summaries()
    week_total = sum(item["total"] for item in summaries)
    week_entries = sum(item["entries"] for item in summaries)
    st.markdown(f'<div class="vk-card"><p class="vk-heading">{copy("insights", language)}</p><p class="vk-kicker">{copy("weekly", language)}</p>', unsafe_allow_html=True)
    a, b = st.columns(2)
    a.metric("7-day sales", f"₹{week_total:,}")
    b.metric("7-day entries", week_entries)
    st.dataframe([{"Date": x["sale_date"], "Entries": x["entries"], "Sales (₹)": x["total"]} for x in summaries], hide_index=True, width="stretch")
    st.markdown(f"#### {copy('top_items', language)}")
    items = top_items()
    if items:
        st.dataframe([{"Item": ITEM_LABELS.get(x["item"], x["item"]), "Qty": x["quantity"], "Sales (₹)": x["total"]} for x in items], hide_index=True, width="stretch")
    else:
        st.info(copy("empty", language), icon="📈")
    st.markdown('</div>', unsafe_allow_html=True)


def customers_page():
    language = st.session_state.language
    st.markdown(f'<div class="vk-card"><p class="vk-heading">{copy("customers", language)}</p><p class="vk-kicker">Add useful customer contact notes beside their purchase history.</p>', unsafe_allow_html=True)
    with st.form("customer_form", clear_on_submit=True):
        name = st.text_input(copy("customer_name", language))
        phone = st.text_input(copy("phone", language))
        note = st.text_area(copy("note", language), height=80)
        create = st.form_submit_button(copy("create", language), type="primary")
    if create:
        try:
            add_customer(name, phone, note)
            st.success(f"{name.strip()} added")
        except ValueError as exc:
            st.warning(str(exc))
        except Exception:
            st.warning("This customer already exists.")
    for customer in list_customers():
        with st.expander(f"👤 {customer['name']} · ₹{customer['sales_total']:,}"):
            st.write(f"**Phone:** {customer['phone'] or '—'}")
            st.write(f"**Recorded sales:** {customer['sales_count']}")
            if customer["note"]:
                st.write(customer["note"])
    st.markdown('</div>', unsafe_allow_html=True)


def settings_page():
    language = st.session_state.language
    st.markdown('<div class="vk-card"><p class="vk-heading">Settings & local storage</p><p class="vk-kicker">A deployment-safe baseline with private local storage.</p>', unsafe_allow_html=True)
    st.success("SQLite database ready")
    st.caption(f"Database file: {DEFAULT_DB_PATH.name} — excluded from GitHub.")
    all_rows = export_sales()
    st.download_button("⇩ Download full CSV backup", csv_download(all_rows), "voicekhata-backup.csv", "text/csv", disabled=not all_rows)
    st.divider()
    st.write("**Voice status:** " + ("Gnani key configured" if has_api_key() else "Typed mode works; add GNANI_API_KEY for voice."))
    st.write("**Languages:** Hindi, English, Marathi, Hinglish, and Devanagari numerals.")
    st.caption("Streamlit Cloud local files can reset. For durable cloud data, replace SQLite with a managed database before a production rollout.")
    st.markdown('</div>', unsafe_allow_html=True)


header()
page = st.session_state.page
if page == "home":
    home()
elif page == "ledger":
    ledger_page()
elif page == "insights":
    insights_page()
elif page == "customers":
    customers_page()
else:
    settings_page()
