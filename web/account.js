/* =========================================================
   VoiceKhata — account page
   Google sign-in (when a client ID is configured) and mobile OTP.
   Without a provider the OTP is shown on screen, clearly labelled
   as demo mode, so the flow stays testable offline.
   ========================================================= */

(function () {
  const cfg = window.VOICEKHATA_CONFIG || {};
  const KEY = "voicekhata.account";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const el = {
    tabs: $(".auth__tabs"),
    tabLogin: $("#tabLogin"),
    tabSignup: $("#tabSignup"),
    signupFields: $("#signupFields"),
    form: $("#authForm"),
    name: $("#authName"),
    shop: $("#authShop"),
    phone: $("#authPhone"),
    sendOtp: $("#sendOtp"),
    sendOtpText: $("#sendOtpText"),
    otpStep: $("#otpStep"),
    otpPhone: $("#otpPhone"),
    otpInputs: $$("#otpInputs input"),
    otpNote: $("#otpNote"),
    verify: $("#verifyOtp"),
    resend: $("#resendOtp"),
    resendTimer: $("#resendTimer"),
    msg: $("#formMsg"),
    googleBtn: $("#googleBtn"),
    googleSlot: $("#googleSlot"),
    configNote: $("#configNote"),
    flow: $("#authFlow"),
    signed: $("#signedIn"),
    signedAvatar: $("#signedAvatar"),
    signedMeta: $("#signedMeta"),
    signOut: $("#signOutBtn"),
  };

  let mode = "login";
  let demoCode = "";
  let pendingPhone = "";
  let pendingName = "";
  let pendingShop = "";
  let timerId = null;

  /* ---------------- helpers ---------------- */

  const readSession = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  };

  const saveSession = (session) => {
    localStorage.setItem(KEY, JSON.stringify(session));
  };

  const initials = (value) =>
    String(value || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "VK";

  function setMsg(text, kind) {
    el.msg.textContent = text || "";
    el.msg.classList.toggle("is-error", kind === "error");
    el.msg.classList.toggle("is-ok", kind === "ok");
  }

  function setBad(node, bad) {
    node.classList.toggle("is-bad", bad);
  }

  const onlyDigits = (value) => String(value).replace(/\D/g, "");

  function validPhone(value) {
    return /^[6-9]\d{9}$/.test(value);
  }

  function startResendTimer() {
    let left = 30;
    el.resend.disabled = true;
    el.resendTimer.textContent = `${left}s`;
    clearInterval(timerId);
    timerId = setInterval(() => {
      left -= 1;
      el.resendTimer.textContent = `${left}s`;
      if (left <= 0) {
        clearInterval(timerId);
        el.resend.disabled = false;
        el.resendTimer.textContent = "";
      }
    }, 1000);
  }

  /* ---------------- session UI ---------------- */

  function renderSession() {
    const session = readSession();
    if (!session) {
      el.signed.hidden = true;
      el.flow.hidden = false;
      return;
    }
    el.flow.hidden = true;
    el.signed.hidden = false;
    el.signedAvatar.textContent = initials(session.name || session.email || session.phone);
    const bits = [session.name, session.email || (session.phone ? "+91 " + session.phone : ""), session.shop]
      .filter(Boolean)
      .join(" · ");
    el.signedMeta.textContent = bits || "VoiceKhata account";
  }

  function finish(session) {
    saveSession(session);
    renderSession();
    setMsg("साइन इन हो गया — काउंटर खोलें।", "ok");
  }

  /* ---------------- tabs ---------------- */

  function setMode(next) {
    mode = next;
    const signup = mode === "signup";
    el.tabs.classList.toggle("is-signup", signup);
    el.tabLogin.classList.toggle("is-active", !signup);
    el.tabSignup.classList.toggle("is-active", signup);
    el.tabLogin.setAttribute("aria-selected", String(!signup));
    el.tabSignup.setAttribute("aria-selected", String(signup));
    el.signupFields.hidden = !signup;
    el.sendOtpText.textContent = signup ? "OTP भेजें" : "OTP भेजें";
    setMsg("");
  }

  el.tabLogin.addEventListener("click", () => setMode("login"));
  el.tabSignup.addEventListener("click", () => setMode("signup"));

  /* ---------------- OTP ---------------- */

  const otpValue = () => el.otpInputs.map((input) => input.value).join("");

  function fillOtp(code) {
    el.otpInputs.forEach((input, index) => {
      input.value = code[index] || "";
    });
  }

  function requestOtp() {
    const phone = onlyDigits(el.phone.value);
    setBad(el.phone, !validPhone(phone));
    if (!validPhone(phone)) {
      setMsg("10 अंकों का सही मोबाइल नंबर डालें (6-9 से शुरू)।", "error");
      el.phone.focus();
      return;
    }
    if (mode === "signup") {
      const name = el.name.value.trim();
      const shop = el.shop.value.trim();
      setBad(el.name, name.length < 2);
      setBad(el.shop, shop.length < 2);
      if (name.length < 2 || shop.length < 2) {
        setMsg("नाम और दुकान का नाम भरें।", "error");
        return;
      }
      pendingName = name;
      pendingShop = shop;
    } else {
      pendingName = "";
      pendingShop = "";
    }

    pendingPhone = phone;
    el.otpStep.hidden = false;
    el.otpPhone.textContent = `+91 ${phone}`;
    el.otpInputs[0].focus();
    setMsg("");

    if (cfg.otpEndpoint) {
      fetch(cfg.otpEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("send failed");
          el.otpNote.hidden = true;
          setMsg("OTP भेज दिया गया।", "ok");
        })
        .catch(() => setMsg("OTP नहीं भेजा जा सका — दोबारा कोशिश करें।", "error"));
      startResendTimer();
      return;
    }

    demoCode = String(Math.floor(100000 + Math.random() * 900000));
    el.otpNote.hidden = false;
    el.otpNote.textContent = `डेमो मोड (SMS सेटअप नहीं): आपका OTP ${demoCode}`;
    startResendTimer();
  }

  el.form.addEventListener("submit", (event) => {
    event.preventDefault();
    requestOtp();
  });

  el.resend.addEventListener("click", () => {
    if (el.resend.disabled) return;
    demoCode = String(Math.floor(100000 + Math.random() * 900000));
    fillOtp("");
    if (!cfg.otpEndpoint) {
      el.otpNote.textContent = `डेमो मोड (SMS सेटअप नहीं): आपका OTP ${demoCode}`;
    }
    setMsg("नया OTP भेजा गया।", "ok");
    startResendTimer();
    el.otpInputs[0].focus();
  });

  el.otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = onlyDigits(input.value).slice(0, 1);
      if (input.value && index < el.otpInputs.length - 1) el.otpInputs[index + 1].focus();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && index > 0) {
        el.otpInputs[index - 1].focus();
      }
    });
    input.addEventListener("paste", (event) => {
      event.preventDefault();
      const digits = onlyDigits(event.clipboardData.getData("text")).slice(0, 6);
      if (digits) fillOtp(digits);
    });
  });

  async function verifyOtp() {
    const code = otpValue();
    if (code.length !== 6) {
      setMsg("पूरा 6 अंकों का OTP डालें।", "error");
      el.otpInputs[0].focus();
      return;
    }

    if (cfg.otpEndpoint) {
      el.verify.disabled = true;
      try {
        const response = await fetch(cfg.otpEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: pendingPhone, code }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.ok === false) throw new Error("verify failed");
        finish({
          name: pendingName || data.name || "दुकानदार",
          shop: pendingShop,
          phone: pendingPhone,
          provider: "phone",
          since: Date.now(),
        });
      } catch {
        setMsg("OTP सही नहीं है या expire हो गया।", "error");
        el.otpStep.classList.add("shake");
        setTimeout(() => el.otpStep.classList.remove("shake"), 420);
      } finally {
        el.verify.disabled = false;
      }
      return;
    }

    if (code !== demoCode) {
      setMsg("OTP मेल नहीं खाया — फिर देखें।", "error");
      el.otpStep.classList.add("shake");
      setTimeout(() => el.otpStep.classList.remove("shake"), 420);
      return;
    }

    finish({
      name: pendingName || "दुकानदार",
      shop: pendingShop,
      phone: pendingPhone,
      provider: "phone",
      since: Date.now(),
    });
  }

  el.verify.addEventListener("click", verifyOtp);

  /* ---------------- Google ---------------- */

  function decodeJwt(token) {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    try {
      return JSON.parse(decodeURIComponent(
        atob(padded).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
      ));
    } catch {
      return null;
    }
  }

  function handleGoogleCredential(response) {
    const payload = decodeJwt(response.credential || "");
    const issuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!payload || !issuers.includes(payload.iss) || payload.aud !== cfg.googleClientId) {
      setMsg("Google से मिली जानकारी सत्यापित नहीं हुई।", "error");
      return;
    }
    if (payload.email_verified === false || payload.email_verified === "false") {
      setMsg("यह Google ईमेल सत्यापित नहीं है।", "error");
      return;
    }
    finish({
      name: payload.name || payload.given_name || "दुकानदार",
      email: payload.email || "",
      provider: "google",
      since: Date.now(),
    });
  }

  function initGoogle() {
    if (!window.google || !window.google.accounts) return;
    window.google.accounts.id.initialize({
      client_id: cfg.googleClientId,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    el.googleBtn.hidden = true;
    el.googleSlot.hidden = false;
    window.google.accounts.id.renderButton(el.googleSlot, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 320,
    });
  }

  if (cfg.googleClientId) {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }

  el.googleBtn.addEventListener("click", () => {
    if (cfg.googleClientId) {
      setMsg("Google साइन-इन लोड हो रहा है…", "");
      return;
    }
    el.configNote.hidden = false;
    el.configNote.textContent =
      "Google लॉगिन चालू करने के लिए config.js में googleClientId डालें (Google Cloud Console → OAuth Web client, और अपना site origin authorised origin में जोड़ें)। तब तक मोबाइल OTP डेमो मोड में चलेगा।";
    setMsg("Google लॉगिन अभी कॉन्फ़िगर नहीं है — नीचे OTP से साइन इन करें।", "error");
  });

  /* ---------------- sign out ---------------- */

  el.signOut.addEventListener("click", () => {
    localStorage.removeItem(KEY);
    renderSession();
    setMsg("साइन आउट हो गया।", "ok");
  });

  /* ---------------- init ---------------- */

  try {
    const settings = JSON.parse(localStorage.getItem("voicekhata.v4") || "null");
    if (settings && settings.settings && settings.settings.theme === "dark") {
      document.documentElement.dataset.theme = "dark";
    }
  } catch {
    /* theme is cosmetic here */
  }

  if (!cfg.googleClientId || !cfg.otpEndpoint) {
    el.configNote.hidden = false;
    const missing = [
      cfg.googleClientId ? null : "Google (googleClientId)",
      cfg.otpEndpoint ? null : "असली SMS OTP (otpEndpoint)",
    ].filter(Boolean).join(", ");
    el.configNote.textContent = `सेटअप बाकी: ${missing}. तब तक OTP स्क्रीन पर दिखता है और आपका खाता इसी डिवाइस में सुरक्षित रहता है।`;
  }

  renderSession();
  setMode("login");
})();
