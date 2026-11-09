"""Run once after setting GNANI_API_KEY to check STT and TTS work.

Usage on PowerShell:
    $env:GNANI_API_KEY = "your-key"
    python check_api.py test.wav

If you omit the audio path, the script speaks a short Hindi sentence with
Timbre TTS and feeds that audio straight back into Prisma STT, so you can
confirm both directions with one command.
"""
import sys

from gnani_client import speak, transcribe


def main():
    # Windows consoles default to a legacy code page that cannot print
    # Devanagari or Marathi transcripts, so write UTF-8 instead of crashing.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

    if len(sys.argv) > 2:
        print("Usage: python check_api.py [path\\to\\test.wav]")
        return 2

    if len(sys.argv) == 2:
        with open(sys.argv[1], "rb") as audio_file:
            audio = audio_file.read()
        print("Testing STT with", sys.argv[1])
    else:
        print("Speaking a sample sentence with Timbre TTS...")
        audio = speak("Do kilo chawal, pachas rupay, save ho gaya.")
        if not audio:
            print("FAILED: TTS returned nothing. Check the Gnani key and model settings.")
            return 1
        with open("reply.wav", "wb") as reply_file:
            reply_file.write(audio)
        print(f"OK: TTS returned {len(audio):,} bytes (wrote reply.wav)")

    try:
        transcript = transcribe(audio)
    except Exception as exc:
        print("FAILED: STT request failed:", exc)
        return 1

    if transcript:
        print("OK: STT transcript:", transcript)
    else:
        print("WARN: STT returned an empty transcript.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
