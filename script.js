const inputText =
    document.getElementById("inputText");

const outputText =
    document.getElementById("outputText");

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


/*
 * IMPORTANT:
 *
 * Replace the URL below with your actual
 * Cloudflare Worker URL.
 *
 * Example:
 *
 * https://translator-chatbot.xxxxx.workers.dev/translate
 */

const TRANSLATE_API_URL =
  "https://translator-chatbot.malikahmad00004.workers.dev/translate";

const MAX_LENGTH = 5000;

let isTranslating = false;


/* -----------------------------
   Character counter
----------------------------- */

function updateCharacterCount() {

    const length =
        inputText.value.length;

    characterCount.textContent =
        `${length} / ${MAX_LENGTH}`;
}


inputText.addEventListener(
    "input",
    updateCharacterCount
);


/* -----------------------------
   Status
----------------------------- */

function showStatus(
    message,
    type = ""
) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        `status ${type}`;
}


/* -----------------------------
   Loading
----------------------------- */

function setLoading(loading) {

    isTranslating =
        loading;

    translateButton.disabled =
        loading;

    clearButton.disabled =
        loading;


    if (loading) {

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


/* -----------------------------
   Translation
----------------------------- */

async function translateText() {

    const text =
        inputText.value.trim();


    if (!text) {

        outputText.textContent =
            "Your English translation will appear here.";

        showStatus(
            "Please enter some Roman Urdu or Urdu.",
            "error"
        );

        return;
    }


    if (text.length > MAX_LENGTH) {

        showStatus(
            `Maximum ${MAX_LENGTH} characters allowed.`,
            "error"
        );

        return;
    }


    if (isTranslating) {
        return;
    }


    if (
        TRANSLATE_API_URL.includes(
            "PASTE_YOUR_CLOUDFLARE"
        )
    ) {

        showStatus(
            "Please add your Cloudflare Worker URL in script.js.",
            "error"
        );

        return;
    }


    setLoading(true);

    showStatus(
        "Translating...",
        "loading"
    );

    outputText.textContent =
        "Translating...";


    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => controller.abort(),
            30000
        );


    try {

        const response =
            await fetch(
                TRANSLATE_API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            text: text
                        }),

                    signal:
                        controller.signal
                }
            );


        let data;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "The translation server returned an invalid response."
            );
        }


        if (!response.ok) {

            throw new Error(
                data?.error ||
                `Server error (${response.status}).`
            );
        }


        if (
            !data.translation ||
            typeof data.translation !== "string"
        ) {

            throw new Error(
                "The server returned no translation."
            );
        }


        outputText.textContent =
            data.translation;

        showStatus(
            "Translation complete.",
            "success"
        );

    } catch (error) {

        console.error(
            "Translation error:",
            error
        );


        if (
            error.name ===
            "AbortError"
        ) {

            outputText.textContent =
                "Translation timed out.";

            showStatus(
                "The request took too long. Please try again.",
                "error"
            );

        } else {

            outputText.textContent =
                "Translation failed.";

            showStatus(
                error.message ||
                "Something went wrong.",
                "error"
            );
        }

    } finally {

        clearTimeout(timeout);

        setLoading(false);
    }
}


/* -----------------------------
   Translate button
----------------------------- */

translateButton.addEventListener(
    "click",
    translateText
);


/* -----------------------------
   Enter key
----------------------------- */

inputText.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            translateText();
        }
    }
);


/* -----------------------------
   Clear
----------------------------- */

clearButton.addEventListener(
    "click",
    function() {

        inputText.value = "";

        outputText.textContent =
            "Your English translation will appear here.";

        showStatus("");

        updateCharacterCount();

        inputText.focus();
    }
);


/* -----------------------------
   Copy
----------------------------- */

copyButton.addEventListener(
    "click",
    async function() {

        const text =
            outputText.textContent.trim();


        if (
            !text ||
            text ===
                "Your English translation will appear here." ||
            text ===
                "Translation failed." ||
            text ===
                "Translation timed out."
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

            showStatus(
                "Could not copy the translation.",
                "error"
            );
        }
    }
);


/* -----------------------------
   Examples
----------------------------- */

examples.forEach(
    function(example) {

        example.addEventListener(
            "click",
            function() {

                const text =
                    example.dataset.text ||
                    example.textContent.trim();

                inputText.value =
                    text;

                updateCharacterCount();

                inputText.focus();

                translateText();
            }
        );
    }
);


/* -----------------------------
   Initial state
----------------------------- */

updateCharacterCount();