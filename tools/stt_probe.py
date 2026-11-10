"""Repeatedly probe the Gnani speech API so the shopkeeper's language is heard.

The web counter keeps a tiny server-side bridge (`stt_server.py`) between the
browser and Gnani. This script exercises the same API directly: it speaks a set
of real counter sentences with Timbre TTS, sends each one back through Prisma
STT with the language the app would pick, and checks whether the shared parser
understands the result (same item, quantity and amount). Use it after changing a
model, a language code or the parser, so a regression is visible.

Usage (PowerShell):
    ./.venv/Scripts/python.exe tools/stt_probe.py
    ./.venv/Scripts/python.exe tools/stt_probe.py --file path\\to\\clip.wav --lang mr
"""
from __future__ import annotations

import argparse
import difflib
import os
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from gnani_client import speak, transcribe  # noqa: E402
from khata import parse_entry  # noqa: E402

LANG_CODES = {"hi": "hi-IN", "mr": "mr-IN", "en": "en-IN"}

PHRASES = [
    ("hi", "दो किलो चावल पचास रुपये"),
    ("hi", "एक किलो चीनी चालीस रुपये"),
    ("hi", "पांच किलो आटा दो सौ रुपये"),
    ("mr", "दोन किलो तांदूळ पन्नास रुपये"),
    ("mr", "एक किलो साखर चाळीस रुपये"),
    ("en", "two kilo rice fifty rupees"),
]


def load_key() -> bool:
    """Pick up GNANI_API_KEY from the environment or .streamlit/secrets.toml."""
    if os.environ.get("GNANI_API_KEY"):
        return True
    secrets = ROOT / ".streamlit" / "secrets.toml"
    if secrets.exists():
        try:
            key = tomllib.loads(secrets.read_text(encoding="utf-8")).get("GNANI_API_KEY")
        except (tomllib.TOMLDecodeError, OSError):
            key = None
        if key:
            os.environ["GNANI_API_KEY"] = str(key)
            return True
    return False


def similarity(expected: str, heard: str) -> float:
    return difflib.SequenceMatcher(None, expected, heard).ratio()


def understood(expected: str, heard: str) -> bool:
    """The counter is right when the parser reads the same sale, even if the
    API writes 'पचास' as '50' or drops a ₹ symbol."""
    want, got = parse_entry(expected), parse_entry(heard)
    if want and got:
        return (want["item"], want["qty"], want["amount"]) == (got["item"], got["qty"], got["amount"])
    return similarity(expected, heard.replace(" ", "")) >= 0.55


def run_phrase(lang: str, text: str) -> bool:
    code = LANG_CODES[lang]
    audio = speak(text, code)
    if not audio:
        print(f"  SKIP [{code}] TTS returned no audio for: {text}")
        return False
    heard = transcribe(audio, code)
    ok = understood(text, heard)
    print(f"  {'OK  ' if ok else 'FAIL'} [{code}] said:  {text}")
    print(f"        heard: {heard or '(empty)'}")
    return ok


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

    parser = argparse.ArgumentParser()
    parser.add_argument("--file", help="transcribe a local audio file instead")
    parser.add_argument("--lang", default="hi", choices=sorted(LANG_CODES))
    args = parser.parse_args()

    if not load_key():
        print("FAILED: GNANI_API_KEY is not set and .streamlit/secrets.toml has no key.")
        return 1

    if args.file:
        path = Path(args.file)
        heard = transcribe(path.read_bytes(), LANG_CODES[args.lang])
        print(f"{path.name} [{LANG_CODES[args.lang]}] -> {heard or '(empty)'}")
        return 0 if heard else 1

    passed = sum(run_phrase(lang, text) for lang, text in PHRASES)
    total = len(PHRASES)
    print(f"\n{passed}/{total} phrases understood by the counter parser")
    return 0 if passed >= total / 2 else 1


if __name__ == "__main__":
    raise SystemExit(main())
