# VoiceKhata · खाता, अब आवाज़ से

A voice-first sales ledger for Indian kirana shops. Say or type one sale —
`2 kilo chawal 50 rupay` — and it is parsed, saved, totalled and readable back
to you in Hindi, English or Marathi.

The repository ships two artefacts that share one idea:

| Artefact | Purpose | Tech | Deploy target |
| --- | --- | --- | --- |
| `web/` | The premium counter app and installable PWA (the website) | Plain HTML/CSS/JS, no build step, no CDN | GitHub Pages |
| `app.py` + modules | The Python app that calls the Gnani STT/TTS APIs | Streamlit + SQLite | Streamlit Community Cloud |

`web/` needs **no API key** — it uses the browser's own speech recognition and
stores the ledger locally, so the public site works for anyone who opens it.
The Python app is the one wired to Gnani and is the piece to show for the
Gnani internship submission.

## The web app (`web/`)

- **Voice or manual entry** with a segmented control, live parse preview before saving.
- **Trilingual parser** — Hindi, Hinglish, English, Marathi, Devanagari digits (`५०`), `₹`, and thousands separators (`₹1,200`).
- **Today's ledger** with totals, average bill, voice/manual filters, search, expandable receipt details.
- **Undo last entry**, today's CSV export, and a full backup export in Settings.
- **Real light/dark themes**, an animated switch pair, and language selection that also changes the speech-recognition language.
- **Installable PWA** with an offline shell (`manifest.webmanifest` + `sw.js`).
- Motion: staggered card reveals, pulsing mic ring, waveform while recording, animated counters, sliding segmented thumb, toast confirmations — all disabled under `prefers-reduced-motion`.

### Run the web app locally

```powershell
cd D:\voice-khata
python -m http.server 8765 --directory web
```

Open <http://localhost:8765>. Voice input needs Chrome or Edge; every other
feature works in any modern browser.

## The Python app (Gnani API)

```powershell
cd D:\voice-khata
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
pytest -q
streamlit run app.py
```

Voice features need a key in `.streamlit/secrets.toml` (git-ignored):

```toml
GNANI_API_KEY = "your-key"
```

Verify both API directions with one command — it speaks a Hindi sentence with
Timbre TTS, feeds that audio back into Prisma STT, and prints the transcript:

```powershell
python check_api.py
```

Or test your own recording:

```powershell
python check_api.py path\to\recording.wav
```

### Files

| File | Responsibility |
| --- | --- |
| `web/index.html` | App shell, accessibility landmarks, icon sprite |
| `web/styles.css` | Design tokens (light/dark), layout, motion |
| `web/app.js` | Parser, storage, rendering, speech, interactions |
| `web/sw.js` | Offline cache for the installed app |
| `app.py` | Streamlit UI for the Gnani-backed app |
| `database.py` | SQLite schema and sales/customer queries |
| `khata.py` | Multilingual parsing shared by the Python app |
| `gnani_client.py` | Gnani STT/TTS client |
| `ui_text.py` | Hindi/English/Marathi interface copy |

## Deploy the website (GitHub Pages)

1. Create an **empty public** repository named `voice-khata` on GitHub (no README, no `.gitignore`, no licence).
2. Push this folder:

```powershell
cd D:\voice-khata
git remote add origin https://github.com/YOUR-USERNAME/voice-khata.git
git push -u origin main
```

3. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The workflow in `.github/workflows/pages.yml` publishes `web/` on every push to `main`.

Your site: `https://YOUR-USERNAME.github.io/voice-khata/`

On Android, open that URL in Chrome and choose **Add to Home screen** — it then
runs full-screen from the home screen with offline support.

## Deploy the Python app (Streamlit Community Cloud)

1. Sign in at <https://share.streamlit.io> with GitHub.
2. **Create app** → repository `YOUR-USERNAME/voice-khata`, branch `main`, main file `app.py`.
3. **Advanced settings → Secrets**: add `GNANI_API_KEY = "your-key"`.
4. Deploy, then test voice on the generated HTTPS link (microphone needs HTTPS).

### Persistence note

The web app keeps entries in the browser's `localStorage`; the Python app keeps
them in `voicekhata.db`. Neither survives a wiped device or a Streamlit Cloud
restart, so export a CSV before clearing or redeploying. Point
`VOICEKHATA_DB_PATH` at a mounted volume for durable Python-side storage.

## Privacy

Use only synthetic or self-recorded entries for demos and screenshots. Never
commit `.streamlit/secrets.toml`, `voicekhata.db`, or exported CSVs.
