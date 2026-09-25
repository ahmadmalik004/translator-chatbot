const inputText = document.getElementById("inputText");

const outputText = document.getElementById("outputText");

const translateButton =
    document.getElementById("translateButton");

const clearButton =
    document.getElementById("clearButton");

const copyButton =
    document.getElementById("copyButton");

const characterCount =
    document.getElementById("characterCount");

const statusMessage =
    document.getElementById("statusMessage");

const buttonText =
    document.getElementById("buttonText");

const loadingSpinner =
    document.getElementById("loadingSpinner");

const examples =
    document.querySelectorAll(".example");


/* =========================
   ROMAN URDU → URDU
========================= */

const romanUrduDictionary = {

    "main": "میں",
    "mein": "میں",
    "me": "میں",

    "mujhe": "مجھے",
    "mujhy": "مجھے",

    "tum": "تم",
    "tumhe": "تمہیں",
    "tumhain": "تمہیں",
    "tumhen": "تمہیں",

    "aap": "آپ",
    "ap": "آپ",

    "hum": "ہم",
    "ham": "ہم",

    "woh": "وہ",
    "wo": "وہ",

    "yeh": "یہ",
    "ye": "یہ",

    "kaise": "کیسے",
    "kese": "کیسے",

    "hain": "ہیں",
    "han": "ہیں",
    "hai": "ہے",
    "hy": "ہے",

    "ho": "ہو",

    "tha": "تھا",
    "thi": "تھی",
    "the": "تھے",

    "kar": "کر",
    "karo": "کرو",
    "karna": "کرنا",
    "karta": "کرتا",
    "karte": "کرتے",
    "karti": "کرتی",

    "baat": "بات",
    "bat": "بات",

    "karni": "کرنی",

    "mujhe": "مجھے",

    "tumse": "تم سے",
    "apse": "آپ سے",

    "pyar": "پیار",
    "pyaar": "پیار",

    "mohabbat": "محبت",

    "acha": "اچھا",
    "achha": "اچھا",

    "achi": "اچھی",
    "achhi": "اچھی",

    "theek": "ٹھیک",
    "thik": "ٹھیک",

    "bohat": "بہت",
    "bahut": "بہت",

    "zyada": "زیادہ",
    "zyaada": "زیادہ",

    "kam": "کم",

    "kyun": "کیوں",
    "kion": "کیوں",

    "kya": "کیا",

    "kab": "کب",

    "kahan": "کہاں",
    "kaha": "کہا",

    "kaun": "کون",

    "kis": "کس",
    "kisi": "کسی",

    "mera": "میرا",
    "meri": "میری",
    "mere": "میرے",

    "tera": "تیرا",
    "teri": "تیری",
    "tere": "تیرے",

    "apna": "اپنا",
    "apni": "اپنی",
    "apne": "اپنے",

    "ghar": "گھر",

    "jana": "جانا",
    "jaana": "جانا",

    "jana": "جانا",

    "ja": "جا",

    "raha": "رہا",
    "rahi": "رہی",
    "rahe": "رہے",

    "kal": "کل",

    "aaj": "آج",

    "ab": "اب",

    "phir": "پھر",

    "yahan": "یہاں",

    "wahan": "وہاں",

    "dost": "دوست",

    "dosti": "دوستی",

    "khana": "کھانا",

    "pani": "پانی",

    "chai": "چائے",

    "kaam": "کام",

    "school": "اسکول",

    "college": "کالج",

    "university": "یونیورسٹی",

    "laptop": "لیپ ٹاپ",

    "mobile": "موبائل",

    "phone": "فون",

    "message": "میسج",

    "call": "کال",

    "milna": "ملنا",

    "mil": "مل",

    "aunga": "آؤں گا",
    "aongi": "آؤں گی",

    "ao": "آؤ",

    "aao": "آؤ",

    "jao": "جاؤ",

    "please": "براہ کرم",

    "shukriya": "شکریہ",

    "thanks": "شکریہ",

    "thank": "شکریہ",

    "sorry": "معذرت",

    "maaf": "معاف",

    "khuda": "خدا",

    "allah": "اللہ",

    "inshaAllah": "ان شاء اللہ",

    "inshallah": "ان شاء اللہ",

    "good": "اچھا",

    "morning": "صبح",

    "raat": "رات",

    "din": "دن",

    "subah": "صبح",

    "shaam": "شام",

    "mujh": "مجھ",

    "se": "سے",

    "ko": "کو",

    "ka": "کا",

    "ki": "کی",

    "ke": "کے",

    "aur": "اور",

    "or": "اور",

    "lekin": "لیکن",

    "magar": "مگر",

    "agar": "اگر",

    "to": "تو",

    "bhi": "بھی",

    "nahi": "نہیں",

    "nahin": "نہیں",

    "mat": "مت",

    "sab": "سب",

    "kuch": "کچھ",

    "koi": "کوئی",

    "har": "ہر",

    "ek": "ایک",

    "aik": "ایک",

    "do": "دو",

    "teen": "تین",

    "chaar": "چار",

    "paanch": "پانچ"

};


/* =========================
   CONVERT ROMAN URDU
========================= */

function convertRomanUrdu(text) {

    const words = text.split(/(\s+)/);

    return words.map(word => {

        const cleanWord =
            word
                .toLowerCase()
                .replace(/[.,!?;:]+$/g, "");

        if (romanUrduDictionary[cleanWord]) {

            const punctuation =
                word.slice(cleanWord.length);

            return (
                romanUrduDictionary[cleanWord] +
                punctuation
            );
        }

        return word;

    }).join("");
}


/* =========================
   CHECK URDU
========================= */

function containsUrdu(text) {

    return /[\u0600-\u06FF]/.test(text);
}


/* =========================
   TRANSLATE
========================= */

async function translateText() {

    const originalText =
        inputText.value.trim();


    if (!originalText) {

        showStatus(
            "Please enter some Roman Urdu or Urdu first.",
            "error"
        );

        return;
    }


    setLoading(true);


    outputText.textContent =
        "Translating...";

    outputText.classList.remove("placeholder");


    showStatus(
        "",
        ""
    );


    try {

        /*
         * If the user writes Roman Urdu,
         * convert common words into Urdu first.
         */

        let textToTranslate =
            originalText;


        if (!containsUrdu(originalText)) {

            textToTranslate =
                convertRomanUrdu(originalText);

        }


        /*
         * MyMemory translation API
         *
         * Urdu → English
         */

        const url =
            "https://api.mymemory.translated.net/get" +
            "?q=" +
            encodeURIComponent(textToTranslate) +
            "&langpair=ur|en";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Translation service is unavailable."
            );

        }


        const data =
            await response.json();


        if (
            !data.responseData ||
            !data.responseData.translatedText
        ) {

            throw new Error(
                "No translation was returned."
            );

        }


        const translation =
            data.responseData.translatedText;


        outputText.textContent =
            translation;


        showStatus(
            "Translation completed.",
            "success"
        );

    }

    catch (error) {

        console.error(error);


        outputText.textContent =
            "Sorry, the translation service could not translate this text right now.";


        showStatus(
            "Please try again in a moment.",
            "error"
        );

    }

    finally {

        setLoading(false);

    }

}


/* =========================
   LOADING
========================= */

function setLoading(isLoading) {

    translateButton.disabled =
        isLoading;


    if (isLoading) {

        buttonText.textContent =
            "Translating";

        loadingSpinner.classList.remove(
            "hidden"
        );

    } else {

        buttonText.textContent =
            "Translate";

        loadingSpinner.classList.add(
            "hidden"
        );

    }

}


/* =========================
   STATUS
========================= */

function showStatus(message, type) {

    statusMessage.textContent =
        message;


    statusMessage.className =
        "status";


    if (type) {

        statusMessage.classList.add(
            type
        );

    }

}


/* =========================
   CHARACTER COUNT
========================= */

inputText.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            `${inputText.value.length} / 5000`;

    }
);


/* =========================
   TRANSLATE BUTTON
========================= */

translateButton.addEventListener(
    "click",
    translateText
);


/* =========================
   ENTER KEY
========================= */

inputText.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            translateText();

        }

    }
);


/* =========================
   CLEAR
========================= */

clearButton.addEventListener(
    "click",
    () => {

        inputText.value = "";

        outputText.textContent =
            "Your English translation will appear here.";

        outputText.classList.add(
            "placeholder"
        );

        characterCount.textContent =
            "0 / 5000";

        showStatus(
            "",
            ""
        );

        inputText.focus();

    }
);


/* =========================
   COPY
========================= */

copyButton.addEventListener(
    "click",
    async () => {

        const text =
            outputText.textContent.trim();


        if (
            !text ||
            text ===
            "Your English translation will appear here."
        ) {

            showStatus(
                "There is no translation to copy.",
                "error"
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );


            showStatus(
                "Translation copied.",
                "success"
            );

        }

        catch {

            showStatus(
                "Could not copy the translation.",
                "error"
            );

        }

    }
);


/* =========================
   EXAMPLE BUTTONS
========================= */

examples.forEach(
    example => {

        example.addEventListener(
            "click",
            () => {

                const text =
                    example.dataset.text;


                inputText.value =
                    text;


                characterCount.textContent =
                    `${text.length} / 5000`;


                inputText.focus();

            }
        );

    }
);