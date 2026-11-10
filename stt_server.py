"""VoiceKhata dev/prod server: serves `web/` and bridges speech to Gnani.

The browser must never hold the Gnani API key, so the counter posts the recorded
clip here and this small stdlib server forwards it to Prisma STT. No framework,
no extra dependency beyond `requests` (already used by the Streamlit app).

    ./.venv/Scripts/python.exe stt_server.py
    ./.venv/Scripts/python.exe stt_server.py --port 8765 --host 0.0.0.0

Endpoints
    GET  /api/stt?health=1   -> { ok, stt: bool, model }
    POST /api/stt?lang=hi    -> body: audio bytes, returns { ok, text, lang }

The key is read from GNANI_API_KEY or .streamlit/secrets.toml, exactly like
`gnani_client.py`, so one secret configures both the Streamlit app and the web
counter. `stt` is false when no key is configured and the browser falls back to
its own speech engine.
"""
from __future__ import annotations

import argparse
import json
import os
import socket
import sys
import time
import tomllib
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEB_DIR = ROOT / "web"
sys.path.insert(0, str(ROOT))

from gnani_client import STT_MODEL, has_api_key, transcribe  # noqa: E402

LANG_CODES = {"hi": "hi-IN", "mr": "mr-IN", "en": "en-IN"}
MAX_UPLOAD = 20 * 1024 * 1024
MIME_EXT = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/x-wav": "wav",
}


def load_dev_key() -> None:
    """Let the server work without exporting the key first."""
    if os.environ.get("GNANI_API_KEY"):
        return
    secrets = ROOT / ".streamlit" / "secrets.toml"
    if not secrets.exists():
        return
    try:
        key = tomllib.loads(secrets.read_text(encoding="utf-8")).get("GNANI_API_KEY")
    except (tomllib.TOMLDecodeError, OSError):
        key = None
    if key:
        os.environ["GNANI_API_KEY"] = str(key)


class Handler(SimpleHTTPRequestHandler):
    server_version = "VoiceKhata/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_DIR), **kwargs)

    # -- helpers ---------------------------------------------------------
    def send_json(self, status: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        path = self.path.split("?", 1)[0]
        if not path.startswith("/api/"):
            if path.endswith((".html", ".js", ".css", ".webmanifest")) or path in ("/", ""):
                # Dev-friendly: a refresh always picks up the edited file.
                self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    # -- routes ----------------------------------------------------------
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/stt":
            return self.send_json(200, {"ok": True, "stt": has_api_key(), "model": STT_MODEL})
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path != "/api/stt":
            return self.send_error(404)

        query = urllib.parse.parse_qs(parsed.query)
        lang = (query.get("lang") or ["hi"])[0]
        if lang not in LANG_CODES:
            return self.send_json(400, {"ok": False, "error": "Unsupported language"})
        if not has_api_key():
            return self.send_json(503, {"ok": False, "error": "Speech service is not configured"})

        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = 0
        if length <= 0:
            return self.send_json(400, {"ok": False, "error": "Empty recording"})
        if length > MAX_UPLOAD:
            return self.send_json(413, {"ok": False, "error": "Recording too large"})

        audio = self.rfile.read(length)
        content_type = (self.headers.get("Content-Type") or "audio/webm").split(";")[0].strip().lower()
        extension = MIME_EXT.get(content_type, "webm")
        started = time.monotonic()
        try:
            text = transcribe(
                audio,
                LANG_CODES[lang],
                filename=f"recording.{extension}",
                content_type=content_type,
            )
        except Exception as exc:  # noqa: BLE001 - reported to the UI, never fatal
            self.log_message("stt %s failed: %s", lang, exc)
            return self.send_json(502, {"ok": False, "error": "Speech service failed"})
        elapsed = time.monotonic() - started
        self.log_message("stt %s ok: %d bytes in %.1fs", lang, len(audio), elapsed)
        return self.send_json(200, {"ok": True, "text": text, "lang": LANG_CODES[lang]})


def lan_address() -> str | None:
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.connect(("8.8.8.8", 80))
        address = sock.getsockname()[0]
        sock.close()
        return address
    except OSError:
        return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Serve VoiceKhata with a speech bridge")
    parser.add_argument("--host", default="0.0.0.0", help="0.0.0.0 lets your phone on Wi-Fi open it")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()

    load_dev_key()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    server.daemon_threads = True
    state = "on (Gnani Prisma)" if has_api_key() else "off (browser speech fallback)"
    print(f"VoiceKhata  http://localhost:{args.port}   STT: {state}")
    ip = lan_address()
    if ip and args.host == "0.0.0.0":
        print(f"Phone (same Wi-Fi): http://{ip}:{args.port}/welcome.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
