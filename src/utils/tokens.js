// @ts-check
import { cdnImport } from './cdn.js';

const { countTokens: _countTokens } = await cdnImport('gpt-tokenizer/encoding/o200k_base');

const MAX_CACHE_SIZE = 2000;
const tokenCache = new Map();

/**
 * Count tokens in a text string using gpt-tokenizer.
 * @param {string} text - Input text
 * @returns {number} Token count
 */
export function countTokens(text) {
    return (text || '').length === 0 ? 0 : _countTokens(text);
}

/**
 * Clear the token cache. Call on CHAT_CHANGED.
 * @returns {void}
 */
export function clearTokenCache() {
    tokenCache.clear();
}

/**
 * Get token count for a single message. Uses in-memory LRU cache.
 * @param {Array<{mes?: string}>} chat - Chat array
 * @param {number} index - Message index
 * @returns {number} Token count
 */
export function getMessageTokenCount(chat, index) {
    const text = chat[index]?.mes || '';
    const key = `${index}_${text.length}`;

    if (tokenCache.has(key)) {
        const value = tokenCache.get(key);
        tokenCache.delete(key);
        tokenCache.set(key, value);
        return value;
    }

    const count = text.length === 0 ? 0 : _countTokens(text);

    if (tokenCache.size >= MAX_CACHE_SIZE) {
        const oldest = tokenCache.keys().next().value;
        tokenCache.delete(oldest);
    }
    tokenCache.set(key, count);
    return count;
}

/**
 * Sum token counts for a list of message indices.
 * @param {Array<{mes?: string}>} chat - Chat array
 * @param {number[]} indices - Message indices
 * @returns {number} Total tokens
 */
export function getTokenSum(chat, indices) {
    let total = 0;
    for (const i of indices) {
        total += getMessageTokenCount(chat, i);
    }
    return total;
}

/**
 * Whether the chat contains at least one real user turn.
 * AI-only transcripts (group chats driven entirely by bot members) can never reach
 * a Bot→User boundary anywhere, so turn logic must not require one.
 * @param {Array<{is_user?: boolean; is_system?: boolean}>} chat - Full chat array
 * @returns {boolean} True when a non-system user message exists
 */
function hasUserTurn(chat) {
    return chat.some((msg) => msg?.is_user && !msg?.is_system);
}

/**
 * Find the next message that represents a real conversation turn, walking past
 * system messages (Author's Notes, hidden prompts) which are not turns.
 * @param {Array<{is_system?: boolean}>} chat - Full chat array
 * @param {number} index - Index to scan forward from
 * @returns {Object|undefined} The next non-system message, or undefined at end of chat
 */
export function getNextNonSystemMessage(chat, index) {
    let next = index + 1;
    while (chat[next]?.is_system) next++;
    return chat[next];
}

/**
 * Count complete User+Bot turns in a list of message IDs.
 * Skips system messages. A turn is counted each time a Bot message (non-user, non-system)
 * is encountered in the filtered sequence.
 * An AI-only transcript can never produce that boundary, which would pin the count at
 * zero and silently disable the extractionMaxTurns batch cap. With no user turn to
 * complete, each assistant message counts as its own turn.
 * @param {Array<{is_user?: boolean; is_system?: boolean}>} chat - Full chat array
 * @param {number[]} messageIds - Ordered message indices to count turns in
 * @returns {number} Number of complete turns
 */
export function countTurns(chat, messageIds) {
    if (!hasUserTurn(chat)) {
        let assistantTurns = 0;
        for (const id of messageIds) {
            const msg = chat[id];
            if (msg && !msg.is_system && !msg.is_user) assistantTurns++;
        }
        return assistantTurns;
    }

    let turns = 0;
    let seenUser = false;
    for (const id of messageIds) {
        const msg = chat[id];
        if (!msg || msg.is_system) continue;
        if (msg.is_user) {
            seenUser = true;
        } else if (seenUser) {
            turns++;
            seenUser = false;
        }
    }
    return turns;
}

/**
 * Snap a message index list to a valid turn boundary.
 * A split is valid when the last message is from Bot and the next message is from User,
 * or at end-of-chat. This prevents orphaning User messages from their Bot responses.
 * Trims backward until a valid boundary is found. Returns [] if none found.
 * An AI-only transcript has no Bot→User boundary anywhere, so the slice is returned
 * as-is: there is no user message to orphan.
 * @param {Array<{is_user?: boolean; is_system?: boolean}>} chat - Full chat array
 * @param {number[]} messageIds - Ordered message indices to snap
 * @param {boolean} [allowUserOnly=false] - If true, return accumulated messages even if no Bot→User boundary found (prevents stall)
 * @returns {number[]} Snapped message indices
 */
export function snapToTurnBoundary(chat, messageIds, allowUserOnly = false) {
    if (messageIds.length === 0) return [];

    if (!hasUserTurn(chat)) return messageIds.slice();

    // Walk backward from the end of the list
    for (let i = messageIds.length - 1; i >= 0; i--) {
        const lastId = messageIds[i];
        const lastMsg = chat[lastId];

        // Skip system messages — they aren't real conversation turns
        if (lastMsg?.is_system) continue;

        // Walk forward past system messages to find the next real message
        const nextInChat = getNextNonSystemMessage(chat, lastId);

        // Valid: last message is from bot AND (end of chat OR next message is from user)
        // This ensures we split at B→U boundaries, not mid-turn (U→U or U→B)
        if (lastMsg && !lastMsg.is_user && (!nextInChat || nextInChat.is_user)) {
            return messageIds.slice(0, i + 1);
        }
    }

    // Fallback: if no Bot→User boundary found and we allow user-only batches,
    // return the accumulated messages anyway (prevents stall)
    if (allowUserOnly) {
        return messageIds;
    }

    return [];
}
