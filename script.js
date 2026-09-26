/*
===========================================================
URDU TRANSLATE
Roman Urdu / Urdu -> Natural English
AI ENGINE: Google Gemini 3.5 Flash-Lite
===========================================================
*/


/* =========================================================
   ELEMENTS
========================================================= */

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

const translationInfo =
    document.getElementById("translationInfo");

const translationInfoText =
    document.getElementById("translationInfoText");

const examples =
    document.querySelectorAll(".example");


/* =========================================================
   GEMINI CONFIGURATION
========================================================= */

/*
    IMPORTANT:

    Paste your Google Gemini API key here.

    Example:

    const GEMINI_API_KEY = "AIzaSyxxxxxxxxxxxxxxxx";

    DO NOT share this key publicly.

    This is Option A, so the key is placed directly
    in the browser JavaScript for testing.
*/

const GEMINI_API_KEY =
    "PASTE_YOUR_GEMINI_API_KEY_HERE";


/*
    Fast Gemini model.

    Google currently lists Gemini 3.5 Flash-Lite
    as a fast, low-cost model.
*/

const GEMINI_MODEL =
    "gemini-3.5-flash-lite";


/*
    Gemini REST API endpoint.
*/

const GEMINI_ENDPOINT =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;


/* =========================================================
   TRANSLATOR INSTRUCTIONS
========================================================= */

const SYSTEM_INSTRUCTION = `
You are an expert Pakistani Roman Urdu and Urdu to English translator.

Your ONLY job is translation.

Translate the user's complete message into natural, fluent English.

The user may write:

- Roman Urdu
- Urdu script
- Pakistani Urdu
- informal Roman Urdu
- WhatsApp-style Roman Urdu
- texting language
- slang
- shortened words
- spelling mistakes
- mixed Urdu and English
- casual conversation
- formal conversation

IMPORTANT:

Roman Urdu has no single standard spelling.

Understand different spellings of the same Urdu word.

Examples:

mujhe
mujhy
muje
mujy
mujhay

main
mein
mai
mn

tum
tm

tumse
tmse
tum sy
tm sy

kya
kia
kiya

kyun
kyu
q

nahi
nahin
nai
ni

hai
hy

hain
hen
han

raha
rha

rahi
rhi

rahe
rhe

karna
krna

karta
krta

karti
krti

bohat
bahut
bht

acha
achha

theek
thik
tk

kaise
kese
kaisay

aap
ap

aur
or

ke
k

ko
ku

se
sy

samajh
smjh

chahte
chahty

ja raha
ja rha

aa raha
aa rha

DO NOT translate Roman Urdu word-by-word.

First understand the COMPLETE sentence.

Then translate its intended meaning.

Use context.

Examples:

Input:
mujhe tumse baat karni hai

Output:
I need to talk to you.

Input:
mujhy tum se baat krni hy

Output:
I need to talk to you.

Input:
mujy smjh ni aa rhi k tm kya kehna chahty ho

Output:
I don't understand what you're trying to say.

Input:
mujhy samajh nahi aa rahi ke tum kya kehna chahte ho

Output:
I don't understand what you're trying to say.

Input:
kal agar tum free ho to hum bahar ja sakte hain

Output:
If you're free tomorrow, we can go out.

Input:
main ne usko bola tha ke mujhe ye pasand nahi hai

Output:
I told him/her that I don't like this.

Input:
tum kahan ja rhy ho

Output:
Where are you going?

Input:
mujhe kal subah jaldi uthna hai

Output:
I have to wake up early tomorrow morning.

Input:
yaar mujhe bohat tension ho rahi hai

Output:
Man, I'm really stressed out.

Input:
aap kaise hain?

Output:
How are you?

Input:
آپ کیسے ہیں؟ مجھے امید ہے آپ ٹھیک ہوں گے۔

Output:
How are you? I hope you're doing well.

RULES:

1. Translate naturally.

2. Do NOT translate word-by-word when that would sound unnatural.

3. Preserve the original meaning.

4. Preserve the emotional tone.

5. Preserve names.

6. Preserve numbers.

7. Preserve emojis.

8. Preserve URLs.

9. Preserve paragraph breaks when useful.

10. Casual Roman Urdu should produce natural casual English.

11. Formal Urdu should produce natural formal English.

12. If the input is already English, return natural English.

13. If Urdu and English are mixed, translate the Urdu portion naturally while keeping appropriate English terms.

14. Do not invent information.

15. Do not explain the translation.

16. Do not analyze the sentence.

17. Do not say "Translation:".

18. Do not put the answer inside quotation marks.

19. Return ONLY the final English translation.

20. Keep the translation concise unless the original message is long.

Your response must contain ONLY the English translation.
`;


/* =========================================================
   INPUT DETECTION
========================================================= */

function containsUrdu(text) {

    return /[\u0600-\u06FF]/.test(text);

}


function looksLikeRomanUrdu(text) {

    const romanUrduWords = [

        "mujhe",
        "mujhy",
        "muje",
        "mujy",
        "mujhay",

        "main",
        "mein",
        "mai",
        "mn",

        "tum",
        "tm",

        "tumse",
        "tumsy",
        "tmse",
        "tmsy",

        "aap",
        "ap",

        "kya",
        "kia",
        "kiya",

        "kyun",
        "kyu",
        "q",

        "nahi",
        "nahin",
        "nai",
        "ni",

        "hai",
        "hy",

        "hain",
        "hen",
        "han",

        "raha",
        "rha",

        "rahi",
        "rhi",

        "rahe",
        "rhe",

        "karna",
        "krna",

        "karta",
        "krta",

        "karti",
        "krti",

        "karte",
        "krte",

        "bohat",
        "bahut",
        "bht",

        "acha",
        "achha",

        "theek",
        "thik",
        "tk",

        "kahan",
        "kaha",

        "kaise",
        "kese",
        "kaisay",

        "kyun",
        "kyu",

        "jana",
        "jaana",

        "jao",
        "jao",

        "aana",
        "ana",

        "aaya",
        "aya",

        "aayi",
        "ayi",

        "shukriya",

        "pyar",
        "pyaar",

        "samajh",
        "smjh",

        "samajhna",
        "smjhna",

        "chahte",
        "chahty",

        "chahiye",
        "chaahiye",

        "zaroori",
        "zaruri",

        "baat",

        "bhi",
        "bi",

        "phir",
        "fir",

        "abhi",
        "abi",

        "kal",

        "aaj",

        "raat",

        "subah",

        "shaam",

        "ghar",

        "bahar",

        "andar",

        "dost",

        "yaar",

        "kyun",

        "kuch",

        "koi",

        "kaise",

        "kesa",

        "aisa",

        "esa",

        "waisa",

        "wesa",

        "mujh",

        "mera",

        "meri",

        "mere",

        "tera",

        "teri",

        "tere",

        "hum",

        "ham",

        "woh",

        "wo",

        "yeh",

        "ye",

        "usko",

        "isko",

        "mujhse",
        "mujhsy",

        "tumhara",
        "tumhari",
        "tumhare",

        "mera",
        "meri",
        "mere",

        "pasand",

        "nahi",

        "lagta",
        "lgta",

        "lagti",
        "lgti",

        "raha",
        "rha",

        "rahi",
        "rhi",

        "sakta",
        "skta",

        "sakti",
        "skti",

        "sakte",
        "sakte",

        "hona",
        "huna",

        "hoga",
        "hogi",

        "hona",

        "chalo",
        "chal",

        "theek",

        "problem",
        "masla",

        "madad",

        "help",

        "pata",
        "pta",

        "maloom",

        "kyunke",
        "kyunki",

        "lekin",
        "magar",

        "agar",

        "to",

        "phir",

        "jab",

        "jabhi",

        "jabtak",

        "jabse",

        "ab",

        "abhi",

        "pehle",

        "baad",

        "liye",

        "liye",

        "saath",

        "sath"
    ];


    const words =
        text
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .split(/\s+/)
            .filter(Boolean);


    let matches = 0;


    for (const word of words) {

        if (romanUrduWords.includes(word)) {

            matches++;

        }

    }


    /*
        A single Roman Urdu word should not automatically
        classify an entire English sentence as Roman Urdu.
    */

    if (matches >= 1 && words.length <= 3) {
        return true;
    }


    if (matches >= 2) {
        return true;
    }


    return false;
}


function detectInputType(text) {

    if (containsUrdu(text)) {

        return "Urdu";

    }


    if (looksLikeRomanUrdu(text)) {

        return "Roman Urdu";

    }


    return "Mixed / Auto-detect";
}


/* =========================================================
   GEMINI TRANSLATION
========================================================= */

async function translateWithGemini(text) {

    /*
        Check API key first.
    */

    if (
        !GEMINI_API_KEY ||
        GEMINI_API_KEY ===
        "PASTE_YOUR_GEMINI_API_KEY_HERE"
    ) {

        throw new Error(
            "Gemini API key is missing. Add your API key in script.js."
        );
    }


    /*
        Build the Gemini request.
    */

    const requestBody = {

        system_instruction: {

            parts: [

                {
                    text: SYSTEM_INSTRUCTION
                }

            ]

        },


        contents: [

            {

                role: "user",

                parts: [

                    {
                        text: text
                    }

                ]

            }

        ],


        generationConfig: {

            temperature: 0.1,

            maxOutputTokens: 500

        }

    };


    /*
        Send request to Google Gemini.
    */

    const response =
        await fetch(

            GEMINI_ENDPOINT,

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "x-goog-api-key":
                        GEMINI_API_KEY

                },

                body:
                    JSON.stringify(
                        requestBody
                    )

            }

        );


    /*
        Handle HTTP errors.
    */

    if (!response.ok) {

        let errorMessage =
            `Gemini API error: HTTP ${response.status}`;


        try {

            const errorData =
                await response.json();


            if (
                errorData &&
                errorData.error &&
                errorData.error.message
            ) {

                errorMessage =
                    errorData.error.message;

            }

        } catch (error) {

            /*
                Ignore JSON parsing errors.
            */

        }


        throw new Error(
            errorMessage
        );
    }


    /*
        Read JSON response.
    */

    const data =
        await response.json();


    /*
        Gemini normally returns:

        candidates
          -> content
             -> parts
                -> text
    */

    const candidates =
        data &&
        data.candidates
            ? data.candidates
            : [];


    if (!candidates.length) {

        throw new Error(
            "Gemini returned no translation."
        );
    }


    const parts =
        candidates[0] &&
        candidates[0].content &&
        candidates[0].content.parts
            ? candidates[0].content.parts
            : [];


    const translatedText =
        parts
            .map(
                part =>
                    part.text || ""
            )
            .join("")
            .trim();


    if (!translatedText) {

        throw new Error(
            "Gemini returned an empty translation."
        );
    }


    return cleanTranslation(
        translatedText
    );
}


/* =========================================================
   CLEAN AI RESPONSE
========================================================= */

function cleanTranslation(text) {

    let result =
        text.trim();


    /*
        Remove accidental labels.
    */

    result =
        result.replace(
            /^translation\s*:\s*/i,
            ""
        );


    result =
        result.replace(
            /^english\s*:\s*/i,
            ""
        );


    result =
        result.replace(
            /^english translation\s*:\s*/i,
            ""
        );


    /*
        Remove surrounding quotation marks
        if Gemini accidentally adds them.
    */

    if (
        result.length >= 2 &&
        (
            (
                result.startsWith('"') &&
                result.endsWith('"')
            )
            ||
            (
                result.startsWith("'") &&
                result.endsWith("'")
            )
        )
    ) {

        result =
            result
                .slice(
                    1,
                    -1
                )
                .trim();

    }


    return result;
}


/* =========================================================
   MAIN TRANSLATION
========================================================= */

async function translateText() {

    const text =
        inputText.value.trim();


    /*
        Empty input.
    */

    if (!text) {

        showStatus(
            "Please enter some Roman Urdu or Urdu first.",
            "error"
        );

        inputText.focus();

        return;
    }


    /*
        Character limit.
    */

    if (text.length > 5000) {

        showStatus(
            "Please keep the message under 5000 characters.",
            "error"
        );

        return;
    }


    /*
        Detect language.
    */

    const detectedType =
        detectInputType(text);


    /*
        Start loading.
    */

    setLoading(true);


    outputText.textContent =
        "Translating...";


    outputText.classList.remove(
        "placeholder"
    );


    translationInfo.classList.add(
        "hidden"
    );


    showStatus(
        "AI is translating...",
        ""
    );


    try {

        /*
            Call Gemini.
        */

        const translation =
            await translateWithGemini(
                text
            );


        /*
            Display result.
        */

        outputText.textContent =
            translation;


        /*
            Display information.
        */

        translationInfoText.textContent =
            `${detectedType} detected. Gemini translated the complete sentence using context.`;


        translationInfo.classList.remove(
            "hidden"
        );


        /*
            Success message.
        */

        showStatus(
            "Translation completed.",
            "success"
        );


    } catch (error) {

        console.error(
            "Gemini translation error:",
            error
        );


        outputText.textContent =
            "Unable to translate this message.";


        outputText.classList.remove(
            "placeholder"
        );


        /*
            Show useful error.
        */

        let message =
            "Translation failed. Please try again.";


        if (
            error &&
            error.message
        ) {

            message =
                error.message;

        }


        showStatus(
            message,
            "error"
        );


    } finally {

        /*
            Stop loading.
        */

        setLoading(false);

    }
}


/* =========================================================
   LOADING STATE
========================================================= */

function setLoading(
    isLoading
) {

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


/* =========================================================
   STATUS MESSAGE
========================================================= */

function showStatus(
    message,
    type
) {

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


/* =========================================================
   CHARACTER COUNTER
========================================================= */

inputText.addEventListener(
    "input",
    function () {

        characterCount.textContent =
            `${inputText.value.length} / 5000`;

    }
);


/* =========================================================
   TRANSLATE BUTTON
========================================================= */

translateButton.addEventListener(
    "click",
    translateText
);


/* =========================================================
   ENTER KEY
========================================================= */

inputText.addEventListener(
    "keydown",
    function (event) {

        /*
            Enter = translate

            Shift + Enter = new line
        */

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            translateText();

        }

    }
);


/* =========================================================
   CLEAR BUTTON
========================================================= */

clearButton.addEventListener(
    "click",
    function () {

        inputText.value = "";


        outputText.textContent =
            "Your English translation will appear here.";


        outputText.classList.add(
            "placeholder"
        );


        characterCount.textContent =
            "0 / 5000";


        translationInfo.classList.add(
            "hidden"
        );


        showStatus(
            "",
            ""
        );


        inputText.focus();

    }
);


/* =========================================================
   COPY BUTTON
========================================================= */

copyButton.addEventListener(
    "click",
    async function () {

        const text =
            outputText.textContent.trim();


        /*
            Don't copy placeholder.
        */

        if (
            !text ||
            text ===
            "Your English translation will appear here." ||
            text ===
            "Unable to translate this message."
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


        } catch (error) {

            console.error(
                "Copy error:",
                error
            );


            showStatus(
                "Could not copy the translation.",
                "error"
            );

        }

    }
);


/* =========================================================
   EXAMPLE BUTTONS
========================================================= */

examples.forEach(
    function (example) {

        example.addEventListener(
            "click",
            function () {

                const text =
                    example.dataset.text;


                inputText.value =
                    text;


                characterCount.textContent =
                    `${text.length} / 5000`;


                outputText.textContent =
                    "Your English translation will appear here.";


                outputText.classList.add(
                    "placeholder"
                );


                translationInfo.classList.add(
                    "hidden"
                );


                showStatus(
                    "",
                    ""
                );


                inputText.focus();

            }
        );

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

characterCount.textContent =
    "0 / 5000";