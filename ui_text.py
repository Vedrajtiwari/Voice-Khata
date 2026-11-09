"""Small bilingual/trilingual copy dictionary for the VoiceKhata interface."""


LANGUAGES = {
    "hi": {"label": "हिंदी", "name": "Hindi", "gnani": "hi-IN"},
    "en": {"label": "English", "name": "English", "gnani": "en-IN"},
    "mr": {"label": "मराठी", "name": "Marathi", "gnani": "mr-IN"},
}


TEXT = {
    "en": {
        "home": "Counter", "ledger": "Daily ledger", "insights": "Insights", "customers": "Customers", "settings": "Settings",
        "tagline": "Fast, voice-first sales recording for your counter.", "voice": "Speak", "type": "Type",
        "speak_title": "Tap the microphone and say one sale", "type_title": "Enter a sale", "save": "Save sale",
        "sale_details": "Sale details", "customer": "Customer (optional)", "today": "Today", "entries": "Entries",
        "total_sales": "Total sales", "item_types": "Items sold", "recent_sales": "Recent sales", "undo": "Undo last sale",
        "download": "Download CSV", "api_configured": "Gnani key configured", "api_missing": "Gnani key not set",
        "tips": "Say: 2 kilo chawal 50 rupay", "empty": "No sales yet. Add your first sale above.",
        "details": "Details", "source": "Source", "language": "Language", "voice_reply": "Voice confirmation",
        "dark_theme": "Dark theme", "quick_tips": "Show quick tips", "database": "Database", "add_customer": "Add customer",
        "customer_name": "Customer name", "phone": "Phone (optional)", "note": "Note (optional)", "create": "Create customer",
        "weekly": "Last 7 days", "top_items": "Top items", "db_ready": "SQLite database ready",
        "invalid": "Could not understand that sale. Include item, quantity, and amount.",
        "saved": "Sale saved", "no_input": "Enter sale details first.", "voice_unavailable": "Voice service is unavailable. You can still type the sale.",
    },
    "hi": {
        "home": "काउंटर", "ledger": "आज का खाता", "insights": "रिपोर्ट", "customers": "ग्राहक", "settings": "सेटिंग्स",
        "tagline": "आपके काउंटर के लिए तेज़, आवाज़ से बिक्री रिकॉर्डिंग।", "voice": "बोलो", "type": "लिखो",
        "speak_title": "माइक दबाएं और एक बिक्री बोलें", "type_title": "बिक्री दर्ज करें", "save": "बिक्री सेव करें",
        "sale_details": "बिक्री की जानकारी", "customer": "ग्राहक (वैकल्पिक)", "today": "आज", "entries": "एंट्री",
        "total_sales": "कुल बिक्री", "item_types": "सामान", "recent_sales": "हाल की बिक्री", "undo": "आखिरी बिक्री हटाएं",
        "download": "CSV डाउनलोड करें", "api_configured": "Gnani key configured", "api_missing": "Gnani API key नहीं है",
        "tips": "बोलें: 2 किलो चावल 50 रुपये", "empty": "अभी तक कोई बिक्री नहीं। ऊपर से अपनी पहली बिक्री दर्ज करें।",
        "details": "विवरण", "source": "तरीका", "language": "भाषा", "voice_reply": "आवाज़ में पुष्टि",
        "dark_theme": "डार्क थीम", "quick_tips": "त्वरित सुझाव दिखाएं", "database": "डेटाबेस", "add_customer": "ग्राहक जोड़ें",
        "customer_name": "ग्राहक का नाम", "phone": "फोन (वैकल्पिक)", "note": "नोट (वैकल्पिक)", "create": "ग्राहक बनाएं",
        "weekly": "पिछले 7 दिन", "top_items": "सबसे ज़्यादा बिके सामान", "db_ready": "SQLite डेटाबेस तैयार है",
        "invalid": "बिक्री समझ नहीं आई। सामान, मात्रा और रकम बोलें या लिखें।",
        "saved": "बिक्री सेव हो गई", "no_input": "पहले बिक्री की जानकारी लिखें।", "voice_unavailable": "Voice service उपलब्ध नहीं है। आप बिक्री लिखकर दर्ज कर सकते हैं।",
    },
    "mr": {
        "home": "काउंटर", "ledger": "आजचा खाते", "insights": "अहवाल", "customers": "ग्राहक", "settings": "सेटिंग्ज",
        "tagline": "तुमच्या काउंटरसाठी जलद, आवाजावर आधारित विक्री नोंदणी।", "voice": "बोला", "type": "टाइप करा",
        "speak_title": "माइक दाबा आणि एक विक्री बोला", "type_title": "विक्री नोंदवा", "save": "विक्री जतन करा",
        "sale_details": "विक्री तपशील", "customer": "ग्राहक (ऐच्छिक)", "today": "आज", "entries": "नोंदी",
        "total_sales": "एकूण विक्री", "item_types": "वस्तू", "recent_sales": "अलीकडील विक्री", "undo": "शेवटची विक्री मागे घ्या",
        "download": "CSV डाउनलोड करा", "api_configured": "Gnani key configured", "api_missing": "Gnani API key सेट नाही",
        "tips": "बोला: 2 किलो तांदूळ 50 रुपये", "empty": "अजून विक्री नाही. वरून पहिली विक्री नोंदवा।",
        "details": "तपशील", "source": "पद्धत", "language": "भाषा", "voice_reply": "आवाजातील पुष्टी",
        "dark_theme": "डार्क थीम", "quick_tips": "जलद सूचना दाखवा", "database": "डेटाबेस", "add_customer": "ग्राहक जोडा",
        "customer_name": "ग्राहकाचे नाव", "phone": "फोन (ऐच्छिक)", "note": "नोंद (ऐच्छिक)", "create": "ग्राहक तयार करा",
        "weekly": "मागील 7 दिवस", "top_items": "सर्वाधिक विकलेल्या वस्तू", "db_ready": "SQLite डेटाबेस तयार आहे",
        "invalid": "विक्री समजली नाही. वस्तू, प्रमाण आणि रक्कम बोला किंवा टाइप करा।",
        "saved": "विक्री जतन झाली", "no_input": "आधी विक्रीचा तपशील लिहा।", "voice_unavailable": "Voice service उपलब्ध नाही. तुम्ही विक्री टाइप करून नोंदवू शकता।",
    },
}


def t(key, language):
    """Return translated UI text, falling back to English."""
    return TEXT.get(language, TEXT["en"]).get(key, TEXT["en"].get(key, key))
