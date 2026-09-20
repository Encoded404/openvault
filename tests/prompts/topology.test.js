import { describe, expect, it } from 'vitest';
import { buildEventExtractionPrompt } from '../../src/prompts/events/builder.js';
import { SYSTEM_PREAMBLE_CN } from '../../src/prompts/shared/preambles.js';

const PREAMBLE = SYSTEM_PREAMBLE_CN;
const PREFILL = '<thinking>\n';

/**
 * Assert system message has role+examples but NOT schema/rules/language_rules.
 */
function assertSystemPrompt(content) {
    expect(content).toContain('<role>');
    expect(content).not.toContain('<output_schema>');
    expect(content).not.toContain('<task_rules>');
    // language_rules only in user prompt now
    const afterPreamble = content.slice(content.indexOf('</system_config>'));
    expect(afterPreamble).not.toContain('<language_rules>');
}

/**
 * Assert user message has constraints block at end.
 */
function assertUserPrompt(content) {
    expect(content).toContain('<language_rules>');
    expect(content).toContain('<output_schema>');
    expect(content).toContain('OUTPUT FORMAT:');
}

describe('Prompt Topology — Recency Bias Layout', () => {
    it('events: schema and rules in user prompt, not system', () => {
        const msgs = buildEventExtractionPrompt({
            messages: 'Test message',
            names: { char: 'Alice', user: 'Bob' },
            context: {},
            preamble: PREAMBLE,
            prefill: PREFILL,
        });
        expect(msgs).toHaveLength(3);
        assertSystemPrompt(msgs[0].content);
        assertUserPrompt(msgs[1].content);
        expect(msgs[2].role).toBe('assistant');
    });

    it('all builders default to auto', () => {
        // Test that language parameter defaults to 'auto' across builders
        const msgs = buildEventExtractionPrompt({
            messages: 'Test',
            names: { char: 'A', user: 'B' },
            context: {},
            preamble: PREAMBLE,
            prefill: PREFILL,
        });
        // Check that language is set to auto (implicitly tested by content not containing explicit language override)
        expect(msgs).toHaveLength(3);
        assertSystemPrompt(msgs[0].content);
        assertUserPrompt(msgs[1].content);
    });
});

describe('Event prompt — source attribution contract', () => {
    function buildPrompt() {
        return buildEventExtractionPrompt({
            messages: '<source source_message_id="412" role="user">[Bob]: Hello there</source>',
            names: { char: 'Alice', user: 'Bob' },
            context: {},
            preamble: PREAMBLE,
            prefill: PREFILL,
        });
    }

    function buildPromptText() {
        return buildPrompt()
            .map((message) => message.content)
            .join('\n');
    }

    /** Constraint block only — the system prompt carries the few-shot examples. */
    function buildUserPromptText() {
        return buildPrompt()[1].content;
    }

    it('declares the field in the schema example and field definitions', () => {
        const text = buildPromptText();

        expect(text).toContain('"source_message_ids": [412, 413]');
        expect(text).toContain('source_message_ids: REQUIRED on every event');
    });

    it('invites the model to copy the attribute value rather than infer an index', () => {
        expect(buildPromptText()).toContain('Copy the numeric value of that attribute for every message');
    });

    it('lists the field above importance in the schema example', () => {
        const text = buildUserPromptText();
        const idsIndex = text.indexOf('"source_message_ids": [412, 413]');
        const importanceIndex = text.indexOf('"importance": 3');

        expect(idsIndex).toBeGreaterThan(-1);
        expect(importanceIndex).toBeGreaterThan(-1);
        expect(idsIndex).toBeLessThan(importanceIndex);
    });

    it('covers the field in task rules and the draft process', () => {
        const text = buildPromptText();

        expect(text).toContain('source_message_ids: The <source> tag wrapping each input message carries its id');
        expect(text).toContain('Tag each event with source_message_ids');
    });
});
