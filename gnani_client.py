import os
import requests

BASE_URL = "https://api.vachana.ai"
STT_MODEL = os.environ.get("GNANI_STT_MODEL", "prisma-v2.5")
TTS_VOICE = os.environ.get("GNANI_TTS_VOICE", "Nalini")
TTS_MODEL = os.environ.get("GNANI_TTS_MODEL", "timbre-v2.5")
LANGUAGE = "hi-IN"


def _api_key():
    key = os.environ.get("GNANI_API_KEY")
    if not key:
        try:
            import streamlit as st
            key = st.secrets.get("GNANI_API_KEY")
        except Exception:
            key = None
    if not key:
        raise RuntimeError("GNANI_API_KEY not set. Use secrets.toml or an environment variable.")
    return key


def has_api_key():
    """Return whether the app has a Gnani key without raising an error."""
    try:
        return bool(_api_key())
    except RuntimeError:
        return False


def _check(resp):
    if resp.status_code == 401:
        raise RuntimeError("Invalid Gnani API key (401).")
    if resp.status_code == 402:
        raise RuntimeError("Out of credits (402). Check the dashboard.")
    if resp.status_code == 403:
        raise RuntimeError("Key lacks permission for this endpoint (403).")
    resp.raise_for_status()


def transcribe(audio_bytes):
    """Prisma speech-to-text. Returns the transcript string."""
    payload = {"language_code": LANGUAGE}
    if STT_MODEL:
        payload["model"] = STT_MODEL
    resp = requests.post(
        f"{BASE_URL}/stt/v3",
        headers={"X-API-Key-ID": _api_key()},
        files={"audio_file": ("recording.wav", audio_bytes, "audio/wav")},
        data=payload,
        timeout=60,
    )
    _check(resp)
    body = resp.json()
    return body.get("text") or body.get("transcript") or ""


def speak(text):
    """Timbre text-to-speech. Returns audio bytes, or None if TTS fails."""
    try:
        resp = requests.post(
            f"{BASE_URL}/api/v1/tts/inference",
            headers={"X-API-Key-ID": _api_key(), "Content-Type": "application/json"},
            json={
                "text": text,
                "voice": TTS_VOICE,
                "model": TTS_MODEL,
                "language": LANGUAGE,
                "audio_config": {
                    "encoding": "linear_pcm",
                    "container": "wav",
                    "num_channels": 1,
                    "sample_rate": 48000,
                    "sample_width": 2,
                },
            },
            timeout=60,
        )
        _check(resp)
        return resp.content
    except Exception as exc:
        print("TTS failed:", exc)
        return None
