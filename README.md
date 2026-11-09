# VoiceKhata

VoiceKhata is a small, friendly sales ledger for Indian kirana shops. A shop
owner can speak a sale in Hindi/Hinglish or type it, see the running total, and
undo the most recent entry when needed.

## Why it is useful

Paper ledgers are slow to update while serving customers. VoiceKhata turns a
short phrase such as `2 kilo chawal 50 rupay` into a dated ledger entry and can
read the confirmation back using Gnani voice services.

## Features

- Voice input through Streamlit's microphone widget.
- Typed Hindi, Hinglish, English, and Devanagari digit input.
- Tested parsing for common kirana items and Hindi number words.
- Daily entry table, running total, CSV export, and one-tap undo.
- Voice-confirmation and quick-tip toggles in the sidebar.
- Graceful fallback to typed mode when the Gnani key or TTS service is unavailable.

## Architecture

`audio -> Gnani Prisma STT -> parser -> sales.csv -> daily total -> optional Gnani Timbre TTS`

The parser and CSV layer are isolated in `khata.py`, which keeps the core
behavior testable without a browser or API key. `app.py` contains the Streamlit
UI and `gnani_client.py` contains the external API calls.

## Run locally

Use Python 3.10+ in a virtual environment:

```bash
pip install -r requirements.txt
```

For voice input, copy `.streamlit/secrets.toml.example` to
`.streamlit/secrets.toml` and add your Gnani key. Never commit that file.

Run the tests before opening the app:

```bash
pytest -q
streamlit run app.py
```

Open `http://localhost:8501`. Typed entries work without an API key; the Bolo
tab needs `GNANI_API_KEY`. Browsers generally require HTTPS for microphone
access, so test real voice input again on the deployed Streamlit URL.

## Test coverage

The test suite covers ASCII and Devanagari digits, Hindi number words, item
aliases, invalid phrases such as `chawal lao`, zero rejection, daily totals,
CSV persistence, and undo behavior.

## Deploy on Streamlit Community Cloud

1. Create a public GitHub repository named `voice-khata`.
2. Push this folder to the `main` branch.
3. In Streamlit Community Cloud, choose **Create app**, select the repository,
   branch `main`, and set the main file to `app.py`.
4. Under **Advanced settings → Secrets**, add:

   ```toml
   GNANI_API_KEY = "your-key"
   ```

5. Deploy and copy the generated HTTPS URL into your internship submission.

The app uses a local CSV for this MVP. Free hosted instances can reset local
files when they restart, so a future production version should use a database
or managed storage.

## Privacy

Use synthetic or self-recorded examples while evaluating the project. Do not
store real customer personal data in this demo ledger.
