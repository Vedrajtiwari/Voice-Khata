"""Streamlit interface for VoiceKhata."""

import csv
import hashlib
from io import StringIO

import streamlit as st

from gnani_client import has_api_key, speak, transcribe
from khata import confirmation_text, parse_entry, save_entry, today_entries, today_total, undo_last


st.set_page_config(
    page_title="VoiceKhata | Voice sales ledger",
    page_icon="🧾",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.markdown(
    """
    <style>
    .stApp { background: #f7f8fc; }
    [data-testid="stHeader"] { background: rgba(0,0,0,0); }
    .brand { color: #183b56; font-size: 2.4rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 0; }
    .tagline { color: #5d7285; font-size: 1.05rem; margin-top: -0.35rem; }
    .pill { display: inline-block; border-radius: 999px; padding: .28rem .7rem; background: #e6f4ef; color: #16735b; font-size: .82rem; font-weight: 700; }
    div[data-testid="stMetric"] { background: white; border: 1px solid #e4e9f0; padding: 1rem; border-radius: 14px; box-shadow: 0 3px 12px rgba(24,59,86,.05); }
    div[data-testid="stTabs"] button { font-weight: 700; }
    .hint { color: #607485; font-size: .9rem; }
    </style>
    """,
    unsafe_allow_html=True,
)

if "last_audio" not in st.session_state:
    st.session_state.last_audio = None


def handle_text(text, voice_reply=True):
    """Parse and save text, then render a user-facing result."""
    st.write(f"Suna: **{text}**")
    entry = parse_entry(text)
    if not entry:
        st.warning("Samajh nahi aaya. Item, quantity aur price saaf bolo.")
        st.caption("Example: 2 kilo chawal 50 rupay")
        return False

    try:
        save_entry(entry)
        msg = confirmation_text(entry, today_total())
    except (OSError, ValueError) as exc:
        st.error(f"Entry save nahi hui: {exc}")
        return False

    st.success(msg)
    if voice_reply:
        audio_reply = speak(msg)
        if audio_reply:
            st.audio(audio_reply, format="audio/wav")
        else:
            st.caption("Voice reply unavailable, text confirmation shown.")
    return True


with st.sidebar:
    st.markdown("### ⚙️ Settings")
    voice_reply = st.toggle(
        "Voice confirmation",
        value=True,
        help="Play a spoken confirmation after a successful save.",
    )
    show_tips = st.toggle("Show quick tips", value=True)
    st.divider()
    if has_api_key():
        st.success("Gnani API connected", icon="✅")
    else:
        st.warning("Gnani API key not set", icon="⚠️")
        st.caption("Typed entries still work. Add GNANI_API_KEY for Bolo and voice replies.")
    with st.expander("Supported items"):
        st.caption("chawal · atta · doodh · cheeni · namak · tel · dal · chai · biscuit · haldi · sabun")


st.markdown('<p class="brand">VoiceKhata <span class="pill">खाता, अब आवाज़ से</span></p>', unsafe_allow_html=True)
st.markdown('<p class="tagline">A simple Hindi/Hinglish sales ledger for busy kirana shops.</p>', unsafe_allow_html=True)

if show_tips:
    st.info("Try: **2 kilo chawal 50 rupay** · **do doodh 60** · **१ atta ४०**", icon="💡")

tab_voice, tab_type = st.tabs(["🎙️ Bolo", "⌨️ Type karo"])

with tab_voice:
    st.subheader("Sale bolo")
    st.caption("Record one sale in Hindi or Hinglish. Example: ‘2 kilo chawal 50 rupay’. ")
    recording = st.audio_input("Mic dabakar bolo", key="sale_audio")
    if recording is not None:
        digest = hashlib.sha256(recording.getvalue()).hexdigest()
        if st.session_state.last_audio != digest:
            st.session_state.last_audio = digest
            try:
                with st.spinner("Samajh raha hoon..."):
                    transcript = transcribe(recording.getvalue())
                if transcript:
                    handle_text(transcript, voice_reply=voice_reply)
                else:
                    st.warning("Awaaz saaf nahi aayi. Phir se bolo ya Type karo.")
            except Exception as exc:
                st.error(f"Speech service error: {exc}")
                st.caption("Check GNANI_API_KEY and try again. Typed entries remain available.")

with tab_type:
    st.subheader("Sale type karo")
    with st.form("typed", clear_on_submit=True):
        typed = st.text_input("Sale details", placeholder="2 kilo chawal 50 rupay")
        submitted = st.form_submit_button("Save karo", type="primary", width="stretch")
    if submitted:
        if typed.strip():
            handle_text(typed.strip(), voice_reply=voice_reply)
        else:
            st.warning("Pehle sale details likho.")


st.divider()
st.subheader("Aaj ka khata")
rows = today_entries()
total = today_total()
metric_entries, metric_total, metric_api = st.columns(3)
metric_entries.metric("Entries", len(rows))
metric_total.metric("Aaj ka total", f"₹{total:,}")
metric_api.metric("Input modes", "Voice + Text" if has_api_key() else "Text ready")

if rows:
    display_rows = [
        {"Time": row.get("time", "—"), "Item": row.get("item", "—"),
         "Qty": row.get("qty", "—"), "Amount (₹)": row.get("amount", "—")}
        for row in rows
    ]
    st.dataframe(display_rows, width="stretch", hide_index=True)
    action_col, download_col = st.columns([1, 1])
    with action_col:
        if st.button("↩️ Last entry undo karo", width="stretch"):
            removed = undo_last()
            if removed:
                st.toast(f"{removed['item']} entry undo ho gayi.", icon="↩️")
                st.rerun()
    with download_col:
        csv_buffer = StringIO()
        writer = csv.writer(csv_buffer)
        fields = ("date", "time", "item", "qty", "amount")
        writer.writerow(fields)
        writer.writerows([[row.get(field, "") for field in fields] for row in rows])
        st.download_button(
            "⬇️ Aaj ka CSV download",
            data=csv_buffer.getvalue(),
            file_name="voicekhata-today.csv",
            mime="text/csv",
            width="stretch",
        )
else:
    st.info("Abhi tak koi entry nahi. Bolo ya Type karo — your first sale is one tap away.", icon="🧾")
