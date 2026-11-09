/* =========================================================
   VoiceKhata — welcome flow
   Intro → sign in (Google / mobile OTP / guest) → counter.
   The OTP is shown on screen while config.otpEndpoint is empty,
   and Google stays in guided-setup mode without a client ID.
   ========================================================= */

(function () {
  const cfg = window.VOICEKHATA_CONFIG || {};
  const ACCOUNT_KEY = "voicekhata.account";
  const GUEST_KEY = "voicekhata.guest";
  const STORE_KEY = "voicekhata.v4";
  const LANG_KEY = "voicekhata.welcomeLang";
  const THEME_KEY = "voicekhata.welcomeTheme";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const el = {
    html: document.documentElement,
    introView: $("#introView"),
    authView: $("#authView"),
    startService: $("#startService"),
    backIntro: $("#backIntro"),
    lang: $("#welcomeLang"),
    theme: $("#welcomeTheme"),
    themeSun: $("#themeSun"),
    themeMoon: $("#themeMoon"),
    tabs: $(".w-tabs"),
    tabLogin: $("#tabLogin"),
    tabSignup: $("#tabSignup"),
    signupFields: $("#signupFields"),
    authForm: $("#authForm"),
    name: $("#authName"),
    shop: $("#authShop"),
    phone: $("#authPhone"),
    sendOtp: $("#sendOtp"),
    otpForm: $("#otpForm"),
    otpPhone: $("#otpPhone"),
    otpInputs: $$("#otpInputs input"),
    otpNote: $("#otpNote"),
    verify: $("#verifyOtp"),
    resend: $("#resendOtp"),
    resendTimer: $("#resendTimer"),
    changePhone: $("#changePhone"),
    msg: $("#formMsg"),
    google: $("#googleBtn"),
    googleSlot: $("#googleSlot"),
    configNote: $("#configNote"),
    guest: $("#guestBtn"),
  };

  const DICT = {
    hi: {
      navSite: "वेबसाइट",
      eyebrow: "दुकान का अपना आवाज़-खाता",
      heroTitle: "बोलिए — और बिक्री खाते में दर्ज।",
      heroSub: "VoiceKhata किराना दुकानों के लिए आवाज़ से चलने वाला खाता है। “2 किलो चावल 100 रुपये” बोलिए और बिक्री आज के रिकॉर्ड में जुड़ जाएगी — हिंदी, मराठी या अंग्रेज़ी में।",
      start: "सेवा शुरू करें",
      seeSite: "वेबसाइट देखें",
      flowNote: "आगे: परिचय → साइन इन → काउंटर",
      mockShop: "गुप्ता किराना",
      mockLive: "आज",
      mockTotal: "आज की बिक्री",
      mockRow1: "2 किलो चावल",
      mockRow2: "1 दूध पैकेट",
      mockRow3: "तेल 1 लीटर",
      mockChip1: "दर्ज हो गया",
      mockChip2: "₹100 जुड़े",
      f1t: "बोलकर बिक्री",
      f1s: "माइक दबाइए, बोलिए, और सहेजिए — टाइप करने की ज़रूरत नहीं।",
      f2t: "हर दिन का हिसाब",
      f2s: "आज की बिक्री, कुल रकम और CSV डाउनलोड — सब एक स्क्रीन पर।",
      f3t: "3 भाषाएँ, ऑफ़लाइन",
      f3s: "हिंदी, मराठी और English — इंटरनेट बंद हो तो भी खाता खुलता है।",
      howSub: "तीन आसान कदम",
      howTitle: "कैसे चलता है",
      s1t: "परिचय देखें",
      s1s: "ऐप क्या करता है, एक नज़र में।",
      s2t: "साइन इन करें",
      s2s: "Google या मोबाइल OTP से, 10 सेकंड में।",
      s3t: "काउंटर खोलें",
      s3s: "बोलिए और बिक्री दर्ज करें।",
      foot: "Android पर “Add to Home screen” से ऐप जैसा चलेगा — वेब पर भी वही अनुभव।",
      back: "परिचय",
      step2: "स्टेप 2 · साइन इन",
      authTitle: "अपना खाता जोड़ें",
      authSub: "सिर्फ़ 10 सेकंड — कोई पासवर्ड नहीं।",
      tabLogin: "लॉगिन",
      tabSignup: "नया खाता",
      google: "Google से जारी रखें",
      orPhone: "या मोबाइल नंबर से",
      nameLabel: "आपका नाम",
      shopLabel: "दुकान का नाम",
      phoneLabel: "मोबाइल नंबर",
      phoneHelp: "10 अंक, 6–9 से शुरू होने वाला नंबर",
      sendOtp: "OTP भेजें",
      codeSent: "OTP भेजा गया",
      changePhone: "बदलें",
      verify: "OTP सत्यापित करें",
      resend: "फिर भेजें",
      guest: "बिना खाता आगे बढ़ें →",
      fine: "खाता इसी डिवाइस में सुरक्षित रहता है। असली SMS और Google के लिए config.js में सेटअप करें।",
      msgPhone: "10 अंकों का सही मोबाइल नंबर डालें (6–9 से शुरू)।",
      msgSending: "OTP भेजा जा रहा है…",
      msgCode: "6 अंकों का OTP डालें।",
      msgWrong: "OTP सही नहीं है — फिर कोशिश करें।",
      msgOk: "साइन इन हो गया — काउंटर खुल रहा है…",
      msgGuest: "अतिथि मोड — काउंटर खुल रहा है…",
      msgGoogleOff: "Google लॉगिन अभी सेट नहीं है — मोबाइल OTP या अतिथि से आगे बढ़ें।",
      msgNet: "सर्वर से संपर्क नहीं हुआ — फिर कोशिश करें।",
      demoPrefix: "डेमो OTP: ",
      configMissing: "सेटअप बाकी: {list}. तब तक OTP स्क्रीन पर दिखता है और खाता इसी डिवाइस में रहता है।",
      demoOk: "डेमो मोड चालू — असली SMS के लिए config.js में otpEndpoint डालें।",
      signedInAlready: "आप पहले से साइन इन हैं — काउंटर खुल रहा है…",
    },
    mr: {
      navSite: "वेबसाइट",
      eyebrow: "दुकानचे स्वतःचे आवाज-खाते",
      heroTitle: "बोला — आणि विक्री खात्यात नोंदली.",
      heroSub: "VoiceKhata किराणा दुकानांसाठी आवाजाने चालणारे खाते आहे. “2 किलो तांदूळ 100 रुपये” बोला आणि विक्री आजच्या नोंदीत जोडली जाईल — हिंदी, मराठी किंवा इंग्रजीत.",
      start: "सेवा सुरू करा",
      seeSite: "वेबसाइट पहा",
      flowNote: "पुढे: ओळख → साइन इन → काउंटर",
      mockShop: "गुप्ता किराणा",
      mockLive: "आज",
      mockTotal: "आजची विक्री",
      mockRow1: "2 किलो तांदूळ",
      mockRow2: "1 दूध पॅकेट",
      mockRow3: "तेल 1 लिटर",
      mockChip1: "नोंद झाली",
      mockChip2: "₹100 जोडले",
      f1t: "बोलून विक्री",
      f1s: "माइक दाबा, बोला आणि जतन करा — टाइप करण्याची गरज नाही.",
      f2t: "रोजचा हिशोब",
      f2s: "आजची विक्री, एकूण रक्कम आणि CSV डाउनलोड — सगळे एका स्क्रीनवर.",
      f3t: "3 भाषा, ऑफलाइन",
      f3s: "हिंदी, मराठी आणि English — इंटरनेट बंद असले तरी खाते उघडते.",
      howSub: "तीन सोपे टप्पे",
      howTitle: "कसे चालते",
      s1t: "ओळख पहा",
      s1s: "अ‍ॅप काय करते, एका नजरेत.",
      s2t: "साइन इन करा",
      s2s: "Google किंवा मोबाइल OTP ने, 10 सेकंदात.",
      s3t: "काउंटर उघडा",
      s3s: "बोला आणि विक्री नोंदवा.",
      foot: "Android वर “Add to Home screen” ने अ‍ॅपसारखे चालेल — वेबवरही तोच अनुभव.",
      back: "ओळख",
      step2: "टप्पा 2 · साइन इन",
      authTitle: "तुमचे खाते जोडा",
      authSub: "फक्त 10 सेकंद — पासवर्ड नाही.",
      tabLogin: "लॉगिन",
      tabSignup: "नवे खाते",
      google: "Google ने सुरू ठेवा",
      orPhone: "किंवा मोबाइल नंबरने",
      nameLabel: "तुमचे नाव",
      shopLabel: "दुकानाचे नाव",
      phoneLabel: "मोबाइल नंबर",
      phoneHelp: "10 अंक, 6–9 ने सुरू होणारा नंबर",
      sendOtp: "OTP पाठवा",
      codeSent: "OTP पाठवला",
      changePhone: "बदला",
      verify: "OTP तपासा",
      resend: "पुन्हा पाठवा",
      guest: "खात्याशिवाय पुढे जा →",
      fine: "खाते याच डिव्हाइसवर सुरक्षित राहते. खऱ्या SMS आणि Google साठी config.js मध्ये सेटअप करा.",
      msgPhone: "10 अंकी योग्य मोबाइल नंबर द्या (6–9 ने सुरू).",
      msgSending: "OTP पाठवत आहे…",
      msgCode: "6 अंकी OTP द्या.",
      msgWrong: "OTP जुळत नाही — पुन्हा प्रयत्न करा.",
      msgOk: "साइन इन झाले — काउंटर उघडत आहे…",
      msgGuest: "अतिथी मोड — काउंटर उघडत आहे…",
      msgGoogleOff: "Google लॉगिन अजून सेट नाही — मोबाइल OTP किंवा अतिथीने पुढे जा.",
      msgNet: "सर्व्हरशी संपर्क झाला नाही — पुन्हा प्रयत्न करा.",
      demoPrefix: "डेमो OTP: ",
      configMissing: "सेटअप बाकी: {list}. तोपर्यंत OTP स्क्रीनवर दिसतो आणि खाते याच डिव्हाइसवर राहते.",
      demoOk: "डेमो मोड सुरू — खऱ्या SMS साठी config.js मध्ये otpEndpoint द्या.",
      signedInAlready: "तुम्ही आधीच साइन इन आहात — काउंटर उघडत आहे…",
    },
    en: {
      navSite: "Website",
      eyebrow: "Your shop's own voice ledger",
      heroTitle: "Speak — and the sale lands in the book.",
      heroSub: "VoiceKhata is a voice-first ledger for kirana shops. Say “2 kilo rice 100 rupees” and it is added to today's record — in Hindi, Marathi or English.",
      start: "Start the service",
      seeSite: "See the website",
      flowNote: "Next: intro → sign in → counter",
      mockShop: "Gupta Kirana",
      mockLive: "Today",
      mockTotal: "Today's sales",
      mockRow1: "2 kilo rice",
      mockRow2: "1 milk packet",
      mockRow3: "1 litre oil",
      mockChip1: "Saved",
      mockChip2: "₹100 added",
      f1t: "Sell by voice",
      f1s: "Tap the mic, speak, and save — no typing needed.",
      f2t: "Every day's books",
      f2s: "Today's sales, running total and CSV download on one screen.",
      f3t: "3 languages, offline",
      f3s: "Hindi, Marathi and English — the counter opens without internet.",
      howSub: "Three easy steps",
      howTitle: "How it works",
      s1t: "See the intro",
      s1s: "What the app does, at a glance.",
      s2t: "Sign in",
      s2s: "Google or mobile OTP, in 10 seconds.",
      s3t: "Open the counter",
      s3s: "Speak and record your sales.",
      foot: "On Android, “Add to Home screen” runs it like an app — same experience on the web.",
      back: "Intro",
      step2: "Step 2 · Sign in",
      authTitle: "Add your account",
      authSub: "Just 10 seconds — no password.",
      tabLogin: "Log in",
      tabSignup: "New account",
      google: "Continue with Google",
      orPhone: "or use a mobile number",
      nameLabel: "Your name",
      shopLabel: "Shop name",
      phoneLabel: "Mobile number",
      phoneHelp: "10 digits, starting 6–9",
      sendOtp: "Send OTP",
      codeSent: "OTP sent to",
      changePhone: "Change",
      verify: "Verify OTP",
      resend: "Resend",
      guest: "Continue without an account →",
      fine: "The account stays on this device. Add real SMS and Google in config.js.",
      msgPhone: "Enter a valid 10-digit mobile number (starting 6–9).",
      msgSending: "Sending OTP…",
      msgCode: "Enter the 6-digit OTP.",
      msgWrong: "That OTP is wrong — try again.",
      msgOk: "Signed in — opening the counter…",
      msgGuest: "Guest mode — opening the counter…",
      msgGoogleOff: "Google login is not configured yet — use mobile OTP or guest mode.",
      msgNet: "Could not reach the server — try again.",
      demoPrefix: "Demo OTP: ",
      configMissing: "Setup pending: {list}. Until then the OTP appears on screen and the account stays on this device.",
      demoOk: "Demo mode is on — add otpEndpoint in config.js for real SMS.",
      signedInAlready: "You are already signed in — opening the counter…",
    },
  };

  let lang = "hi";
  let theme = "light";
  let mode = "login";
  let demoCode = "";
  let pendingPhone = "";
  let pendingName = "";
  let pendingShop = "";
  let timerId = null;
  let busy = false;

  const t = (key) => (DICT[lang] && DICT[lang][key]) || DICT.hi[key] || key;
  const onlyDigits = (value) => String(value).replace(/\D/g, "");
  const validPhone = (value) => /^[6-9]\d{9}$/.test(value);
  const initials = (value) =>
    String(value || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "VK";

  /* ---------------- preferences ---------------- */

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; } catch { return {}; }
  }

  function savePrefs(patch) {
    const store = readStore();
    store.version = store.version || 4;
    store.sales = Array.isArray(store.sales) ? store.sales : [];
    store.profile = store.profile || {};
    store.settings = {
      lang, theme, voiceConfirm: true, tips: true,
      ...(store.settings || {}),
      ...patch,
    };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { /* storage may be blocked */ }
  }

  function applyLanguage(next) {
    lang = DICT[next] ? next : "hi";
    el.html.lang = lang;
    $$("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
    const phMap = { phonePh: "9876543210", namePh: "रमेश गुप्ता", shopPh: "गुप्ता किराना" };
    $$("[data-i18n-ph]").forEach((node) => {
      const value = phMap[node.dataset.i18nPh];
      if (value) node.setAttribute("placeholder", value);
    });
    $$("#welcomeLang button").forEach((btn) => {
      btn.setAttribute("aria-checked", String(btn.dataset.lang === lang));
    });
    el.phone.placeholder = "9876543210";
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* ignore */ }
    savePrefs({ lang });
    setMsg(el.msg.textContent && el.msg.classList.contains("is-ok") ? t("msgOk") : "");
  }

  function applyTheme(next) {
    theme = next === "dark" ? "dark" : "light";
    el.html.dataset.theme = theme;
    el.themeSun.hidden = theme === "dark";
    el.themeMoon.hidden = theme !== "dark";
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
    savePrefs({ theme });
  }

  /* ---------------- screens ---------------- */

  function showAuth(scroll = true) {
    el.introView.hidden = true;
    el.authView.hidden = false;
    if (scroll) {
      el.authView.scrollIntoView({ block: "start", behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setTimeout(() => $("#authTitle").focus({ preventScroll: true }), 120);
  }

  function showIntro() {
    el.authView.hidden = true;
    el.introView.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    el.startService.focus({ preventScroll: true });
  }

  /* ---------------- session ---------------- */

  function readSession() {
    try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null"); } catch { return null; }
  }

  function finish(session, guest = false) {
    if (guest) {
      try {
        localStorage.setItem(GUEST_KEY, "1");
        localStorage.removeItem(ACCOUNT_KEY);
      } catch { /* storage may be blocked */ }
      setMsg(t("msgGuest"), "ok");
    } else {
      try {
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(session));
        localStorage.removeItem(GUEST_KEY);
      } catch { /* storage may be blocked */ }
      setMsg(t("msgOk"), "ok");
    }
    el.authView.classList.add("is-done");
    setTimeout(() => { window.location.assign("./"); }, 850);
  }

  /* ---------------- messages ---------------- */

  function setMsg(text, kind) {
    el.msg.textContent = text || "";
    el.msg.classList.toggle("is-error", kind === "error");
    el.msg.classList.toggle("is-ok", kind === "ok");
  }

  /* ---------------- tabs ---------------- */

  function setMode(next) {
    mode = next === "signup" ? "signup" : "login";
    const signup = mode === "signup";
    el.tabLogin.classList.toggle("is-active", !signup);
    el.tabSignup.classList.toggle("is-active", signup);
    el.tabLogin.setAttribute("aria-selected", String(!signup));
    el.tabSignup.setAttribute("aria-selected", String(signup));
    el.signupFields.hidden = !signup;
    setMsg("");
  }

  /* ---------------- OTP ---------------- */

  const otpValue = () => el.otpInputs.map((input) => input.value).join("");

  function openOtp() {
    el.authForm.hidden = true;
    el.otpForm.hidden = false;
    el.otpPhone.textContent = `+91 ${pendingPhone}`;
    el.otpInputs.forEach((input) => { input.value = ""; });
    startResendTimer();
    setTimeout(() => el.otpInputs[0].focus(), 80);
  }

  function backToPhone() {
    el.otpForm.hidden = true;
    el.authForm.hidden = false;
    el.otpNote.hidden = true;
    clearInterval(timerId);
    el.resend.disabled = false;
    el.resendTimer.textContent = "";
    setMsg("");
    el.phone.focus();
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

  async function sendCode() {
    pendingPhone = onlyDigits(el.phone.value);
    pendingName = el.name.value.trim();
    pendingShop = el.shop.value.trim();
    if (!validPhone(pendingPhone)) {
      setMsg(t("msgPhone"), "error");
      el.phone.focus();
      return;
    }
    if (busy) return;
    busy = true;
    el.sendOtp.disabled = true;
    setMsg(t("msgSending"));

    if (cfg.otpEndpoint) {
      try {
        const response = await fetch(cfg.otpEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: pendingPhone, purpose: mode }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error("otp-send");
        demoCode = "";
        el.otpNote.hidden = true;
        setMsg("");
        openOtp();
      } catch {
        setMsg(t("msgNet"), "error");
      } finally {
        busy = false;
        el.sendOtp.disabled = false;
      }
      return;
    }

    demoCode = String(Math.floor(100000 + Math.random() * 900000));
    setMsg("");
    openOtp();
    /* Demo convenience: prefill the code that is shown above, so the flow can
       be finished in one tap. Real SMS mode never fills it. */
    el.otpNote.hidden = false;
    el.otpNote.textContent = `${t("demoPrefix")}${demoCode}`;
    el.otpInputs.forEach((input, index) => { input.value = demoCode[index] || ""; });
    busy = false;
    el.sendOtp.disabled = false;
  }

  async function verifyCode() {
    const code = otpValue();
    if (!/^\d{6}$/.test(code)) {
      setMsg(t("msgCode"), "error");
      return;
    }
    if (busy) return;
    busy = true;
    el.verify.disabled = true;

    if (cfg.otpEndpoint) {
      try {
        const response = await fetch(cfg.otpEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: pendingPhone, code, purpose: mode }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) throw new Error("otp-verify");
        finish({
          name: data.name || pendingName || "दुकानदार",
          shop: data.shop || pendingShop,
          phone: pendingPhone,
          provider: "phone",
          since: Date.now(),
        });
      } catch {
        setMsg(t("msgWrong"), "error");
      } finally {
        busy = false;
        el.verify.disabled = false;
      }
      return;
    }

    if (code !== demoCode) {
      setMsg(t("msgWrong"), "error");
      busy = false;
      el.verify.disabled = false;
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

  el.otpInputs.forEach((input, index) => {
    input.addEventListener("input", () => {
      input.value = onlyDigits(input.value).slice(0, 1);
      if (input.value && index < el.otpInputs.length - 1) el.otpInputs[index + 1].focus();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Backspace" && !input.value && index > 0) el.otpInputs[index - 1].focus();
    });
    input.addEventListener("paste", (event) => {
      const text = onlyDigits(event.clipboardData.getData("text")).slice(0, 6);
      if (!text) return;
      event.preventDefault();
      el.otpInputs.forEach((box, i) => { box.value = text[i] || ""; });
      el.otpInputs[Math.min(text.length, 5)].focus();
    });
  });

  /* ---------------- Google ---------------- */

  function decodeJwt(token) {
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
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
      setMsg(lang === "en" ? "Could not verify the Google response." : "Google से मिली जानकारी सत्यापित नहीं हुई।", "error");
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
    if (!window.google || !window.google.accounts || !cfg.googleClientId) return;
    window.google.accounts.id.initialize({
      client_id: cfg.googleClientId,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    el.google.hidden = true;
    el.googleSlot.hidden = false;
    window.google.accounts.id.renderButton(el.googleSlot, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: 360,
    });
  }

  /* ---------------- events ---------------- */

  el.lang.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-lang]");
    if (btn && btn.dataset.lang !== lang) applyLanguage(btn.dataset.lang);
  });

  el.theme.addEventListener("click", () => applyTheme(theme === "dark" ? "light" : "dark"));
  el.startService.addEventListener("click", () => showAuth());
  el.backIntro.addEventListener("click", showIntro);
  el.tabLogin.addEventListener("click", () => setMode("login"));
  el.tabSignup.addEventListener("click", () => setMode("signup"));

  el.authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sendCode();
  });

  el.verify.addEventListener("click", verifyCode);
  el.resend.addEventListener("click", sendCode);
  el.changePhone.addEventListener("click", backToPhone);

  el.phone.addEventListener("input", () => {
    el.phone.value = onlyDigits(el.phone.value).slice(0, 10);
  });

  el.guest.addEventListener("click", () => finish(null, true));

  el.google.addEventListener("click", () => {
    if (cfg.googleClientId) {
      setMsg(t("msgSending"));
      return;
    }
    el.configNote.hidden = false;
    setMsg(t("msgGoogleOff"), "error");
  });

  /* ---------------- init ---------------- */

  const storedLang = (() => { try { return localStorage.getItem(LANG_KEY); } catch { return null; } })();
  const storedTheme = (() => { try { return localStorage.getItem(THEME_KEY); } catch { return null; } })();
  const store = readStore();
  applyLanguage(storedLang || (store.settings && store.settings.lang) || "hi");
  applyTheme(storedTheme || (store.settings && store.settings.theme) || "light");

  if (cfg.googleClientId) {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.head.appendChild(script);
  }

  const missing = [
    cfg.googleClientId ? null : "Google (googleClientId)",
    cfg.otpEndpoint ? null : "SMS OTP (otpEndpoint)",
  ].filter(Boolean);

  if (missing.length) {
    el.configNote.hidden = false;
    el.configNote.textContent = t("configMissing").replace("{list}", missing.join(", "));
  }

  if (readSession()) {
    setMsg(t("signedInAlready"), "ok");
    setTimeout(() => { window.location.assign("./"); }, 900);
  }
})();
