/* =========================================================
   VoiceKhata — counter app
   Vanilla ES module. No build step, no CDN dependencies.
   ========================================================= */

/* ---------------------------- items ---------------------------- */

const ITEMS = [
  { key: "rice",    en: "Rice",    hi: "चावल",    mr: "तांदूळ",  aliases: ["chawal", "rice", "चावल", "तांदूळ"] },
  { key: "atta",    en: "Atta",    hi: "आटा",     mr: "पीठ",     aliases: ["atta", "wheat", "flour", "आटा", "पीठ"] },
  { key: "milk",    en: "Milk",    hi: "दूध",     mr: "दूध",     aliases: ["doodh", "milk", "दूध"] },
  { key: "sugar",   en: "Sugar",   hi: "चीनी",    mr: "साखर",    aliases: ["cheeni", "sugar", "चीनी", "साखर"] },
  { key: "salt",    en: "Salt",    hi: "नमक",     mr: "मीठ",     aliases: ["namak", "salt", "नमक", "मीठ"] },
  { key: "oil",     en: "Oil",     hi: "तेल",     mr: "तेल",     aliases: ["tel", "oil", "तेल"] },
  { key: "dal",     en: "Dal",     hi: "दाल",     mr: "डाळ",     aliases: ["dal", "daal", "lentils", "दाल", "डाळ"] },
  { key: "tea",     en: "Tea",     hi: "चाय",     mr: "चहा",     aliases: ["chai", "tea", "चाय", "चहा"] },
  { key: "biscuit", en: "Biscuit", hi: "बिस्कुट", mr: "बिस्कीट", aliases: ["biscuit", "बिस्कुट", "बिस्कीट"] },
  { key: "haldi",   en: "Haldi",   hi: "हल्दी",   mr: "हळद",     aliases: ["haldi", "turmeric", "हल्दी", "हळद"] },
  { key: "soap",    en: "Soap",    hi: "साबुन",   mr: "साबण",    aliases: ["sabun", "soap", "साबुन", "साबण"] },
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
  hi: { label: "हिंदी", speech: "hi-IN" },
  en: { label: "English", speech: "en-IN" },
  mr: { label: "मराठी", speech: "mr-IN" },
};

const I18N = {
  hi: {
    skip: "सीधे बिक्री पर जाएं",
    counter: "काउंटर 1",
    engineReady: "आवाज़ तैयार",
    engineManual: "टाइपिंग मोड",
    ledgerSaved: "खाता इस डिवाइस में सुरक्षित",
    storageBlocked: "स्टोरेज बंद है — एंट्री इस टैब तक रहेगी",
    voice: "बोलो",
    manual: "लिखो",
    entryTitle: "तेज़ काउंटर एंट्री",
    entryTag: "हिंदी / हिंग्लिश",
    entrySub: "बोलकर तुरंत पर्ची बनाएं या कीबोर्ड से लिखें",
    micIdle: "बोलने के लिए दबाएं",
    micListening: "सुन रहा हूँ…",
    micProcessing: "समझ रहा हूँ…",
    micUnsupported: "यहाँ आवाज़ उपलब्ध नहीं",
    micUnsupportedHint: "लिखो टैब इस्तेमाल करें",
    saleLabel: "बिक्री की जानकारी",
    salePlaceholder: "2 किलो चावल 50 रुपये",
    saleHelp: "उदाहरण: 2 किलो चावल 50 रुपये · १ आटा ४० · देवनागरी अंक भी चलेंगे",
    save: "बिक्री सेव करें",
    echo: "दोहराएं",
    ledgerTitle: "आज का खाता",
    ledgerSub: "काउंटर पर दर्ज हुई ताज़ा बिक्री",
    exportCsv: "CSV निकालें",
    metricCash: "आज की नकदी",
    metricEntries: "कुल एंट्री",
    metricAvg: "औसत बिल",
    filterAll: "सभी",
    filterVoice: "आवाज़",
    filterManual: "टाइप",
    searchPh: "सामान या रकम खोजें",
    searchLabel: "एंट्री खोजें",
    entryMode: "एंट्री का तरीका",
    filterGroup: "एंट्री फ़िल्टर करें",
    micStart: "आवाज़ रिकॉर्डिंग शुरू करें",
    thTime: "समय",
    thItem: "सामान",
    thQty: "मात्रा व दाम",
    thSource: "तरीका",
    thAmount: "रकम",
    sourceVoice: "आवाज़",
    sourceManual: "टाइप",
    detailHeard: "सुना गया",
    detailLang: "भाषा",
    detailLogged: "दर्ज",
    emptyTitle: "अभी कोई बिक्री नहीं",
    emptySub: "बोलें या लिखें — पहली बिक्री यहाँ दिखेगी।",
    emptyNoMatch: "कोई एंट्री नहीं मिली",
    emptyNoMatchSub: "खोज या फ़िल्टर बदलकर देखें।",
    undo: "आखिरी एंट्री हटाएं",
    autosave: "इस डिवाइस में अपने आप सेव",
    sideSettings: "काउंटर और आवाज़",
    sideSettingsSub: "दुकानदार की पसंद",
    toggleVoice: "आवाज़ में पुष्टि",
    toggleVoiceSub: "सेव के बाद कुल रकम बोलें",
    toggleTips: "त्वरित सुझाव",
    toggleTipsSub: "सुझाव कार्ड दिखाएं",
    themeLabel: "डार्क थीम",
    themeSub: "पूरा काला, सफेद अक्षर",
    langLabel: "भाषा",
    systemLabel: "सिस्टम",
    statusEngine: "आवाज़ इंजन",
    statusActive: "सक्रिय",
    statusStorage: "खाता भंडारण",
    statusStorageVal: "इस डिवाइस में",
    dataLabel: "डेटा",
    exportAll: "सारी एंट्री निकालें",
    clearAll: "सारी एंट्री मिटाएं",
    profileTitle: "प्रोफ़ाइल",
    profileSub: "दुकान खाते की जानकारी",
    profilePhone: "फोन",
    profileCity: "शहर",
    profileEdit: "जानकारी बदलें",
    profileEmpty: "जानकारी जोड़ें",
    formName: "आपका नाम",
    formNamePh: "रमेश गुप्ता",
    formShop: "दुकान का नाम",
    formShopPh: "गुप्ता किराना स्टोर",
    formPhone: "फोन नंबर",
    formPhonePh: "98765 43210",
    formCity: "शहर",
    formCityPh: "जयपुर",
    cancel: "रद्द करें",
    saveProfile: "जानकारी सेव करें",
    catalogTitle: "किराना सूची",
    catalogSub: "सामान दबाकर एंट्री भरें",
    tipsTitle: "बोलने के सुझाव",
    tipsSub: "ग्राहक जल्दी निपटाएं",
    tip1: "रकम हमेशा बोलें: “चावल 50 रुपये”।",
    tip2: "देवनागरी अंक २, ५० अपने आप समझ आते हैं।",
    tip3: "हिंदी, मराठी और अंग्रेज़ी तीनों चलते हैं।",
    hotkey: "रिकॉर्डिंग शुरू / बंद करने के लिए",
    footer: "VoiceKhata किराना सूट",
    footerSite: "वेबसाइट",
    footerLocal: "ऑफ़लाइन तैयार",
    defaultShop: "आपका काउंटर",
    bannerTotal: "आज का कुल",
    bannerEntries: "एंट्री",
    errEmpty: "पहले बिक्री की जानकारी लिखें",
    errEmptySub: "उदाहरण: 2 किलो चावल 50 रुपये",
    errParse: "समझ नहीं आया",
    errParseSub: "सामान, मात्रा और रकम साफ़ लिखें — जैसे “1 दूध 60”।",
    errVoice: "आवाज़ उपलब्ध नहीं",
    errVoiceSub: "फिर बोलें या लिखो टैब इस्तेमाल करें।",
    errPerm: "माइक्रोफ़ोन की अनुमति चाहिए",
    errPermSub: "ब्राउज़र में अनुमति दें, या लिखो टैब से बिक्री लिखें।",
    errNoSpeech: "कुछ सुनाई नहीं दिया",
    errNoSpeechSub: "फिर से बोलें या लिखो टैब इस्तेमाल करें।",
    errSupport: "यहाँ आवाज़ काम नहीं करती",
    errSupportSub: "Chrome या Edge खोलें — या लिखो टैब से लिखें।",
    previewReady: "सेव के लिए तैयार",
    previewBad: "समझ नहीं आया — सामान, मात्रा और रकम लिखें",
    footBills: "बिल",
    footNoSales: "अभी कोई बिक्री नहीं",
    footItems: "सामान",
    footBoth: "आवाज़ + टाइप",
    toastUndone: "हटाया गया",
    toastExported: "एंट्री निकाली गईं",
    toastCleared: "सारी एंट्री मिट गईं",
    toastNothing: "निकालने के लिए कुछ नहीं",
    toastLang: "भाषा",
    toastSavedProfile: "प्रोफ़ाइल सेव हो गई",
    confirmClear: "इस डिवाइस की सारी एंट्री मिटाएं? पहले CSV निकाल लें।",
    langName: "हिंदी",
  },

  en: {
    skip: "Skip to sale entry",
    counter: "Counter 1",
    engineReady: "Voice ready",
    engineManual: "Typing mode",
    ledgerSaved: "Ledger saved on this device",
    storageBlocked: "Storage blocked — entries last for this tab only",
    voice: "Speak",
    manual: "Type",
    entryTitle: "Fast Counter Entry",
    entryTag: "Hindi / Hinglish",
    entrySub: "Speak to make a receipt instantly, or type it in",
    micIdle: "Tap to speak",
    micListening: "Listening…",
    micProcessing: "Understanding…",
    micUnsupported: "Voice unavailable here",
    micUnsupportedHint: "Use the Type tab instead",
    saleLabel: "Sale details",
    salePlaceholder: "2 kilo chawal 50 rupay",
    saleHelp: "Example: 2 kilo chawal 50 rupay · १ atta ४० · Devanagari digits work",
    save: "Save sale",
    echo: "Echo",
    ledgerTitle: "Today's Record",
    ledgerSub: "Live transactions recorded at the counter",
    exportCsv: "Export CSV",
    metricCash: "Today cash",
    metricEntries: "Entries",
    metricAvg: "Average bill",
    filterAll: "All",
    filterVoice: "Voice",
    filterManual: "Manual",
    searchPh: "Search item or amount",
    searchLabel: "Search entries",
    entryMode: "Entry mode",
    filterGroup: "Filter entries",
    micStart: "Start voice recording",
    thTime: "Time",
    thItem: "Item",
    thQty: "Qty & rate",
    thSource: "Source",
    thAmount: "Amount",
    sourceVoice: "Voice",
    sourceManual: "Manual",
    detailHeard: "Heard",
    detailLang: "Language",
    detailLogged: "Logged",
    emptyTitle: "No sales yet",
    emptySub: "Speak or type — the first sale appears here.",
    emptyNoMatch: "No matching entries",
    emptyNoMatchSub: "Try another search or filter.",
    undo: "Undo last entry",
    autosave: "Auto-saved on this device",
    sideSettings: "Counter & Voice",
    sideSettingsSub: "Shopkeeper preferences",
    toggleVoice: "Voice confirmation",
    toggleVoiceSub: "Speak the total after saving",
    toggleTips: "Quick tips",
    toggleTipsSub: "Show the coaching card",
    themeLabel: "Dark theme",
    themeSub: "Pure black, white text",
    langLabel: "Language",
    systemLabel: "System",
    statusEngine: "Speech engine",
    statusActive: "Active",
    statusStorage: "Ledger storage",
    statusStorageVal: "This device",
    dataLabel: "Data",
    exportAll: "Export all entries",
    clearAll: "Clear all entries",
    profileTitle: "Profile",
    profileSub: "Shop account details",
    profilePhone: "Phone",
    profileCity: "City",
    profileEdit: "Edit details",
    profileEmpty: "Add details",
    formName: "Your name",
    formNamePh: "Ramesh Gupta",
    formShop: "Shop name",
    formShopPh: "Gupta General Store",
    formPhone: "Phone",
    formPhonePh: "98765 43210",
    formCity: "City",
    formCityPh: "Jaipur",
    cancel: "Cancel",
    saveProfile: "Save details",
    catalogTitle: "Kirana Catalog",
    catalogSub: "Tap an item to fill the entry",
    tipsTitle: "Counter speech tips",
    tipsSub: "Speed up customer checkout",
    tip1: "Always say the amount: “Chawal 50 rupay”.",
    tip2: "Devanagari digits २, ५० work automatically.",
    tip3: "Hindi, Marathi and English all parse.",
    hotkey: "to start / stop recording",
    footer: "VoiceKhata Kirana Suite",
    footerSite: "Website",
    footerLocal: "Offline ready",
    defaultShop: "Your counter",
    bannerTotal: "Today's total",
    bannerEntries: "entries",
    errEmpty: "Enter sale details first",
    errEmptySub: "Example: 2 kilo chawal 50 rupay",
    errParse: "Couldn't understand that",
    errParseSub: "Write item, quantity and amount clearly — e.g. “1 doodh 60”.",
    errVoice: "Voice input unavailable",
    errVoiceSub: "Try again or use the Type tab.",
    errPerm: "Microphone permission needed",
    errPermSub: "Allow it in the browser, or type the sale in the Type tab.",
    errNoSpeech: "Nothing was heard",
    errNoSpeechSub: "Speak again or use the Type tab.",
    errSupport: "Voice doesn't work in this browser",
    errSupportSub: "Open Chrome or Edge — or type in the Type tab.",
    previewReady: "ready to save",
    previewBad: "Not understood — add item, quantity and amount",
    footBills: "bills",
    footNoSales: "No sales yet",
    footItems: "items",
    footBoth: "Voice + Manual",
    toastUndone: "Undone",
    toastExported: "entries exported",
    toastCleared: "All entries cleared",
    toastNothing: "Nothing to export yet",
    toastLang: "Language",
    toastSavedProfile: "Profile saved",
    confirmClear: "Clear every saved entry on this device? Export a CSV first if you need a copy.",
    langName: "English",
  },

  mr: {
    skip: "थेट विक्री नोंदीवर जा",
    counter: "काउंटर 1",
    engineReady: "आवाज तयार",
    engineManual: "टाइपिंग मोड",
    ledgerSaved: "खाते या डिव्हाइसवर सुरक्षित",
    storageBlocked: "स्टोरेज बंद — नोंदी या टॅबपुरती",
    voice: "बोला",
    manual: "टाइप करा",
    entryTitle: "वेगवान काउंटर नोंद",
    entryTag: "हिंदी / हिंग्लिश",
    entrySub: "बोलून लगेच पावती बनवा किंवा कीबोर्डने लिहा",
    micIdle: "बोलण्यासाठी दाबा",
    micListening: "ऐकत आहे…",
    micProcessing: "समजून घेत आहे…",
    micUnsupported: "इथे आवाज उपलब्ध नाही",
    micUnsupportedHint: "टाइप करा टॅब वापरा",
    saleLabel: "विक्रीचा तपशील",
    salePlaceholder: "2 किलो तांदूळ 50 रुपये",
    saleHelp: "उदाहरण: 2 किलो तांदूळ 50 रुपये · १ पीठ ४० · देवनागरी अंक चालतात",
    save: "विक्री जतन करा",
    echo: "पुन्हा ऐका",
    ledgerTitle: "आजचे खाते",
    ledgerSub: "काउंटरवर नोंदवलेली ताजी विक्री",
    exportCsv: "CSV काढा",
    metricCash: "आजची रोख",
    metricEntries: "एकूण नोंदी",
    metricAvg: "सरासरी बिल",
    filterAll: "सर्व",
    filterVoice: "आवाज",
    filterManual: "टाइप",
    searchPh: "वस्तू किंवा रक्कम शोधा",
    searchLabel: "नोंदी शोधा",
    entryMode: "नोंदीची पद्धत",
    filterGroup: "नोंदी फिल्टर करा",
    micStart: "आवाज रेकॉर्डिंग सुरू करा",
    thTime: "वेळ",
    thItem: "वस्तू",
    thQty: "प्रमाण व दर",
    thSource: "पद्धत",
    thAmount: "रक्कम",
    sourceVoice: "आवाज",
    sourceManual: "टाइप",
    detailHeard: "ऐकले",
    detailLang: "भाषा",
    detailLogged: "नोंद",
    emptyTitle: "अजून विक्री नाही",
    emptySub: "बोला किंवा लिहा — पहिली विक्री इथे दिसेल.",
    emptyNoMatch: "जुळणारी नोंद नाही",
    emptyNoMatchSub: "शोध किंवा फिल्टर बदलून पहा.",
    undo: "शेवटची नोंद काढा",
    autosave: "या डिव्हाइसवर आपोआप जतन",
    sideSettings: "काउंटर आणि आवाज",
    sideSettingsSub: "दुकानदाराच्या पसंती",
    toggleVoice: "आवाजात पुष्टी",
    toggleVoiceSub: "जतन केल्यावर एकूण रक्कम बोला",
    toggleTips: "झटपट सूचना",
    toggleTipsSub: "सूचना कार्ड दाखवा",
    themeLabel: "डार्क थीम",
    themeSub: "पूर्ण काळा, पांढरा मजकूर",
    langLabel: "भाषा",
    systemLabel: "सिस्टम",
    statusEngine: "आवाज इंजिन",
    statusActive: "सक्रिय",
    statusStorage: "खाते साठवण",
    statusStorageVal: "या डिव्हाइसवर",
    dataLabel: "डेटा",
    exportAll: "सर्व नोंदी काढा",
    clearAll: "सर्व नोंदी पुसा",
    profileTitle: "प्रोफाइल",
    profileSub: "दुकान खात्याची माहिती",
    profilePhone: "फोन",
    profileCity: "शहर",
    profileEdit: "माहिती बदला",
    profileEmpty: "माहिती जोडा",
    formName: "तुमचे नाव",
    formNamePh: "रमेश गुप्ता",
    formShop: "दुकानाचे नाव",
    formShopPh: "गुप्ता किराणा स्टोअर",
    formPhone: "फोन नंबर",
    formPhonePh: "98765 43210",
    formCity: "शहर",
    formCityPh: "पुणे",
    cancel: "रद्द करा",
    saveProfile: "माहिती जतन करा",
    catalogTitle: "किराणा यादी",
    catalogSub: "वस्तू दाबून नोंद भरा",
    tipsTitle: "बोलण्याच्या सूचना",
    tipsSub: "ग्राहक लवकर निपटवा",
    tip1: "रक्कम नेहमी बोला: “तांदूळ 50 रुपये”.",
    tip2: "देवनागरी अंक २, ५० आपोआप समजतात.",
    tip3: "हिंदी, मराठी आणि इंग्रजी तिन्ही चालतात.",
    hotkey: "रेकॉर्डिंग सुरू / बंद करण्यासाठी",
    footer: "VoiceKhata किराणा सूट",
    footerSite: "वेबसाइट",
    footerLocal: "ऑफलाइन तयार",
    defaultShop: "तुमचा काउंटर",
    bannerTotal: "आजची एकूण",
    bannerEntries: "नोंदी",
    errEmpty: "आधी विक्रीचा तपशील लिहा",
    errEmptySub: "उदाहरण: 2 किलो तांदूळ 50 रुपये",
    errParse: "समजले नाही",
    errParseSub: "वस्तू, प्रमाण आणि रक्कम स्पष्ट लिहा — जसे “1 दूध 60”.",
    errVoice: "आवाज उपलब्ध नाही",
    errVoiceSub: "पुन्हा बोला किंवा टाइप करा टॅब वापरा.",
    errPerm: "मायक्रोफोनची परवानगी हवी",
    errPermSub: "ब्राउझरमध्ये परवानगी द्या, किंवा टाइप करा टॅब वापरा.",
    errNoSpeech: "काहीच ऐकले नाही",
    errNoSpeechSub: "पुन्हा बोला किंवा टाइप करा टॅब वापरा.",
    errSupport: "इथे आवाज चालत नाही",
    errSupportSub: "Chrome किंवा Edge उघडा — किंवा टाइप करा टॅब वापरा.",
    previewReady: "जतन करण्यास तयार",
    previewBad: "समजले नाही — वस्तू, प्रमाण आणि रक्कम लिहा",
    footBills: "बिले",
    footNoSales: "अजून विक्री नाही",
    footItems: "वस्तू",
    footBoth: "आवाज + टाइप",
    toastUndone: "काढले",
    toastExported: "नोंदी काढल्या",
    toastCleared: "सर्व नोंदी पुसल्या",
    toastNothing: "काढण्यासाठी काही नाही",
    toastLang: "भाषा",
    toastSavedProfile: "प्रोफाइल जतन झाले",
    confirmClear: "या डिव्हाइसवरील सर्व नोंदी पुसायच्या? आधी CSV काढा.",
    langName: "मराठी",
  },
};

const t = (key) => {
  const dict = I18N[state.settings.lang] || I18N.en;
  return dict[key] != null ? dict[key] : I18N.en[key] || key;
};

/* ---------------------------- helpers ---------------------------- */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function localDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const normalizeDigits = (text) => text.replace(/[०-९]/g, (d) => DEVA_DIGITS[d] || d);
const itemByKey = (key) => ITEMS.find((i) => i.key === key) || ITEMS[0];
const itemName = (item) => item[state.settings.lang] || item.en;

/* ---------------------------- parser ---------------------------- */

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
      if (/^[a-z]+$/i.test(alias)) {
        return new RegExp(`(^|[^a-z])${alias}([^a-z]|$)`, "i").test(text);
      }
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

  const unitHit = UNITS.find((u) => u.test.some((tok) => tokens.includes(tok)));
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

const STORE_KEY = "voicekhata.v4";
const LEGACY_KEYS = ["voicekhata.v3"];
const memory = { sales: [], settings: { lang: "hi", theme: "light", voiceConfirm: true, tips: true }, profile: {} };
let canStore = true;

const defaultSettings = () => ({ lang: "hi", theme: "light", voiceConfirm: true, tips: true });
const emptyProfile = () => ({ name: "", shop: "", phone: "", city: "" });

function load() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!stored) {
      for (const key of LEGACY_KEYS) {
        const legacy = JSON.parse(localStorage.getItem(key) || "null");
        if (legacy && Array.isArray(legacy.sales)) { stored = legacy; break; }
      }
    }
  } catch {
    canStore = false;
  }
  const settings = { ...defaultSettings(), ...(stored && stored.settings ? stored.settings : {}) };
  if (!LANGS[settings.lang]) settings.lang = "hi";
  if (!["light", "dark"].includes(settings.theme)) settings.theme = "light";
  return {
    sales: Array.isArray(stored && stored.sales) ? stored.sales : [],
    settings,
    profile: { ...emptyProfile(), ...(stored && stored.profile ? stored.profile : {}) },
  };
}

function persist() {
  if (!canStore) return false;
  try {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ version: 4, sales: state.sales, settings: state.settings, profile: state.profile })
    );
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
  micStage: $("#micStage"),
  micBtn: $("#micBtn"),
  micLabel: $("#micLabel"),
  saleInput: $("#saleInput"),
  preview: $("#preview"),
  banner: $("#banner"),
  bannerTitle: $("#bannerTitle"),
  bannerSub: $("#bannerSub"),
  echoBtn: $("#echoBtn"),
  rows: $("#rows"),
  empty: $("#empty"),
  emptyTitle: $("#emptyTitle"),
  emptySub: $("#emptySub"),
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
  exportAllBtn: $("#exportAllBtn"),
  clearBtn: $("#clearBtn"),
  catalog: $("#catalog"),
  tipsCard: $("#tipsCard"),
  engineChip: $("#engineChip"),
  engineText: $("#engineText"),
  speechPill: $("#speechPill"),
  langChip: $("#langChip"),
  clock: $("#clock"),
  todayLabel: $("#todayLabel"),
  todayTag: $("#todayTag"),
  shopTitle: $("#shopTitle"),
  vaultState: $("#vaultState"),
  themeSwitch: $("#themeSwitch"),
  toggleVoice: $("#toggleVoice"),
  toggleTips: $("#toggleTips"),
  langChoice: $("#langChoice"),
  profileAvatar: $("#profileAvatar"),
  profileName: $("#profileName"),
  profileMeta: $("#profileMeta"),
  profilePhone: $("#profilePhone"),
  profileCity: $("#profileCity"),
  profileModal: $("#profileModal"),
  profileScrim: $("#profileScrim"),
  toasts: $("#toasts"),
};

let filter = "all";
let query = "";
let openRow = null;
let lastSaved = null;

/* ---------------------------- speech ---------------------------- */

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const speechOk = Boolean(Recognition);
let recognition = null;
let listening = false;

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
    el.micLabel.textContent = t("micListening");
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
    const map = {
      "not-allowed": ["errPerm", "errPermSub"],
      "service-not-allowed": ["errPerm", "errPermSub"],
      "no-speech": ["errNoSpeech", "errNoSpeechSub"],
      "audio-capture": ["errNoSpeech", "errNoSpeechSub"],
      network: ["errVoice", "errVoiceSub"],
    };
    const [title, sub] = map[event.error] || ["errVoice", "errVoiceSub"];
    showBanner("error", t(title), t(sub));
    el.micLabel.textContent = t("micIdle");
  };

  rec.onend = () => {
    listening = false;
    el.micStage.classList.remove("is-recording");
    el.micBtn.setAttribute("aria-pressed", "false");
    if (el.micStage.classList.contains("is-processing")) {
      setTimeout(() => {
        el.micStage.classList.remove("is-processing");
        el.micLabel.textContent = t("micIdle");
      }, 900);
    }
  };

  return rec;
}

function startListening() {
  if (!speechOk) {
    showBanner("error", t("errSupport"), t("errSupportSub"));
    switchMode("manual");
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
    /* start() throws when already running; the listening guard covers it */
  }
}

function handleTranscript(text) {
  el.micStage.classList.add("is-processing");
  el.micLabel.textContent = t("micProcessing");
  const parsed = parseSale(text);
  if (!parsed.ok) {
    showBanner("error", t("errParse"), `“${text}” — ${t("errParseSub")}`);
    el.micLabel.textContent = t("micIdle");
    return;
  }
  recordSale(parsed.sale, "voice", text);
  el.micLabel.textContent = t("micIdle");
}

function speakTotal(sale, total) {
  if (!state.settings.voiceConfirm || !("speechSynthesis" in window)) return;
  try {
    const utterance = new SpeechSynthesisUtterance(
      `${sale.qty} ${itemName(itemByKey(sale.item))}, ${sale.amount} rupay, save ho gaya. ${t("bannerTotal")} ${total} rupay.`
    );
    utterance.lang = LANGS[state.settings.lang].speech;
    utterance.rate = 0.98;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } catch {
    /* TTS is optional; the sale is already stored. */
  }
}

/* ---------------------------- data ---------------------------- */

const todaySales = () => state.sales.filter((s) => s.date === localDate());
const todayTotal = () => todaySales().reduce((sum, s) => sum + s.amount, 0);

function recordSale(sale, source, raw) {
  const now = new Date();
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
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
  const stored = persist();
  render();
  const total = todayTotal();
  showBanner(
    "success",
    `${entry.qty} ${entry.unit ? entry.unit + " " : ""}${itemName(itemByKey(entry.item))} · ${money(entry.amount)}`,
    `${t("bannerTotal")} ${money(total)} · ${todaySales().length} ${t("bannerEntries")}${stored ? "" : " · offline"}`
  );
  countUp(el.mTotal, total);
  el.echoBtn.hidden = false;
  speakTotal(entry, total);
  el.saleInput.value = "";
  renderPreview();
}

/* ---------------------------- ui helpers ---------------------------- */

function showBanner(kind, title, sub) {
  el.banner.hidden = false;
  el.banner.classList.toggle("is-error", kind === "error");
  el.bannerTitle.textContent = title;
  el.bannerSub.textContent = sub || "";
  $(".banner__icon use", el.banner).setAttribute("href", kind === "error" ? "#i-close" : "#i-check");
  el.echoBtn.hidden = kind === "error";
}

function hideBanner() {
  el.banner.hidden = true;
  el.banner.classList.remove("is-error");
}

function animateNumber(node, to, prefix = "") {
  const from = Number(node.dataset.value || "0");
  node.dataset.value = String(to);
  if (from === to) { node.textContent = prefix + Number(to).toLocaleString("en-IN"); return; }
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / 520);
    const eased = 1 - Math.pow(1 - p, 3);
    node.textContent = prefix + Math.round(from + (to - from) * eased).toLocaleString("en-IN");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const countUp = (node, to) => animateNumber(node, to, "₹");

function toast(message, kind = "ok") {
  const node = document.createElement("div");
  node.className = "toast" + (kind === "error" ? " toast--error" : "");
  node.innerHTML = `<svg class="ic"><use href="#${kind === "error" ? "i-close" : "i-check"}"/></svg><span>${escapeHtml(message)}</span>`;
  el.toasts.appendChild(node);
  setTimeout(() => {
    node.classList.add("is-out");
    setTimeout(() => node.remove(), 280);
  }, 2600);
}

/* ---------------------------- rendering ---------------------------- */

function renderSummary() {
  const rows = todaySales();
  const total = rows.reduce((sum, s) => sum + s.amount, 0);
  const avg = rows.length ? Math.round(total / rows.length) : 0;
  const voiceCount = rows.filter((s) => s.source === "voice").length;
  const manualCount = rows.length - voiceCount;

  countUp(el.mTotal, total);
  animateNumber(el.mEntries, rows.length);
  countUp(el.mAvg, avg);

  el.mShare.textContent = rows.length
    ? `${rows.length} ${t("footBills")}`
    : t("footNoSales");
  el.mItems.textContent = `${new Set(rows.map((s) => s.item)).size} ${t("footItems")}`;
  el.mMode.textContent = rows.length
    ? [voiceCount ? t("sourceVoice") : null, manualCount ? t("sourceManual") : null].filter(Boolean).join(" + ")
    : t("footBoth");

  el.fAll.textContent = rows.length;
  el.fVoice.textContent = voiceCount;
  el.fManual.textContent = manualCount;
}

function rowHtml(sale, index) {
  const item = itemByKey(sale.item);
  const primary = itemName(item);
  const secondary = state.settings.lang === "en" ? item.hi : item.en;
  const initials = (item.en.match(/[A-Za-z]/g) || ["?"]).slice(0, 2).join("").toUpperCase();
  const qty = Number(sale.qty);
  const rate = qty ? Math.round((sale.amount / qty) * 100) / 100 : sale.amount;
  const isVoice = sale.source === "voice";

  return `
    <li class="row" data-id="${escapeHtml(sale.id)}" role="button" tabindex="0"
        aria-expanded="false" style="animation-delay:${Math.min(index, 8) * 34}ms">
      <span class="row__time">${escapeHtml(sale.time)}</span>
      <span class="row__item">
        <span class="avatar" aria-hidden="true">${initials}</span>
        <span class="row__names">
          <span class="row__name">${escapeHtml(primary)}</span>
          <span class="row__sub">${escapeHtml(secondary)} · ${qty} × ${money(rate)}</span>
        </span>
      </span>
      <span class="row__qty"><b>${qty}${sale.unit ? " " + escapeHtml(sale.unit) : ""}</b> @ ${money(rate)}</span>
      <span class="source ${isVoice ? "" : "source--manual"}">
        ${isVoice ? "🎙" : "⌨"} ${isVoice ? t("sourceVoice") : t("sourceManual")}
      </span>
      <span class="row__amount">${money(sale.amount)}</span>
      <span class="row__detail">
        <span><b>${t("detailHeard")}:</b> ${escapeHtml(sale.raw || "—")}</span>
        <span><b>${t("detailLang")}:</b> ${escapeHtml(LANGS[sale.lang] ? LANGS[sale.lang].label : "—")}</span>
        <span><b>${t("detailLogged")}:</b> ${escapeHtml(sale.date)} ${escapeHtml(sale.time)}</span>
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

function bindRows() {
  $$(".row", el.rows).forEach((node) => {
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
}

function renderRows() {
  const rows = visibleSales();
  const total = todaySales().length;
  el.rows.innerHTML = rows.map(rowHtml).join("");
  bindRows();

  const filteredOut = rows.length === 0;
  el.empty.hidden = !filteredOut && total !== 0;
  if (filteredOut && total > 0) {
    el.emptyTitle.textContent = t("emptyNoMatch");
    el.emptySub.textContent = t("emptyNoMatchSub");
  } else {
    el.emptyTitle.textContent = t("emptyTitle");
    el.emptySub.textContent = t("emptySub");
  }
  el.empty.hidden = !(rows.length === 0);

  el.undoBtn.disabled = state.sales.length === 0;
  el.exportBtn.disabled = state.sales.length === 0;
  el.exportAllBtn.disabled = state.sales.length === 0;
  el.clearBtn.disabled = state.sales.length === 0;
}

function renderCatalog() {
  el.catalog.innerHTML = ITEMS.map((item) => {
    const name = itemName(item);
    const other = state.settings.lang === "en" ? item.hi : item.en;
    return `<button class="catalog__item" type="button" data-item="${item.key}">${name} <small>${other}</small></button>`;
  }).join("");

  $$(".catalog__item", el.catalog).forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = itemByKey(btn.dataset.item);
      switchMode("manual");
      el.saleInput.value = `2 ${itemName(item)} 50`;
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
      <span class="preview__chip">✓ ${parsed.sale.qty}${parsed.sale.unit ? " " + parsed.sale.unit : ""} ${escapeHtml(itemName(item))}
      · ${money(parsed.sale.amount)}</span>
      <span>${t("previewReady")}</span>`;
  } else {
    el.preview.innerHTML = `<span class="preview__chip is-bad">${t("previewBad")}</span>`;
  }
}

function renderProfile() {
  const profile = state.profile;
  const name = profile.name || t("profileEmpty");
  const shop = profile.shop || t("defaultShop");
  el.profileName.textContent = name;
  el.profileMeta.textContent = shop;
  el.profilePhone.textContent = profile.phone || "—";
  el.profileCity.textContent = profile.city || "—";
  el.profileAvatar.textContent = (profile.shop || profile.name || "VK")
    .split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "VK";
  el.shopTitle.textContent = shop;
  document.title = `${shop} · VoiceKhata`;
}

function render() {
  renderSummary();
  renderRows();
  renderProfile();
}

/* ---------------------------- theme & language ---------------------------- */

function applyTheme(theme, animate = true) {
  state.settings.theme = theme;
  el.html.dataset.theme = theme;
  el.themeSwitch.setAttribute("aria-checked", String(theme === "dark"));
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme === "dark" ? "#000000" : "#16735B");
  if (animate) {
    el.html.classList.add("theme-fade");
    setTimeout(() => el.html.classList.remove("theme-fade"), 450);
  }
  persist();
}

function applyStaticText() {
  $$("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  $$("[data-i18n-ph]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPh));
  });
  $$("[data-i18n-label]").forEach((node) => {
    node.setAttribute("aria-label", t(node.dataset.i18nLabel));
  });
}

function applyLanguage(lang, notify = false) {
  state.settings.lang = lang;
  const copy = LANGS[lang];
  el.html.lang = lang;
  el.langChip.textContent = copy.label;

  $$("#langChoice button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.lang === lang)));
  applyStaticText();
  updateClock();

  if (!speechOk) {
    el.engineText.textContent = t("engineManual");
    el.engineChip.classList.add("is-warn");
    el.micLabel.textContent = t("micUnsupported");
  } else {
    el.engineText.textContent = t("engineReady");
    el.engineChip.classList.remove("is-warn");
    if (!el.micStage.classList.contains("is-recording") && !el.micStage.classList.contains("is-processing")) {
      el.micLabel.textContent = t("micIdle");
    }
  }

  if (recognition) recognition.lang = copy.speech;
  persist();
  render();
  renderCatalog();
  renderPreview();
  if (notify) toast(`${t("toastLang")}: ${copy.label}`);
}

function setToggle(which, on) {
  state.settings[which] = on;
  const node = which === "voiceConfirm" ? el.toggleVoice : el.toggleTips;
  node.setAttribute("aria-checked", String(on));
  if (which === "tips") el.tipsCard.hidden = !on;
  persist();
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

/* ---------------------------- profile modal ---------------------------- */

let lastFocus = null;

function openProfile() {
  lastFocus = document.activeElement;
  const p = state.profile;
  $("#fName").value = p.name || "";
  $("#fShop").value = p.shop || "";
  $("#fPhone").value = p.phone || "";
  $("#fCity").value = p.city || "";
  el.profileScrim.hidden = false;
  el.profileModal.hidden = false;
  $("#fName").focus();
}

function closeProfile() {
  el.profileScrim.hidden = true;
  el.profileModal.hidden = true;
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/* ---------------------------- csv ---------------------------- */

function toCsv(rows) {
  const head = ["id", "date", "time", "item", "item_local", "qty", "unit", "amount", "source", "language", "raw_text"];
  const body = rows.map((s) => {
    const item = itemByKey(s.item);
    return [
      s.id, s.date, s.time, item.en, itemName(item), s.qty, s.unit || "",
      s.amount, s.source, s.lang || "", s.raw || "",
    ].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",");
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

/* ---------------------------- init ---------------------------- */

function updateClock() {
  const now = new Date();
  const locale = { hi: "hi-IN", en: "en-IN", mr: "mr-IN" }[state.settings.lang] || "en-IN";
  el.clock.textContent = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
  el.todayLabel.textContent = now.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
  el.todayTag.textContent = now.toLocaleDateString(locale, { day: "numeric", month: "short" });
}

function init() {
  applyTheme(state.settings.theme, false);
  applyLanguage(state.settings.lang);
  setToggle("voiceConfirm", state.settings.voiceConfirm !== false);
  setToggle("tips", state.settings.tips !== false);
  renderCatalog();
  render();

  if (!canStore) el.vaultState.textContent = t("storageBlocked");

  if (!speechOk) {
    el.micBtn.setAttribute("aria-disabled", "true");
    el.micLabel.textContent = t("micUnsupported");
    el.micBtn.addEventListener("click", () => {
      showBanner("error", t("errSupport"), t("errSupportSub"));
      switchMode("manual");
    });
  } else {
    el.micBtn.addEventListener("click", startListening);
    $("#inlineMic").addEventListener("click", startListening);
  }

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
      showBanner("error", t("errEmpty"), t("errEmptySub"));
      el.saleInput.focus();
      return;
    }
    const parsed = parseSale(raw);
    if (!parsed.ok) {
      showBanner("error", t("errParse"), t("errParseSub"));
      el.saleInput.focus();
      return;
    }
    recordSale(parsed.sale, "manual", raw);
  });

  el.echoBtn.addEventListener("click", () => {
    if (!lastSaved) return;
    const wasOn = state.settings.voiceConfirm;
    state.settings.voiceConfirm = true;
    speakTotal(lastSaved, todayTotal());
    state.settings.voiceConfirm = wasOn;
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
    persist();
    render();
    hideBanner();
    toast(`${t("toastUndone")}: ${removed.qty} ${itemName(itemByKey(removed.item))} · ${money(removed.amount)}`);
  });

  el.exportBtn.addEventListener("click", () => {
    const rows = todaySales();
    if (!rows.length) return;
    download(`voicekhata-${localDate()}.csv`, toCsv(rows));
    toast(`${rows.length} ${t("toastExported")}`);
  });

  el.exportAllBtn.addEventListener("click", () => {
    if (!state.sales.length) { toast(t("toastNothing"), "error"); return; }
    download(`voicekhata-all-${localDate()}.csv`, toCsv(state.sales));
    toast(`${state.sales.length} ${t("toastExported")}`);
  });

  el.clearBtn.addEventListener("click", () => {
    if (!state.sales.length) { toast(t("toastNothing"), "error"); return; }
    if (!window.confirm(t("confirmClear"))) return;
    state.sales = [];
    lastSaved = null;
    persist();
    render();
    hideBanner();
    toast(t("toastCleared"));
  });

  el.themeSwitch.addEventListener("click", () => {
    applyTheme(state.settings.theme === "dark" ? "light" : "dark");
  });

  $$("#langChoice button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (state.settings.lang === btn.dataset.lang) return;
      applyLanguage(btn.dataset.lang, true);
    });
  });

  el.toggleVoice.addEventListener("click", () => setToggle("voiceConfirm", !state.settings.voiceConfirm));
  el.toggleTips.addEventListener("click", () => setToggle("tips", !state.settings.tips));

  $("#editProfileBtn").addEventListener("click", openProfile);
  $("#profileClose").addEventListener("click", closeProfile);
  $("#profileCancel").addEventListener("click", closeProfile);
  el.profileScrim.addEventListener("click", closeProfile);

  $("#profileForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      name: $("#fName").value.trim(),
      shop: $("#fShop").value.trim(),
      phone: $("#fPhone").value.trim(),
      city: $("#fCity").value.trim(),
    };
    persist();
    renderProfile();
    closeProfile();
    toast(t("toastSavedProfile"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !el.profileModal.hidden) { closeProfile(); return; }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if (event.code === "Space" && !typing && el.profileModal.hidden) {
      event.preventDefault();
      startListening();
    }
  });

  updateClock();
  setInterval(updateClock, 20000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
}

init();

/* Exposed for manual verification in the browser console. */
window.VoiceKhata = { parseSale, state, render, applyLanguage, applyTheme };
