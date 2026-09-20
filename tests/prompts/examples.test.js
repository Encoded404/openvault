import { describe, expect, it } from 'vitest';
import { EXAMPLES as EN_EXAMPLES } from '../../src/prompts/events/examples/en.js';
import { EXAMPLES as RU_EXAMPLES } from '../../src/prompts/events/examples/ru.js';

const ALL_EXAMPLES = [...EN_EXAMPLES, ...RU_EXAMPLES];

/**
 * Collect the ids declared by the `<source>` wrappers of an example input.
 * @param {string} input - Example input text
 * @returns {number[]} Source ids in order of appearance
 */
function getSourceIds(input) {
    return [...input.matchAll(/<source source_message_id="(\d+)"/g)].map((match) => Number(match[1]));
}

describe('event extraction few-shot examples', () => {
    it('wraps every input message in a <source> tag so ids can be copied', () => {
        for (const example of ALL_EXAMPLES) {
            expect(getSourceIds(example.input).length, example.label).toBeGreaterThan(0);
        }
    });

    it('carries source_message_ids on every ideal event', () => {
        for (const example of ALL_EXAMPLES) {
            const { events } = JSON.parse(example.output);
            expect(events.length, example.label).toBeGreaterThan(0);

            for (const event of events) {
                expect(Array.isArray(event.source_message_ids), example.label).toBe(true);
                expect(event.source_message_ids.length, example.label).toBeGreaterThan(0);
            }
        }
    });

    it('only cites source ids that appear in the same example input', () => {
        for (const example of ALL_EXAMPLES) {
            const available = new Set(getSourceIds(example.input));
            const { events } = JSON.parse(example.output);

            for (const event of events) {
                for (const id of event.source_message_ids) {
                    expect(available.has(id), `${example.label} cites unknown id ${id}`).toBe(true);
                }
            }
        }
    });

    it('lists source_message_ids directly after summary in the ideal output', () => {
        for (const example of ALL_EXAMPLES) {
            expect(example.output.indexOf('"source_message_ids"'), example.label).toBeGreaterThan(
                example.output.indexOf('"summary"')
            );
        }
    });

    it('mentions the attribution step in every draft process', () => {
        for (const example of ALL_EXAMPLES) {
            expect(example.thinking, example.label).toContain('ids ->');
        }
    });
});
