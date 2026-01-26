/**
 * AI Utilities
 */

/**
 * Robust JSON extraction from AI response strings
 * Handles markdown code blocks and extra text
 */
export function extractJSON(text) {
    if (typeof text !== 'string') return text;

    // 1. Try direct parsing
    try {
        return JSON.parse(text);
    } catch (e) {
        // Continue to extraction
    }

    // 2. Try to extract from markdown code blocks
    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/i;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1].trim());
        } catch (e) {
            // Continue
        }
    }

    // 3. Try to find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = text.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(potentialJson);
        } catch (e) {
            // Continue
        }
    }

    // 4. Return null if all failed
    return null;
}

export default {
    extractJSON
};
