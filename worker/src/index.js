const ALLOWED_ORIGIN = "*";

const GEMINI_MODEL = "gemini-2.5-flash";

const GEMINI_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;


const TRANSLATION_INSTRUCTIONS = `
You are a professional Pakistani Roman Urdu and Urdu to English translator.

Your ONLY job is to translate the user's text into natural, fluent English.

Rules:

1. Return ONLY the English translation.
2. Do not explain the translation.
3. Do not add "Translation:" or any other label.
4. Do not put the translation inside quotation marks.
5. Understand Pakistani Roman Urdu.
6. Understand Urdu script.
7. Understand informal Roman Urdu spelling.
8. Understand WhatsApp-style texting.
9. Understand slang and abbreviations.
10. Understand spelling mistakes and phonetic spelling.
11. Understand mixed English + Roman Urdu.
12. Use the surrounding context to understand the intended meaning.
13. Preserve the original meaning.
14. Preserve emotion and tone.
15. Preserve politeness and intent.
16. Preserve names.
17. Preserve numbers where appropriate.
18. Preserve emojis where appropriate.
19. Preserve URLs.
20. Preserve @mentions and hashtags.
21. Preserve paragraph structure when appropriate.
22. If the input is already English, return it naturally without changing its meaning.
23. Do not output Urdu.
24. Do not output Roman Urdu.
25. Do not provide explanations.
26. Never reject a translation simply because the Roman Urdu contains slang, spelling mistakes, abbreviations, or unusual wording.

Common Roman Urdu variations include:

mujhe / mujhy / muje / mujy / mujhay
main / mein / mai / mn
tum / tm
tumse / tmse / tum sy / tm sy
kya / kia / kiya
kyun / kyu / q
nahi / nahin / nai / ni
hai / hy
hain / hen / han
raha / rha
rahi / rhi
rahe / rhe
karna / krna
karta / krta
karti / krti
bohat / bahut / bht
acha / achha
theek / thik / tk
kaise / kese / kaisay
samajh / smjh
chahte / chahty

Examples:

"mujhy smjh ni aa rhi k tm kya kehna chahty ho"
→ I don't understand what you're trying to say.

"kal agar tum free ho to hum bahar ja sakte hain"
→ If you're free tomorrow, we can go out.

"yaar mujhe bohat tension ho rahi hai"
→ Man, I'm really stressed out.

"آپ کیسے ہیں؟ مجھے امید ہے آپ ٹھیک ہوں گے۔"
→ How are you? I hope you're doing well.
`;


function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };
}


function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: corsHeaders()
        }
    );
}


export default {
    async fetch(request, env) {

        // CORS preflight
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: corsHeaders()
            });
        }


        const url = new URL(request.url);


        // Only allow POST /translate
        if (
            request.method !== "POST" ||
            url.pathname !== "/translate"
        ) {
            return jsonResponse(
                {
                    error: "Endpoint not found."
                },
                404
            );
        }


        // Check Gemini secret
        if (!env.GEMINI_API_KEY) {
            return jsonResponse(
                {
                    error:
                        "Gemini API key is not configured on the server."
                },
                500
            );
        }


        // Read JSON
        let body;

        try {
            body = await request.json();
        } catch (error) {
            return jsonResponse(
                {
                    error: "Invalid JSON request."
                },
                400
            );
        }


        const text =
            typeof body.text === "string"
                ? body.text.trim()
                : "";


        // Validate input
        if (!text) {
            return jsonResponse(
                {
                    error: "Please enter some text."
                },
                400
            );
        }


        if (text.length > 5000) {
            return jsonResponse(
                {
                    error:
                        "Text is too long. Maximum 5000 characters."
                },
                400
            );
        }


        // Gemini request
        const geminiRequest = {
            system_instruction: {
                parts: [
                    {
                        text: TRANSLATION_INSTRUCTIONS
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
                maxOutputTokens: 1000
            }
        };


        let geminiResponse;


        try {

            geminiResponse = await fetch(
                GEMINI_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        "x-goog-api-key":
                            env.GEMINI_API_KEY
                    },

                    body:
                        JSON.stringify(geminiRequest)
                }
            );

        } catch (error) {

            return jsonResponse(
                {
                    error:
                        "Could not connect to Gemini."
                },
                502
            );
        }


        let data;


        try {

            data =
                await geminiResponse.json();

        } catch (error) {

            return jsonResponse(
                {
                    error:
                        "Gemini returned an invalid response."
                },
                502
            );
        }


        // Gemini error
        if (!geminiResponse.ok) {

            console.error(
                "Gemini API error:",
                JSON.stringify(data)
            );

            return jsonResponse(
                {
                    error:
                        data?.error?.message ||
                        "Gemini API error."
                },
                geminiResponse.status
            );
        }


        // Extract translation
        const translatedText =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();


        if (!translatedText) {

            return jsonResponse(
                {
                    error:
                        "Gemini returned no translation."
                },
                502
            );
        }


        // Success
        return jsonResponse(
            {
                translation:
                    translatedText
            },
            200
        );
    }
};