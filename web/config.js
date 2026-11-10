/* =========================================================
   VoiceKhata — optional integrations
   Fill these to turn the demo account system into real auth.
   Nothing here is secret: Google client IDs and public Firebase
   config are meant to live in the browser.
   ========================================================= */

window.VOICEKHATA_CONFIG = {
  /* Google Sign-In: create an OAuth "Web application" client ID at
     https://console.cloud.google.com/apis/credentials and add your
     GitHub Pages origin (https://USER.github.io) to Authorised origins.
     Leave empty to keep the Google button in guided-setup mode. */
  googleClientId: "",

  /* Real SMS OTP: a tiny endpoint that sends and verifies the code, e.g.
     a Cloudflare Worker holding an MSG91/Twilio key. Expected contract:
       POST { phone }        -> { ok: true }
       POST { phone, code }  -> { ok: true, name? }
     Leave empty to use the on-screen demo code. */
  otpEndpoint: "",

  /* Real speech-to-text through the small Python bridge (`stt_server.py`).
     The bridge keeps the Gnani key on the server, records better Hindi/Marathi
     than the browser engine, and answers `?health=1` so the app can fall back
     automatically when it is not running (for example on GitHub Pages). */
  sttEndpoint: "/api/stt",

  /* Shown on the account page when demo OTP is active. */
  demoMode: true,
};
