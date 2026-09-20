import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EMBEDDING_SOURCES } from '../../src/constants.js';
import { resetDeps } from '../../src/deps.js';
import { operationState } from '../../src/state.js';

const mocks = vi.hoisted(() => ({
    compactIfNeeded: vi.fn(),
    extractMemories: vi.fn(),
    purgeSTCollection: vi.fn(),
    runPhase2Enrichment: vi.fn(),
}));

vi.mock('../../src/archive/archive.js', () => ({ compactIfNeeded: mocks.compactIfNeeded }));
vi.mock('../../src/extraction/extract.js', () => ({
    extractMemories: mocks.extractMemories,
    runPhase2Enrichment: mocks.runPhase2Enrichment,
}));
vi.mock('../../src/services/st-vector.js', () => ({ purgeSTCollection: mocks.purgeSTCollection }));

import { createBatches, startFullRebuild } from '../../src/rebuild/rebuild.js';
import { getSanitizedTokenSum } from '../../src/utils/message-sanitizer.js';

function legacyData() {
    return {
        schema_version: 4,
        lifecycle: { status: 'needs_rebuild' },
        memories: [{ id: 'legacy-memory', summary: 'Old data' }],
        characters: { legacy: { name: 'Legacy' } },
        processed_message_ids: ['legacy-fingerprint'],
        graph: { nodes: { legacy: { id: 'legacy' } }, edges: {} },
        communities: { legacy: { id: 'legacy' } },
        diagnostics: { archive: {}, volatile: {}, compaction: {}, rebuild: {} },
    };
}

describe('mandatory full rebuild', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        operationState.extractionInProgress = false;
        mocks.purgeSTCollection.mockResolvedValue(true);
        mocks.extractMemories.mockResolvedValue({ status: 'success' });
        mocks.runPhase2Enrichment.mockResolvedValue(undefined);
        mocks.compactIfNeeded.mockResolvedValue(undefined);
    });

    afterEach(() => {
        operationState.extractionInProgress = false;
        resetDeps();
    });

    it('refuses to mutate source history when legacy ST vector purge fails', async () => {
        const data = legacyData();
        const chat = [
            { mes: 'Archived by OpenVault', is_user: true, is_system: true, openvault_hidden: true },
            { mes: 'Real system message', is_user: false, is_system: true },
        ];
        mocks.purgeSTCollection.mockResolvedValue(false);
        setupTestContext({
            context: { chatId: 'legacy-chat', chat, chatMetadata: { openvault: data } },
            settings: { embeddingSource: EMBEDDING_SOURCES.ST_VECTOR },
            deps: { saveChatConditional: vi.fn().mockResolvedValue(undefined) },
        });

        await expect(startFullRebuild()).rejects.toThrow('rebuild did not start');
        expect(chat[0]).toMatchObject({ is_system: true, openvault_hidden: true });
        expect(chat[1]).toMatchObject({ is_system: true });
        expect(data.lifecycle.status).toBe('needs_rebuild');
        expect(mocks.extractMemories).not.toHaveBeenCalled();
    });

    it('restores only OpenVault-hidden messages and activates after synthesis', async () => {
        const data = legacyData();
        const chat = [
            { mes: 'Recovered source', name: 'User', is_user: true, is_system: true, openvault_hidden: true },
            { mes: 'Genuine system instruction', name: 'System', is_user: false, is_system: true },
        ];
        const save = vi.fn().mockResolvedValue(undefined);
        setupTestContext({
            context: { chatId: 'legacy-chat', chat, chatMetadata: { openvault: data } },
            settings: { embeddingSource: EMBEDDING_SOURCES.OLLAMA },
            deps: { saveChatConditional: save },
        });

        await expect(startFullRebuild()).resolves.toEqual({ success: true, boundary: 2 });
        expect(chat[0].is_system).toBe(false);
        expect(chat[0].openvault_hidden).toBeUndefined();
        expect(chat[1].is_system).toBe(true);
        expect(data.recovery_backup.memories[0].id).toBe('legacy-memory');
        expect(data.lifecycle.status).toBe('ready');
        expect(mocks.runPhase2Enrichment).toHaveBeenCalledOnce();
        expect(mocks.compactIfNeeded).toHaveBeenCalledOnce();
        expect(mocks.purgeSTCollection).not.toHaveBeenCalled();
        expect(save).toHaveBeenCalled();
    });
});

describe('createBatches', () => {
    it('closes batches on the token budget in an AI-only transcript', () => {
        // No user turn anywhere, so no Bot→User boundary exists to close a batch and the
        // token budget would otherwise be ignored.
        const chat = Array.from({ length: 4 }, (_, index) => ({
            mes: `reply ${index} ${'visible dialogue '.repeat(20)}`,
            is_user: false,
            is_system: false,
            send_date: `ai-${index}`,
        }));
        const budget = getSanitizedTokenSum(chat, [0]);

        const batches = createBatches(chat, chat.length, budget, Infinity);

        expect(batches.flat()).toEqual([0, 1, 2, 3]);
        expect(batches.length).toBeGreaterThan(1);
    });

    it('still closes batches only at turn boundaries when user turns exist', () => {
        const chat = [
            { mes: 'user one', is_user: true, is_system: false },
            { mes: 'bot one', is_user: false, is_system: false },
            { mes: 'user two', is_user: true, is_system: false },
            { mes: 'bot two', is_user: false, is_system: false },
        ];

        // Budget of one token: only a complete turn may close, so the opening user
        // message stays with its reply even though the budget is met at index 0.
        const batches = createBatches(chat, chat.length, 1, Infinity);

        expect(batches).toEqual([
            [0, 1],
            [2, 3],
        ]);
    });
});
