// OpenRouter API Service
// Strict mode: Minimal headers to avoid CORS issues
// Defaulting to Google Gemini via OpenRouter as it's the most stable free model

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

// Fallback models — updated April 2026
// Using current free models available on OpenRouter
const MODELS = [
    "google/gemma-4-31b-it:free",
    "deepseek/deepseek-r1:free",
    "nvidia/nemotron-3-super:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "openrouter/auto"  // ultimate fallback — auto-routes to best available free model
]

export const generateTripPlan = async (prompt, userKey) => {
    const apiKey = (import.meta.env.VITE_OPENROUTER_API_KEY || userKey || "").trim()

    if (!apiKey) {
        throw new Error("API Key is missing. Please click the key icon in the header and enter your OpenRouter API Key.")
    }

    // Basic format check
    if (!apiKey.startsWith('sk-or-')) {
        throw new Error(`Invalid Key Format. Key must start with 'sk-or-'. You provided: ${apiKey.substring(0, 5)}...`)
    }

    let detailedError = ""

    // Try models in sequence
    for (const model of MODELS) {
        try {
            console.log(`Using model: ${model}`)
            return await makeRequest(apiKey, model, prompt)
        } catch (error) {
            console.error(`Model ${model} failed:`, error)
            detailedError = error.message

            // If unauthorized, no point trying other models - the key is wrong
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                throw error
            }
        }
    }

    throw new Error(`Failed to generate trip. Last error: ${detailedError}`)
}

const makeRequest = async (apiKey, model, prompt) => {
    const requestBody = {
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 4096
    }

    try {
        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
                // REMOVED Custom Headers (HTTP-Referer, X-Title) to reduce CORS/Preflight issues
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            // Try to parse the error body from OpenRouter
            const errorData = await response.json().catch(() => ({}))
            console.error("OpenRouter Raw Error:", errorData)

            const apiMsg = errorData.error?.message || errorData.error || response.statusText

            if (response.status === 401) {
                throw new Error(`Unauthorized (401): ${apiMsg}. Check your key balance/validity.`)
            }

            throw new Error(`API Error (${response.status}): ${apiMsg}`)
        }

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content

        if (!text) throw new Error("Empty response from AI")

        return parseJsonLike(text)

    } catch (error) {
        throw error
    }
}

const parseJsonLike = (text) => {
    let clean = text.trim()
    // Clean markdown
    clean = clean.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '')

    // Find JSON object
    const start = clean.indexOf('{')
    const end = clean.lastIndexOf('}')

    if (start !== -1 && end !== -1) {
        clean = clean.substring(start, end + 1)
    }

    try {
        return JSON.parse(clean)
    } catch (e) {
        console.error("JSON Parse Error:", text)
        throw new Error("Received text is not valid JSON. Please try again.")
    }
}
