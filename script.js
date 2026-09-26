/* =========================================================
   UrduTranslate
   Roman Urdu / Urdu / Mixed Language → English
   Powered by Gemini AI
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateButton = document.getElementById("translateButton");
const clearButton = document.getElementById("clearButton");
const copyButton = document.getElementById("copyButton");
const characterCount = document.getElementById("characterCount");
const statusMessage = document.getElementById("statusMessage");
const buttonText = document.getElementById("buttonText");
const loadingSpinner = document.getElementById("loadingSpinner");

const translationInfo =
    document.getElementById("translationInfo");

const translationInfoText =
    document.getElementById("translationInfoText");

const examples =
    document.querySelectorAll(".example");


/* =========================================================
   GEMINI CONFIGURATION
   ========================================================= */

const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";

const GEMINI_MODEL =
    "gemini-3.8-flash";

const GEMINI_ENDPOINT =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;


/* =========================================================
   SETTINGS
   ========================================================= */

const MAX_LENGTH = 5000;

const REQUEST_TIMEOUT = 30000;

/*
   Number of attempts for temporary Gemini errors.

   Attempt 1
   ↓
   wait
   ↓
   Attempt 2
   ↓
   wait
   ↓
   Attempt 3
*/

const MAX_RETRIES = 3;


/* =========================================================
   TRANSLATION INSTRUCTIONS
   ========================================================= */

const SYSTEM_INSTRUCTION = `
You are an expert Pakistani Roman Urdu, Urdu, and mixed-language
to English translator.

Your ONLY job is translation.

Translate the user's COMPLETE message into natural, fluent English.

IMPORTANT RULES:

1. Understand the complete sentence before translating.

2. NEVER translate Roman Urdu word-by-word.

3. Understand Pakistani conversational language.

4. Understand informal Pakistani Roman Urdu.

5. Understand WhatsApp-style Roman Urdu.

6. Understand Pakistani slang.

7. Understand abbreviations and shortened texting.

Examples:

mjy = mujhe
mjhy = mujhe
mujy = mujhe
mjhe = mujhe

tm = tum
tmy = tumhe / tumhein

ap = aap

kr = kar
krna = karna
krta = karta
krti = karti

nhi = nahi
nai = nahi
ni = nahi
nh = nahi

smjh = samajh
smj = samajh

rha = raha
rhi = rahi

hn = hain
hy = hai

bht = bohat
boht = bohat

agr = agar

q = kyun
kyu = kyun
kyon = kyun

These are ONLY examples.

DO NOT depend on this list.

If a Roman Urdu word is not in this list,
infer its meaning from the complete sentence
and Pakistani conversational context.

8. Understand different spellings of the same Roman Urdu word.

For example:

mujhe
mjy
mjhe
muje
mujy
mujhy

can all represent the same intended word depending on context.

9. Handle spelling mistakes.

For example:

"mjy smjh ni aa rhi k tm kya kehna chahty ho"

should be understood as:

"mujhe samajh nahi aa rahi ke tum kya kehna chahtay ho"

and translated naturally.

10. Handle MIXED ENGLISH + ROMAN URDU.

For example:

"yaar mujhe ye idea honestly bilkul pasand nahi aya"

should become natural English such as:

"Honestly, I really didn't like this idea."

Translate the COMPLETE message.

Do not leave Roman Urdu untranslated.

11. Handle WhatsApp-style messages.

Example:

"kal aa rhy ho ya nhi 😂"

should become natural English such as:

"Are you coming tomorrow or not? 😂"

12. Handle slang and conversational expressions.

Examples include:

yaar
bro
bhai
scene kya hai
kya scene hai
chalo
bas karo
rehne do
dimagh mat khao
mood nahi hai
faltu
bakwas
pagal ho kya
mazak kar raha tha
acha phir
haan yaar
nahi yaar
dekho
sun

Their exact English meaning depends on context.

13. Do NOT assume slang has one fixed meaning.

Always use the surrounding sentence.

14. Preserve the original emotion.

Casual → natural casual English.

Formal → natural formal English.

Funny → natural humorous English.

Angry → natural angry English.

Romantic → natural romantic English.

Emotional → natural emotional English.

15. Preserve:

- names
- numbers
- dates
- emojis
- URLs
- @mentions
- hashtags
- paragraph breaks

16. Do not invent information.

17. Do not remove meaningful information.

18. If the input contains Urdu script and Roman Urdu,
translate both.

19. If the input contains English and Roman Urdu,
translate the COMPLETE message naturally.

20. Never fail just because the user made spelling mistakes.

21. Never fail just because the message contains slang.

22. Never fail just because the message contains abbreviations.

23. If a small part is ambiguous but the overall meaning is clear,
translate the understandable meaning naturally.

24. Do not ask the user to rewrite the message unless it is
genuinely impossible to understand.

25. Return ONLY the English translation.

Do NOT write:

"Translation:"
"Here is the translation:"
"Sure!"
"I can help with that."

The final output must contain ONLY the English translation.

The target language is ALWAYS English.
`;


/* =========================================================
   CHARACTER COUNT
   ========================================================= */

function updateCharacterCount() {

    if (!inputText || !characterCount) {
        return;
    }

    const length = inputText.value.length;

    characterCount.textContent =
        `${length} / ${MAX_LENGTH}`;
}


inputText.addEventListener(
    "input",
    updateCharacterCount
);


/* =========================================================
   STATUS
   ========================================================= */

function showStatus(message, type = "") {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message;

    statusMessage.className = "status";

    if (type) {
        statusMessage.classList.add(type);
    }
}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(isLoading) {

    if (!translateButton) {
        return;
    }

    translateButton.disabled =
        isLoading;


    if (isLoading) {

        if (buttonText) {
            buttonText.textContent =
                "Translating...";
        }

        if (loadingSpinner) {
            loadingSpinner.classList.remove(
                "hidden"
            );
        }

    } else {

        if (buttonText) {
            buttonText.textContent =
                "Translate with Gemini";
        }

        if (loadingSpinner) {
            loadingSpinner.classList.add(
                "hidden"
            );
        }
    }
}


/* =========================================================
   API KEY CHECK
   ========================================================= */

function hasValidApiKey() {

    return (
        GEMINI_API_KEY &&
        GEMINI_API_KEY.trim() !== "" &&
        GEMINI_API_KEY !==
        "PASTE_YOUR_GEMINI_API_KEY_HERE"
    );
}


/* =========================================================
   WAIT FUNCTION
   ========================================================= */

function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


/* =========================================================
   GEMINI REQUEST
   ========================================================= */

async function requestGeminiTranslation(text) {

    for (
        let attempt = 1;
        attempt <= MAX_RETRIES;
        attempt++
    ) {

        let controller;
        let timeoutId;


        try {

            controller =
                new AbortController();


            timeoutId =
                setTimeout(
                    () => {
                        controller.abort();
                    },
                    REQUEST_TIMEOUT
                );


            const requestBody = {

                system_instruction: {

                    parts: [
                        {
                            text:
                                SYSTEM_INSTRUCTION
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

                    maxOutputTokens: 500,

                    thinkingConfig: {

                        thinkingLevel:
                            "low"

                    }

                }

            };


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
                            ),

                        signal:
                            controller.signal

                    }
                );


            clearTimeout(timeoutId);


            let data;


            try {

                data =
                    await response.json();

            } catch (jsonError) {

                throw new Error(
                    "Gemini returned an invalid response."
                );

            }


            /* =================================================
               TEMPORARY HIGH-DEMAND / SERVER ERROR
               ================================================= */

            if (
                response.status === 429 ||
                response.status === 500 ||
                response.status === 502 ||
                response.status === 503 ||
                response.status === 504
            ) {

                const apiMessage =
                    data?.error?.message ||
                    "Gemini is temporarily busy.";


                console.warn(
                    `Gemini temporary error. Attempt ${attempt}/${MAX_RETRIES}:`,
                    apiMessage
                );


                if (
                    attempt <
                    MAX_RETRIES
                ) {

                    const waitTime =
                        attempt === 1
                            ? 2000
                            : attempt === 2
                                ? 5000
                                : 8000;


                    showStatus(
                        `Gemini is busy. Retrying automatically... (${attempt}/${MAX_RETRIES})`,
                        ""
                    );


                    await wait(
                        waitTime
                    );


                    continue;

                }


                throw new Error(
                    "Gemini is currently experiencing high demand. Please wait a moment and try again."
                );

            }


            /* =================================================
               OTHER API ERROR
               ================================================= */

            if (!response.ok) {

                const apiMessage =
                    data?.error?.message ||
                    `Gemini request failed with HTTP ${response.status}.`;


                throw new Error(
                    apiMessage
                );

            }


            /* =================================================
               EXTRACT TRANSLATION
               ================================================= */

            let translatedText = "";


            if (
                data?.candidates?.length > 0
            ) {

                const candidate =
                    data.candidates[0];


                if (
                    candidate.content &&
                    candidate.content.parts
                ) {

                    translatedText =
                        candidate.content.parts
                            .filter(
                                part =>
                                    typeof part.text ===
                                    "string"
                            )
                            .map(
                                part =>
                                    part.text
                            )
                            .join("")
                            .trim();

                }

            }


            if (!translatedText) {

                console.error(
                    "Unexpected Gemini response:",
                    data
                );


                throw new Error(
                    "Gemini returned no translation. Please try again."
                );

            }


            return translatedText;


        } catch (error) {

            if (timeoutId) {
                clearTimeout(timeoutId);
            }


            /* =============================================
               TIMEOUT
               ============================================= */

            if (
                error.name ===
                "AbortError"
            ) {

                if (
                    attempt <
                    MAX_RETRIES
                ) {

                    showStatus(
                        `Gemini took too long. Retrying... (${attempt}/${MAX_RETRIES})`,
                        ""
                    );


                    await wait(
                        attempt * 2000
                    );


                    continue;

                }


                throw new Error(
                    "Gemini took too long to respond. Please try again."
                );

            }


            /*
               Do not retry normal errors such as:
               - invalid API key
               - invalid request
               - invalid model
            */

            throw error;

        }

    }


    throw new Error(
        "Translation failed."
    );

}


/* =========================================================
   MAIN TRANSLATE FUNCTION
   ========================================================= */

async function translateText() {

    const text =
        inputText.value.trim();


    /* ---------- Empty ---------- */

    if (!text) {

        outputText.textContent =
            "Your English translation will appear here...";

        outputText.classList.add(
            "placeholder"
        );

        showStatus(
            "Please enter some Roman Urdu or Urdu text.",
            "error"
        );

        return;
    }


    /* ---------- Length ---------- */

    if (
        text.length >
        MAX_LENGTH
    ) {

        showStatus(
            `Please keep your message under ${MAX_LENGTH} characters.`,
            "error"
        );

        return;
    }


    /* ---------- API key ---------- */

    if (!hasValidApiKey()) {

        showStatus(
            "Gemini API key is missing. Add your API key in script.js.",
            "error"
        );

        return;
    }


    /* ---------- Loading ---------- */

    setLoading(true);


    outputText.textContent =
        "Translating...";

    outputText.classList.remove(
        "placeholder"
    );


    if (translationInfo) {

        translationInfo.classList.add(
            "hidden"
        );

    }


    showStatus(
        "Gemini is understanding your message...",
        ""
    );


    try {

        const translatedText =
            await requestGeminiTranslation(
                text
            );


        /* ---------- Success ---------- */

        outputText.textContent =
            translatedText;

        outputText.classList.remove(
            "placeholder"
        );


        if (translationInfoText) {

            translationInfoText.textContent =
                "Translated by Gemini AI";

        }


        if (translationInfo) {

            translationInfo.classList.remove(
                "hidden"
            );

        }


        showStatus(
            "Translation completed.",
            "success"
        );


    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        outputText.textContent =
            "Unable to translate.";

        outputText.classList.remove(
            "placeholder"
        );


        showStatus(
            error.message ||
            "Unable to translate. Please try again.",
            "error"
        );


        if (translationInfo) {

            translationInfo.classList.add(
                "hidden"
            );

        }


    } finally {

        setLoading(false);

    }

}


/* =========================================================
   TRANSLATE BUTTON
   ========================================================= */

translateButton.addEventListener(
    "click",
    translateText
);


/* =========================================================
   CTRL + ENTER
   ========================================================= */

inputText.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            event.ctrlKey
        ) {

            event.preventDefault();

            translateText();

        }

    }
);


/* =========================================================
   CLEAR
   ========================================================= */

clearButton.addEventListener(
    "click",
    function() {

        inputText.value = "";

        outputText.textContent =
            "Your English translation will appear here...";

        outputText.classList.add(
            "placeholder"
        );


        if (translationInfo) {

            translationInfo.classList.add(
                "hidden"
            );

        }


        showStatus(
            "",
            ""
        );


        updateCharacterCount();

        inputText.focus();

    }
);


/* =========================================================
   COPY
   ========================================================= */

copyButton.addEventListener(
    "click",
    async function() {

        const text =
            outputText.textContent.trim();


        if (
            !text ||
            text ===
            "Your English translation will appear here..." ||
            text ===
            "Translating..." ||
            text ===
            "Unable to translate."
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


            const original =
                copyButton.textContent;


            copyButton.textContent =
                "Copied!";


            showStatus(
                "Translation copied to clipboard.",
                "success"
            );


            setTimeout(
                () => {

                    copyButton.textContent =
                        original;

                },
                1500
            );


        } catch (error) {

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
    function(example) {

        example.addEventListener(
            "click",
            function() {

                /*
                   IMPORTANT:
                   Use the button's actual visible text.

                   This fixes the "undefined" problem.
                */

                const exampleText =
                    example.textContent.trim();


                if (!exampleText) {
                    return;
                }


                inputText.value =
                    exampleText;


                updateCharacterCount();


                outputText.textContent =
                    "Your English translation will appear here...";

                outputText.classList.add(
                    "placeholder"
                );


                if (translationInfo) {

                    translationInfo.classList.add(
                        "hidden"
                    );

                }


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
   INITIALIZE
   ========================================================= */

updateCharacterCount();

setLoading(false);