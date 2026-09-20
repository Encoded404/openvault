/**
 * JSON output schema for event extraction.
 */

import { TEMPORAL_ANCHOR_RULE } from '../shared/rules.js';

export const EVENT_SCHEMA = `Output EXACTLY ONE JSON object with this structure:

{
  "events": [
    {
      "summary": "8-25 word description of what happened, past tense",
      "source_message_ids": [412, 413],
      "importance": 3,
      "temporal_anchor": null,
      "is_transient": false,
      "characters_involved": ["CharacterName"],
      "witnesses": ["CharacterName", "OtherCharacter"],
      "location": null,
      "is_secret": false,
      "emotional_impact": {"CharacterName": "emotion description"},
      "relationship_impact": {"CharacterA->CharacterB": "how relationship changed"}
    }
  ]
}

FIELD DEFINITIONS:
- source_message_ids: REQUIRED on every event. The input wraps each message in a <source> tag carrying its id, like <source source_message_id="412">. Copy the numeric value of that attribute for every message whose text supports this event. Always a JSON array of integers, even for a single source. Never invent an id and never include one that is not shown in the input.
- characters_involved: Characters who actively participated or were directly affected (the main actors).
- witnesses: ALL characters who would know this event occurred. MUST include characters_involved PLUS any present/observers. In a 1-on-1 scene, BOTH characters are witnesses.
- is_secret: true ONLY for hidden actions (internal thoughts, secret plots). Most events are false.
- ${TEMPORAL_ANCHOR_RULE}
- is_transient: true for short-term plans or temporary states ("going to wash up", "waiting 10 min"). false for permanent facts or completed actions.

FORMAT RULES:
1. Top level MUST be a JSON object { }, NEVER a bare array [ ].
2. The "events" key MUST always be present. If nothing found: "events": []. Do not just stop generating.
3. Do NOT wrap in markdown code blocks.
4. Keep character names exactly as they appear in the input.
5. NEVER use string concatenation ("+") inside JSON values. Write all text as a single, unbroken line within the quotes.
6. Every event MUST carry "source_message_ids" as an array of integers copied from the <source> tags. An event without it is discarded.`;
