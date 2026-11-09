import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import gnani_client


class FakeResponse:
    status_code = 200
    content = b"RIFF-test-audio"

    def json(self):
        return {"transcript": "2 kilo chawal 50 rupay"}

    def raise_for_status(self):
        return None


def test_transcribe_uses_supported_request_shape(monkeypatch):
    calls = {}
    monkeypatch.setattr(gnani_client, "_api_key", lambda: "test-key")

    def fake_post(url, **kwargs):
        calls.update(url=url, kwargs=kwargs)
        return FakeResponse()

    monkeypatch.setattr(gnani_client.requests, "post", fake_post)
    assert gnani_client.transcribe(b"audio") == "2 kilo chawal 50 rupay"
    assert calls["url"].endswith("/stt/v3")
    assert calls["kwargs"]["headers"]["X-API-Key-ID"] == "test-key"
    assert calls["kwargs"]["data"]["language_code"] == "hi-IN"


def test_speak_includes_audio_configuration(monkeypatch):
    captured = {}
    monkeypatch.setattr(gnani_client, "_api_key", lambda: "test-key")

    def fake_post(url, **kwargs):
        captured.update(url=url, kwargs=kwargs)
        return FakeResponse()

    monkeypatch.setattr(gnani_client.requests, "post", fake_post)
    assert gnani_client.speak("Save ho gaya") == b"RIFF-test-audio"
    payload = captured["kwargs"]["json"]
    assert payload["model"] == "timbre-v2.5"
    assert payload["audio_config"]["container"] == "wav"
    assert payload["language"] == "hi-IN"
