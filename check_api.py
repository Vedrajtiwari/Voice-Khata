"""Run once after setting GNANI_API_KEY to check STT and TTS work.

Usage on PowerShell:
    $env:GNANI_API_KEY = "your-key"
    python check_api.py test.wav
"""
import sys
from gnani_client import transcribe, speak


def main():
    if len(sys.argv) != 2:
        print("Usage: python check_api.py path\\to\\test.wav")
        return 2

    with open(sys.argv[1], "rb") as audio_file:
        print("Transcript:", transcribe(audio_file.read()))
    out = speak("Do kilo chawal, pachas rupay, save ho gaya.")
    if out:
        with open("reply.wav", "wb") as reply_file:
            reply_file.write(out)
        print("Wrote reply.wav")
    else:
        print("TTS returned nothing. Check the Gnani key and model settings.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
