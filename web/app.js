/* =========================================================
   VoiceKhata — counter app
   Vanilla ES module, no build step, no CDN dependencies.
   ========================================================= */

/* ---------------------------- items ---------------------------- */

const ITEMS = [
  { key: "rice",    en: "Rice",    hi: "चावल",   mr: "तांदूळ", aliases: ["chawal", "rice", "चावल", "तांदूळ"] },
  { key: "atta",    en: "Atta",    hi: "आटा",    mr: "पीठ",    aliases: ["atta", "wheat", "flour", "आटा", "पीठ"] },
  { key: "milk",    en: "Milk",    hi: "दूध",    mr: "दूध",    aliases: ["doodh", "milk", "दूध"] },
  { key: "sugar",   en: "Sugar",   hi: "चीनी",   mr: "साखर",   aliases: ["cheeni", "sugar", "चीनी", "साखर"] },
  { key: "salt",    en: "Salt",    hi: "नमक",    mr: "मीठ",    aliases: ["namak", "salt", "नमक", "मीठ"] },
  { key: "oil",     en: "Oil",     hi: "तेल",    mr: "तेल",    aliases: ["tel", "oil", "तेल"] },
  { key: "dal",     en: "Dal",     hi: "दाल",    mr: "डाळ",    aliases: ["dal", "daal", "lentils", "दाल", "डाळ"] },
  { key: "tea",     en: "Tea",     hi: "चाय",    mr: "चहा",    aliases: ["chai", "tea", "चाय", "चहा"] },
  { key: "biscuit", en: "Biscuit", hi: "बिस्कुट", mr: "बिस्कीट", aliases: ["biscuit", "बिस्कुट", "बिस्कीट"] },
  { key: "haldi",   en: "Haldi",   hi: "हल्दी",  mr: "हळद",    aliases: ["haldi", "turmeric", "हल्दी", "हळद"] },
  { key: "soap",    en: "Soap",    hi: "साबुन",  mr: "साबण",   aliases: ["sabun", "soap", "साबुन", "साबण"] },
];

const NUMBER_WORDS = {
  ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, chhah: 6,
  saat: 7, aath: 8, nau: 9, das: 10, bees: 20, tees: 30, chalis: 40, pachas: 50,
  saath: 60, sattar: 70, assi: 80, nabbe: 90, sau: 100,
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "सात": 7, "आठ": 8,
  "नौ": 9, "दस": 10, "पचास": 50, "दोन": 2, "पाच": 5, "सहा": 6, "नऊ": 9, "दहा": 10, "पन्नास": 50,
};

const DEVA_DIGITS = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };

const UNITS = [
  { test: ["kilo", "kg", "kgs", "किलो", "किलोग्राम"], label: "kg" },
  { test: ["litre", "liter", "ltr", "l", "लीटर", "लिटर"], label: "L" },
  { test: ["packet", "pkt", "pack", "पैकेट"], label: "pkt" },
  { test: ["piece", "pc", "pcs", "nag", "पीस", "नग"], label: "pc" },
];

/* ---------------------------- i18n ---------------------------- */

const LANGS = {
  hi: { label: "हिंदी", speech: "hi-IN", save: "बिक्री सेव करें", total: "आज का कुल", entries: "एंट्री", voice: "बोलो", manual: "लिखो" },
  en: { label: "English", speech: "en-IN", save: "Save sale", total: "Today's total", entries: "Entries", voice: "Speak", manual: "Type" },
  mr: { label: "मराठी", speech: "mr-IN", save: "विक्री जतन करा", total: "आजची एकूण", entries: "नोंदी", voice: "बोला", manual: "टाइप" },
};

/* ---------------------------- helpers ---------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function localDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function normalizeDigits(text) {
  return text.replace(/[०-९]/g, (d) => DEVA_DIGITS[d] || d);
}

function itemByKey(key) {
  return ITEMS.find((i) => i.key === key) || ITEMS[0];
}

/* ---------------------------- parser ---------------------------- */

/**
 * Parse one spoken or typed sale.
 * "2 kilo chawal 50 rupay" -> { item, qty, amount, unit }
 * Returns { ok:false, reason } when it cannot be understood.
 */
function parseSale(raw) {
  if (typeof raw !== "string" || !raw.trim()) return { ok: false, reason: "empty" };

  const text = normalizeDigits(raw.toLowerCase())
    .replace(/[₹$]/g, " ")
    .replace(/(\d),(\d)/g, "$1$2")
    .replace(/[।|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  let item = null;
  for (const candidate of ITEMS) {
    const hit = candidate.aliases.find((alias) => {
      const latin = /^[a-z]+$/i.test(alias);
      if (latin) return new RegExp(`(^|[^a-z])${alias}([^a-z]|$)`, "i").test(text);
      return text.includes(alias);
    });
    if (hit) { item = candidate; break; }
  }
  if (!item) return { ok: false, reason: "item" };

  const tokens = text.split(/[^0-9a-z\u0900-\u097F]+/i).filter(Boolean);
  const numbers = [];
  for (const token of tokens) {
    if (/^\d+(\.\d+)?$/.test(token)) numbers.push(Number(token));
    else if (token in NUMBER_WORDS) numbers.push(NUMBER_WORDS[token]);
  }
  if (!numbers.length) return { ok: false, reason: "numbers" };

  const unitHit = UNITS.find((u) => u.test.some((t) => tokens.includes(t)));
  const qty = numbers.length > 1 ? numbers[0] : 1;
  const amount = numbers.length > 1 ? numbers[1] : numbers[0];

  if (!Number.isFinite(qty) || !Number.isFinite(amount) || qty <= 0 || amount <= 0) {
    return { ok: false, reason: "numbers" };
  }

  return {
    ok: true,
    sale: {
      item: item.key,
      qty: Math.round(qty * 100) / 100,
      amount: Math.round(amount * 100) / 100,
      unit: unitHit ? unitHit.label : "",
    },
  };
}

/* ---------------------------- store ---------------------------- */

const STORE_KEY = "voicekhata.v3";
const memory = { sales: [], settings: { lang: "hi", theme: "light", voiceConfirm: true, tips: true } };
let canStore = true;

function defaultSettings() {
  return { lang: "hi", theme: "light", voiceConfirm: true, tips: true };
}

function load() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  } catch {
    canStore = false;
  }
  const settings = { ...defaultSettings(), ...(stored && stored.settings ? stored.settings : {}) };
  const sales = Array.isArray(stored && stored.sales) ? stored.sales : [];
  return { sales, settings };
}

function save(state) {
  if (!canStore) return false;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return true;
  } catch {
    canStore = false;
    return false;
  }
}

const state = load();

/* ---------------------------- dom ---------------------------- */

const el = {
  html: document.documentElement,
  segmented: $(".segmented"),
  tabVoice: $("#tabVoice"),
  tabManual: $("#tabManual"),
  panelVoice: $("#panelVoice"),
  panelManual: $("#panelManual"),
  micStage: $(".mic-stage"),
  micBtn: $("#micBtn"),
  micLabel: $("#micLabel"),
  micHint: $("#micHint"),
  saleInput: $("#saleInput"),
  preview: $("#preview"),
  saveBtn: $("#saveBtn"),
  banner: $("#banner"),
  bannerTitle: $("#bannerTitle"),
  bannerSub: $("#bannerSub"),
  echoBtn: $("#echoBtn"),
  rows: $("#rows"),
  empty: $("#empty"),
  mTotal: $("#mTotal"),
  mEntries: $("#mEntries"),
  mAvg: $("#mAvg"),
  mShare: $("#mShare"),
  mItems: $("#mItems"),
  mMode: $("#mMode"),
  fAll: $("#fAll"),
  fVoice: $("#fVoice"),
  fManual: $("#fManual"),
  search: $("#searchInput"),
  undoBtn: $("#undoBtn"),
  exportBtn: $("#exportBtn"),
  catalog: $("#catalog"),
  tipsCard: $("#tipsCard"),
  engineChip: $("#engineChip"),
  engineText: $("#engineText"),
  speechPill: $("#speechPill"),
  langChip: $("#langChip"),
  statusLang: $("#statusLang"),
  themeBtn: $("#themeBtn"),
  themeIcon: $("#themeIcon"),
  clock: $("#clock"),
  todayLabel: $("#todayLabel"),
  todayTag: $("#todayTag"),
  vaultState: $("#vaultState"),
  sheet: $("#sheet"),
  scrim: $("#scrim"),
  toasts: $("#toasts"),
  toggleVoice: $("#toggleVoice"),
  toggleTips: $("#toggleTips"),
  toggleVoice2: $("#toggleVoice2"),
  toggleTips2: $("#toggleTips2"),
  langChoice: $("#langChoice"),
  themeChoice: $("#themeChoice"),
};

let filter = "all";
let query = "";
let openRow = null;

/* ---------------------------- speech ---------------------------- */

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechOk = Boolean(Recognition);
let recognition = null;
let listening = false;
let lastSaved = null;

function buildRecognition() {
  if (!Recognition) return null;
  const rec = new Recognition();
  rec.lang = LANGS[state.settings.lang].speech;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  rec.onstart = () => {
    listening = true;
    el.micStage.classList.add("is-recording");
    el.micBtn.setAttribute("aria-pressed", "true");
    el.micLabel.textContent = "Sun raha hoon… / Listening";
  };

  rec.onresult = (event) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      if (result.isFinal) final += result[0].transcript;
      else interim += result[0].transcript;
    }
    if (interim) el.micLabel.textContent = interim.trim();
    if (final.trim()) handleTranscript(final.trim());
  };

  rec.onerror = (event) => {
    listening = false;
    el.micStage.classList.remove("is-recording", "is-processing");
    el.micBtn.setAttribute("aria-pressed", "false");
    const messages = {
      "not-allowed": "Microphone permission needed. Allow it in the browser, ya Manual se likhein.",
      "service-not-allowed": "Microphone is blocked by the browser. Manual entry works fine.",
      "no-speech": "Kuch sunai nahi diya — phir se bolein ya Manual use karein.",
      "audio-capture": "No microphone found. Manual entry chalega.",
      network: "Speech service offline. Manual entry chalega.",
    };
    showBanner("error", "Voice input unavailable", messages[event.error] || "Phir se bolein ya Manual tab use karein.");
    el.micLabel.textContent = "Tap to speak · Mic dabayein";
  };

  rec.onend = () => {
    listening = false;
    el.micStage.classList.remove("is-recording");
    el.micBtn.setAttribute("aria-pressed", "false");
    if (el.micStage.classList.contains("is-processing")) {
      setTimeout(() => {
        el.micStage.classList.remove("is-processing");
        el.micLabel.textContent = "Tap to speak · Mic dabayein";
      }, 900);
    }
  };

  return rec;
}

function startListening() {
  if (!speechOk) {
    showBanner("error", "Voice needs Chrome or Edge", "Aapka browser speech support nahi karta — Manual tab se sale likh lein.");
    return;
  }
  if (listening) {
    recognition && recognition.stop();
    return;
  }
  if (!recognition) recognition = buildRecognition();
  recognition.lang = LANGS[state.settings.lang].speech;
  hideBanner();
  try {
    recognition.start();
  } catch {
    /* start() throws if called twice; the guard above handles the normal path */
  }
}

function handleTranscript(text) {
  el.micStage.classList.add("is-processing");
  el.micLabel.textContent = "Samajh raha hoon…";
  const parsed = parseSale(text);
  if (!parsed.ok) {
    showBanner("error", "Samajh nahi aaya", `“${text}” — item, quantity aur price saaf bolein.`);
    el.micLabel.textContent = "Tap to speak · Mic dabayein";
    return;
  }
  recordSale(parsed.sale, "voice", text);
  el.micLabel.textContent = "Tap to speak · Mic dabayein";
}

function speakTotal(sale, total) {
  if (!state.settings.voiceConfirm || !("speechSynthesis" in window)) return;
  try {
    const item = itemByKey(sale.item);
    const lang = LANGS[state.settings.lang];
    const utterance = new SpeechSynthesisUtterance(
      `${sale.qty} ${item.hi}, ${sale.amount} rupay, save ho gaya. Aaj ka total ${total} rupay.`
    );
    utterance.lang = lang.speech;
    utterance.rate = 0.98;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    /* TTS is a nicety; the sale is already saved. */
  }
}

/* ---------------------------- state mutations ---------------------------- */

function todaySales() {
  const today = localDate();
  return state.sales.filter((s) => s.date === today);
}

function recordSale(sale, source, raw) {
  const now = new Date();
  const entry = {
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())),
    ts: now.getTime(),
    date: localDate(now),
    time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }),
    item: sale.item,
    qty: sale.qty,
    amount: sale.amount,
    unit: sale.unit || "",
    source,
    lang: state.settings.lang,
    raw: raw || "",
  };
  state.sales.unshift(entry);
  lastSaved = entry;
  const stored = save(state);
  render();
  const total = todaySales().reduce((sum, s) => sum + s.amount, 0);
  const item = itemByKey(entry.item);
  showBanner(
    "success",
    `${entry.qty} ${entry.unit ? entry.unit + " " : ""}${item.en} · ${money(entry.amount)} saved`,
    `Aaj ka total ${money(total)} · ${todaySales().length} entries${stored ? "" : " · storage unavailable"}`
  );
  countUp(el.mTotal, total);
  el.echoBtn.hidden = false;
  speakTotal(entry, total);
  el.saleInput.value = "";
  renderPreview();
}

function showBanner(kind, title, sub) {
  el.banner.hidden = false;
  el.banner.classList.toggle("is-error", kind === "error");
  el.bannerTitle.textContent = title;
  el.bannerSub.textContent = sub || "";
  el.banner.querySelector(".banner__icon use").setAttribute("href", kind === "error" ? "#i-close" : "#i-check");
  el.echoBtn.hidden = kind === "error";
}

function hideBanner() {
  el.banner.hidden = true;
  el.banner.classList.remove("is-error");
}

/* ---------------------------- rendering ---------------------------- */

function animateNumber(node, to, prefix = "") {
  const from = Number(String(node.dataset.value || "0"));
  node.dataset.value = String(to);
  if (from === to) { node.textContent = prefix + Number(to).toLocaleString("en-IN"); return; }
  const start = performance.now();
  const duration = 520;
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = prefix + Math.round(from + (to - from) * eased).toLocaleString("en-IN");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function countUp(node, to) { animateNumber(node, to, "₹"); }

function renderSummary() {
  const rows = todaySales();
  const total = rows.reduce((sum, s) => sum + s.amount, 0);
  const avg = rows.length ? Math.round(total / rows.length) : 0;
  const voiceCount = rows.filter((s) => s.source === "voice").length;
  const manualCount = rows.length - voiceCount;
  const bills = new Set(rows.map((s) => s.id)).size;

  countUp(el.mTotal, total);
  animateNumber(el.mEntries, rows.length);
  countUp(el.mAvg, avg);

  el.mShare.textContent = rows.length ? `${bills} ${bills === 1 ? "bill" : "bills"} today` : "No sales yet";
  el.mItems.textContent = `${new Set(rows.map((s) => s.item)).size} items`;
  el.mMode.textContent = rows.length
    ? [voiceCount ? "Voice" : null, manualCount ? "Manual" : null].filter(Boolean).join(" + ")
    : "Voice + Manual";

  el.fAll.textContent = rows.length;
  el.fVoice.textContent = voiceCount;
  el.fManual.textContent = manualCount;
}

function rowHtml(sale, index) {
  const item = itemByKey(sale.item);
  const initials = (item.en.match(/[A-Za-z]/g) || ["?"]).slice(0, 2).join("").toUpperCase();
  const qty = Number(sale.qty);
  const rate = qty ? Math.round((sale.amount / qty) * 100) / 100 : sale.amount;
  const isVoice = sale.source === "voice";
  return `
    <li class="row" data-id="${escapeHtml(sale.id)}" role="button" tabindex="0"
        aria-expanded="false" style="animation-delay:${Math.min(index, 8) * 32}ms">
      <span class="row__time">${escapeHtml(sale.time)}</span>
      <span class="row__item">
        <span class="avatar" aria-hidden="true">${initials}</span>
        <span class="row__names">
          <span class="row__name">${escapeHtml(item.en)} / ${escapeHtml(item.hi)}</span>
          <span class="row__sub">${escapeHtml(item.mr)} · ${qty} × ${money(rate)}</span>
        </span>
      </span>
      <span class="row__qty"><b>${qty}${sale.unit ? " " + escapeHtml(sale.unit) : ""}</b> @ ${money(rate)}</span>
      <span class="source ${isVoice ? "" : "source--manual"}">
        ${isVoice ? "🎙 Voice" : "⌨ Manual"}
      </span>
      <span class="row__amount">${money(sale.amount)}</span>
      <span class="row__detail">
        <span><b>Heard:</b> ${escapeHtml(sale.raw || "—")}</span>
        <span><b>Language:</b> ${escapeHtml(LANGS[sale.lang] ? LANGS[sale.lang].label : sale.lang || "—")}</span>
        <span><b>Logged:</b> ${escapeHtml(sale.date)} ${escapeHtml(sale.time)}</span>
      </span>
    </li>`;
}

function visibleSales() {
  let rows = todaySales();
  if (filter !== "all") rows = rows.filter((s) => s.source === filter);
  if (query) {
    const q = query.toLowerCase();
    rows = rows.filter((s) => {
      const item = itemByKey(s.item);
      return (
        item.en.toLowerCase().includes(q) ||
        item.hi.includes(q) ||
        item.mr.includes(q) ||
        String(s.amount).includes(q) ||
        String(s.qty).includes(q) ||
        (s.raw || "").toLowerCase().includes(q)
      );
    });
  }
  return rows;
}

function renderRows() {
  const rows = visibleSales();
  const total = todaySales().length;
  el.rows.innerHTML = rows.map(rowHtml).join("");
  el.rows.querySelectorAll(".row").forEach((node) => {
    const toggle = () => {
      if (openRow && openRow !== node) {
        openRow.classList.remove("is-open");
        openRow.setAttribute("aria-expanded", "false");
      }
      const open = node.classList.toggle("is-open");
      node.setAttribute("aria-expanded", String(open));
      openRow = open ? node : null;
    };
    node.addEventListener("click", toggle);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    });
  });
  el.empty.hidden = total !== 0;
  if (rows.length === 0 && total > 0) {
    el.empty.hidden = false;
    $(".empty__title", el.empty).textContent = "Koi match nahi mila";
    $(".empty__sub", el.empty).textContent = "Search ya filter badal kar dekhein.";
  } else {
    $(".empty__title", el.empty).textContent = "No sales yet";
    $(".empty__sub", el.empty).textContent = "Bolo ya type karo — pehli bikri yahan dikhegi.";
  }
  el.undoBtn.disabled = state.sales.length === 0;
  el.exportBtn.disabled = state.sales.length === 0;
}

function renderCatalog() {
  el.catalog.innerHTML = ITEMS.map(
    (item) => `<button class="catalog__item" type="button" data-item="${item.key}">${item.hi} <span>${item.en}</span></button>`
  ).join("");
  el.catalog.querySelectorAll(".catalog__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = itemByKey(btn.dataset.item);
      switchMode("manual");
      el.saleInput.value = `2 ${item.hi} 50`;
      el.saleInput.focus();
      el.saleInput.setSelectionRange(el.saleInput.value.length, el.saleInput.value.length);
      renderPreview();
    });
  });
}

function renderPreview() {
  const value = el.saleInput.value.trim();
  if (!value) { el.preview.innerHTML = ""; return; }
  const parsed = parseSale(value);
  if (parsed.ok) {
    const item = itemByKey(parsed.sale.item);
    el.preview.innerHTML = `
      <span class="preview__chip">✓ ${parsed.sale.qty}${parsed.sale.unit ? " " + parsed.sale.unit : ""} ${item.en}
      · ${money(parsed.sale.amount)}</span>
      <span>ready to save</span>`;
  } else {
    el.preview.innerHTML = `<span class="preview__chip is-bad">Samajh nahi aaya — item, qty aur price likhein</span>`;
  }
}

function render() {
  renderSummary();
  renderRows();
}

/* ---------------------------- theme & language ---------------------------- */

function applyTheme(theme) {
  state.settings.theme = theme;
  el.html.dataset.theme = theme;
  el.themeIcon.setAttribute("href", theme === "dark" ? "#i-sun" : "#i-moon");
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#0a1220" : "#16735b");
  $$("#themeChoice button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.themeOpt === theme)));
  save(state);
}

function applyLanguage(lang) {
  state.settings.lang = lang;
  const copy = LANGS[lang];
  el.html.lang = lang;
  el.langChip.textContent = copy.label;
  el.statusLang.textContent = copy.label;
  el.saveBtn.innerHTML = `<svg class="ic"><use href="#i-check"/></svg> ${copy.save}`;
  el.tabVoice.querySelector("span").textContent = copy.voice;
  el.tabManual.querySelector("span").textContent = copy.manual;
  $$("#langChoice button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.lang === lang)));
  if (recognition) recognition.lang = copy.speech;
  save(state);
}

function setToggle(which, on) {
  state.settings[which] = on;
  const a = which === "voiceConfirm" ? el.toggleVoice : el.toggleTips;
  const b = which === "voiceConfirm" ? el.toggleVoice2 : el.toggleTips2;
  a.setAttribute("aria-checked", String(on));
  b.setAttribute("aria-checked", String(on));
  if (which === "tips") el.tipsCard.hidden = !on;
  save(state);
}

/* ---------------------------- modes ---------------------------- */

function switchMode(mode) {
  const manual = mode === "manual";
  el.segmented.classList.toggle("is-manual", manual);
  el.tabVoice.classList.toggle("is-active", !manual);
  el.tabManual.classList.toggle("is-active", manual);
  el.tabVoice.setAttribute("aria-selected", String(!manual));
  el.tabManual.setAttribute("aria-selected", String(manual));
  el.panelVoice.classList.toggle("is-active", !manual);
  el.panelManual.classList.toggle("is-active", manual);
  if (manual) el.saleInput.focus({ preventScroll: true });
}

/* ---------------------------- sheet ---------------------------- */

let lastFocus = null;

function openSheet() {
  lastFocus = document.activeElement;
  el.scrim.hidden = false;
  el.sheet.hidden = false;
  $("#menuBtn").setAttribute("aria-expanded", "true");
  $("#sheetClose").focus();
}

function closeSheet() {
  el.scrim.hidden = true;
  el.sheet.hidden = true;
  $("#menuBtn").setAttribute("aria-expanded", "false");
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/* ---------------------------- toasts ---------------------------- */

function toast(message, kind = "ok") {
  const node = document.createElement("div");
  node.className = "toast" + (kind === "error" ? " toast--error" : "");
  node.innerHTML = `<svg class="ic"><use href="#${kind === "error" ? "i-close" : "i-check"}"/></svg><span>${escapeHtml(message)}</span>`;
  el.toasts.appendChild(node);
  setTimeout(() => {
    node.classList.add("is-out");
    setTimeout(() => node.remove(), 260);
  }, 2600);
}

/* ---------------------------- csv ---------------------------- */

function toCsv(rows) {
  const head = ["id", "date", "time", "item", "item_hindi", "qty", "unit", "amount", "source", "language", "raw_text"];
  const body = rows.map((s) => {
    const item = itemByKey(s.item);
    return [
      s.id, s.date, s.time, item.en, item.hi, s.qty, s.unit || "",
      s.amount, s.source, s.lang || "", s.raw || "",
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(",");
  });
  return "\uFEFF" + [head.join(","), ...body].join("\r\n");
}

function download(name, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/* ---------------------------- wiring ---------------------------- */

function init() {
  applyTheme(state.settings.theme);
  applyLanguage(state.settings.lang);
  setToggle("voiceConfirm", state.settings.voiceConfirm !== false);
  setToggle("tips", state.settings.tips !== false);
  renderCatalog();
  render();

  if (!speechOk) {
    el.engineChip.classList.add("is-warn");
    el.engineText.textContent = "Manual mode";
    el.speechPill.className = "pill pill--ok";
    el.speechPill.innerHTML = "Typing only";
    el.micBtn.setAttribute("aria-disabled", "true");
    el.micLabel.textContent = "Voice not supported here";
    el.micHint.innerHTML = "Use the <b>Manual</b> tab — everything else works.";
    el.micBtn.addEventListener("click", () => {
      showBanner("error", "Voice needs Chrome or Edge", "Is browser mein speech nahi hai — Manual tab se likh lein.");
      switchMode("manual");
    });
    $("#inlineMic").addEventListener("click", () => switchMode("manual"));
  } else {
    el.engineText.textContent = "Voice ready";
    el.micBtn.addEventListener("click", startListening);
    $("#inlineMic").addEventListener("click", startListening);
  }

  if (!canStore) el.vaultState.textContent = "Storage blocked — entries last only for this tab";

  el.tabVoice.addEventListener("click", () => switchMode("voice"));
  el.tabManual.addEventListener("click", () => switchMode("manual"));
  el.tabVoice.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { switchMode("manual"); el.tabManual.focus(); }
  });
  el.tabManual.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { switchMode("voice"); el.tabVoice.focus(); }
  });

  el.saleInput.addEventListener("input", renderPreview);

  el.panelManual.addEventListener("submit", (event) => {
    event.preventDefault();
    const raw = el.saleInput.value.trim();
    if (!raw) {
      showBanner("error", "Pehle sale details likho", "Example: 2 kilo chawal 50 rupay");
      el.saleInput.focus();
      return;
    }
    const parsed = parseSale(raw);
    if (!parsed.ok) {
      showBanner("error", "Samajh nahi aaya", "Item, quantity aur price saaf likhein — jaise “1 doodh 60”.");
      el.saleInput.focus();
      return;
    }
    recordSale(parsed.sale, "manual", raw);
  });

  el.echoBtn.addEventListener("click", () => {
    if (!lastSaved) return;
    const total = todaySales().reduce((sum, s) => sum + s.amount, 0);
    const wasOn = state.settings.voiceConfirm;
    state.settings.voiceConfirm = true;
    speakTotal(lastSaved, total);
    state.settings.voiceConfirm = wasOn;
    toast("Reading the last entry aloud");
  });

  $$(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      $$(".filter").forEach((b) => b.classList.toggle("is-active", b === btn));
      renderRows();
    });
  });

  el.search.addEventListener("input", (event) => {
    query = event.target.value.trim();
    renderRows();
  });

  el.undoBtn.addEventListener("click", () => {
    if (!state.sales.length) return;
    const removed = state.sales.shift();
    save(state);
    render();
    hideBanner();
    const item = itemByKey(removed.item);
    toast(`Undone: ${removed.qty} ${item.en} · ${money(removed.amount)}`);
  });

  el.exportBtn.addEventListener("click", () => {
    const rows = todaySales();
    if (!rows.length) return;
    download(`voicekhata-${localDate()}.csv`, toCsv(rows));
    toast(`Exported ${rows.length} entries`);
  });

  $("#sheetExport").addEventListener("click", () => {
    if (!state.sales.length) { toast("Nothing to export yet", "error"); return; }
    download(`voicekhata-all-${localDate()}.csv`, toCsv(state.sales));
    toast(`Exported ${state.sales.length} entries`);
  });

  $("#clearBtn").addEventListener("click", () => {
    if (!state.sales.length) { toast("Ledger is already empty", "error"); return; }
    if (!window.confirm("Clear every saved entry on this device? Export a CSV first if you need a copy.")) return;
    state.sales = [];
    lastSaved = null;
    save(state);
    render();
    hideBanner();
    toast("All entries cleared");
  });

  el.themeBtn.addEventListener("click", () => {
    applyTheme(state.settings.theme === "dark" ? "light" : "dark");
  });

  $$("#themeChoice button").forEach((btn) => {
    btn.addEventListener("click", () => applyTheme(btn.dataset.themeOpt));
  });

  $$("#langChoice button").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.dataset.lang);
      toast(`Language: ${LANGS[btn.dataset.lang].label}`);
    });
  });

  el.toggleVoice.addEventListener("click", () => setToggle("voiceConfirm", !state.settings.voiceConfirm));
  el.toggleVoice2.addEventListener("click", () => setToggle("voiceConfirm", !state.settings.voiceConfirm));
  el.toggleTips.addEventListener("click", () => setToggle("tips", !state.settings.tips));
  el.toggleTips2.addEventListener("click", () => setToggle("tips", !state.settings.tips));

  $("#menuBtn").addEventListener("click", openSheet);
  $("#settingsBtn").addEventListener("click", openSheet);
  $("#sheetClose").addEventListener("click", closeSheet);
  el.scrim.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.sheet.hidden) { closeSheet(); return; }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (event.code === "Space" && !typing && el.sheet.hidden) {
      event.preventDefault();
      startListening();
    }
  });

  const tick = () => {
    const now = new Date();
    el.clock.textContent = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    el.todayLabel.textContent = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    el.todayTag.textContent = now.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };
  tick();
  setInterval(tick, 20000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
}

init();

/* Exposed for manual verification in the browser console. */
window.VoiceKhata = { parseSale, state, render };
