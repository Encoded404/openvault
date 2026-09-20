/**
 * English event extraction few-shot examples.
 * 7 examples following SFW → kink gradient.
 *
 * Inputs mirror the production `<source source_message_id="…">` wrapper so the
 * model can copy ids instead of guessing at indices, and every ideal output
 * carries `source_message_ids` because the contract requires it.
 */

export const EXAMPLES = [
    {
        label: 'Discovery (EN/SFW)',
        input: `<source source_message_id="412" role="assistant">[Mireille]: *Ranger Mireille crouches over the cold fire pit and presses her palm flat to the ash. Still warm. She sweeps her torch across the shelter — sleeping roll shoved aside, a pack left open, half-eaten rations scattered like someone left in a hurry.*</source>

<source source_message_id="413" role="assistant">[Mireille]: "Someone was here within the hour," she says, pulling a scrap of cloth from the entrance post. The color matches the expedition uniform.</source>`,
        thinking: `Step 1: Mireille -> found -> warm ash + disturbed roll + cloth; hour-old
Step 2: Cross-ref -> no memories of shelter or route
Step 3: Progression -> new discovery; first expedition evidence
Step 4: Format -> importance = 3; not transient; physical evidence; ids -> 412, 413`,
        output: `{
  "events": [{
    "summary": "Ranger Mireille found a recently abandoned shelter with warm ash, scattered rations, and an expedition-colored cloth — evidence someone was present within the last hour",
    "source_message_ids": [412, 413],
    "importance": 3,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Mireille"],
    "witnesses": ["Mireille"],
    "location": "Abandoned shelter",
    "is_secret": false,
    "emotional_impact": { "Mireille": "urgency" },
    "relationship_impact": {}
  }]
}`,
    },
    {
        label: 'Combat injury (EN/Moderate)',
        input: `<source source_message_id="418" role="assistant">[Corin]: The attacker came out of the alley fast — blade already drawn. Corin caught the first slash on his forearm and threw himself back against the wall. The second strike got him below the ribs.</source>

<source source_message_id="419" role="user">[Petra]: *Petra yanked him by the collar and hauled him around the corner before the man could follow.* "How deep?" she demanded, pressing her hand over the wound.</source>

<source source_message_id="420" role="assistant">[Corin]: "Keep moving," Corin said. His voice was steady. His legs weren't.</source>`,
        thinking: `Step 1: Attacker -> slashed -> Corin(forearm) + stabbed(below ribs); Petra -> pulled -> Corin; wound depth = unknown
Step 2: Cross-ref -> no memories of attacker or confrontation
Step 3: Progression -> new event; first Corin injury; new threat
Step 4: Format -> importance = 4; Petra -> protected Corin(lethal threat); ids -> 418, 419, 420`,
        output: `{
  "events": [{
    "summary": "An unidentified attacker stabbed Corin below the ribs and slashed his forearm in an alley ambush before Petra pulled him to safety; wound depth is unknown",
    "source_message_ids": [418, 419, 420],
    "importance": 4,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Corin", "Petra"],
    "witnesses": ["Corin", "Petra"],
    "location": "Alley",
    "is_secret": false,
    "emotional_impact": { "Corin": "pain", "Petra": "alarm" },
    "relationship_impact": { "Petra→Corin": "physically protected Corin under lethal threat" }
  }]
}`,
    },
    {
        label: 'First sexual contact (EN/Explicit)',
        input: `<source source_message_id="425" role="assistant">[Sabine]: Sabine pushed him down by the chest and climbed over him, knees bracketing his hips. She pulled her hair tie loose without looking away. "Tell me if you want me to stop," she said. Not a question.</source>

<source source_message_id="426" role="assistant">[Sabine]: She rocked forward slowly, taking him in inch by inch, watching his mouth fall open. His hands came up to her hips — not to stop her, just to hold on. She set the pace, low and deliberate, learning what made his breath catch.</source>`,
        thinking: `Step 1: Sabine -> pushed -> Theo down + consent check; began penetration; Theo = responsive
Step 2: Cross-ref -> no sexual contact memories
Step 3: Progression -> new dynamic; first penetrative encounter; Sabine controls pace
Step 4: Format -> importance = 4; Sabine = dominant(initiator + pace); ids -> 425, 426`,
        output: `{
  "events": [{
    "summary": "Sabine initiated penetrative sex with Theo for the first time, setting the pace from above and issuing an explicit consent check before proceeding",
    "source_message_ids": [425, 426],
    "importance": 4,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Sabine", "Theo"],
    "witnesses": ["Sabine", "Theo"],
    "location": null,
    "is_secret": false,
    "emotional_impact": { "Sabine": "control", "Theo": "pleasure" },
    "relationship_impact": { "Sabine→Theo": "sexual relationship initiated with Sabine directing pace and position" }
  }]
}`,
    },
    {
        label: 'Restraint scene (EN/Kink)',
        input: `<source source_message_id="431" role="assistant">[Inara]: "Wrists." Inara held up the silk cord and waited.</source>

<source source_message_id="432" role="user">[Rook]: *Rook extended both hands without hesitation. She looped and knotted in two passes — secure but not punishing — then tested the tension with a firm tug.* "Word?" she asked. "Copper."</source>

<source source_message_id="433" role="assistant">[Inara]: She walked slowly around behind him, let her fingers trail up the back of his neck. He didn't turn his head. "Good. Kneel." He went down. She felt the quality of his attention shift — the particular stillness that meant he was inside the scene now, fully.</source>`,
        thinking: `Step 1: Inara -> bound -> Rook(wrists, silk cord); safeword = copper; kneel -> obeyed; Rook = in scene
Step 2: Cross-ref -> no restraint or D/s memories
Step 3: Progression -> new dynamic; first restraint + safeword + positional command
Step 4: Format -> importance = 4; is_secret = true; ids -> 431, 432, 433`,
        output: `{
  "events": [{
    "summary": "Inara bound Rook's wrists with silk cord, confirmed safeword 'copper', and commanded him to kneel — establishing their first physical restraint scene",
    "source_message_ids": [431, 432, 433],
    "importance": 4,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Inara", "Rook"],
    "witnesses": ["Inara", "Rook"],
    "location": null,
    "is_secret": true,
    "emotional_impact": { "Inara": "control", "Rook": "submission" },
    "relationship_impact": { "Inara→Rook": "dominant/submissive dynamic established; safeword 'copper' on record" }
  }]
}`,
    },
    {
        label: 'Dedup - scene progression (EN/Edge)',
        input: `<source source_message_id="437" role="assistant">[Inara]: Inara crouched in front of him and tilted his chin up with two fingers. His eyes were glassy — not distress, that softer thing. "Copper?" she asked quietly.</source>

<source source_message_id="438" role="user">[Rook]: "Green," he said. Voice noticeably thicker than before.</source>

<source source_message_id="439" role="assistant">[Inara]: She studied his face for a long moment, then stood and stepped back.</source>

<established_memories>Inara bound Rook's wrists with silk cord, confirmed safeword 'copper', and commanded him to kneel — establishing their first physical restraint scene</established_memories>`,
        thinking: `Step 1: Inara -> welfare check; Rook -> green; voice = thicker; Inara -> assessed face
Step 2: Cross-ref -> existing: restraint + safeword + kneel; core action = same
Step 3: Progression -> same dynamic; voice thicker -> subspace shift; Inara pausing = calibration
Step 4: Format -> importance = 2; state change in established scene; ids -> 437, 438, 439`,
        output: `{
  "events": [{
    "summary": "Inara checked Rook mid-scene; he confirmed green with a noticeably thicker voice indicating subspace deepening",
    "source_message_ids": [437, 438, 439],
    "importance": 2,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Inara", "Rook"],
    "witnesses": ["Inara", "Rook"],
    "location": null,
    "is_secret": false,
    "emotional_impact": { "Rook": "deepening submission" },
    "relationship_impact": {}
  }]
}`,
    },
    {
        label: 'Conversational commitment (EN/SFW)',
        input: `<source source_message_id="443" role="user">[Yolanda]: "I can't keep covering Tuesday shifts," Yolanda said, dropping into the chair across from Marcus. "It's been three months."</source>

<source source_message_id="444" role="assistant">[Marcus]: Marcus looked up from his laptop. "You're right. I'll talk to Chen this week — I'll get you off the rotation."</source>

<source source_message_id="445" role="user">[Yolanda]: "I need that in writing. Last time you said 'this week' it took six weeks."</source>

<source source_message_id="446" role="assistant">[Marcus]: "Fair." He pulled out his phone. "Logging it right now. Tuesday rotation, removed. Done." Yolanda watched him type. "Thank you."</source>`,
        thinking: `Step 1: Yolanda -> raised -> Tuesday grievance(3 months); Marcus -> commit -> talk to Chen; Yolanda -> demanded -> documentation; Marcus -> logged -> calendar
Step 2: Cross-ref -> no memories of shift arrangement
Step 3: Progression -> new commitment; calendar entry = durable action
Step 4: Format -> importance = 3; chair-drop + thanks = transient; logged commitment = durable; ids -> 443, 444, 445, 446`,
        output: `{
  "events": [{
    "summary": "Marcus committed to removing Yolanda from Tuesday shift rotation by speaking to Chen this week, and logged it in his calendar on the spot when she demanded documented follow-through",
    "source_message_ids": [443, 444, 445, 446],
    "importance": 3,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Marcus", "Yolanda"],
    "witnesses": ["Marcus", "Yolanda"],
    "location": null,
    "is_secret": false,
    "emotional_impact": {},
    "relationship_impact": { "Marcus→Yolanda": "explicit commitment to resolve three-month schedule grievance, calendar-logged" }
  }]
}`,
    },
    {
        label: 'Timestamp — transient and durable (EN/SFW)',
        input: `<source source_message_id="451" role="assistant">[Lev]: Time: 8:45 AM — Thursday, March 6, 2025
Kitchen — Nadia's Apartment — Overcast, 38°F

Lev grabbed his jacket from the back of the chair. "I'll be at the studio until eight, maybe nine."</source>

<source source_message_id="452" role="user">[Nadia]: "I'll save you dinner," Nadia said, not looking up from the stove.
"You don't have to."
"I know." She finally looked at him. "Also — I made the appointment. Couples counseling. First session is the 14th at six."</source>

<source source_message_id="453" role="assistant">[Lev]: Lev went still. "Okay," he said, after a moment. "I'll be there."</source>`,
        thinking: `Step 1: Timestamp present; Lev -> studio(until 8-9 PM); Nadia -> save dinner; Nadia -> booked -> counseling(March 14, 6 PM); Lev -> committed -> attend
Step 2: Cross-ref -> no memories of either plan
Step 3: Progression -> two commitments; studio/dinner = tonight(transient); counseling = durable(spans days)
Step 4: Format -> two events; temporal anchor -> strip location + weather; studio = importance 2(transient); counseling = importance 4(durable); ids -> 451/452 and 452/453`,
        output: `{
  "events": [
    {
      "summary": "Lev told Nadia he would be at the studio until 8 or 9 PM; she offered to save him dinner",
      "source_message_ids": [451, 452],
      "importance": 2,
      "temporal_anchor": "Time: 8:45 AM — Thursday, March 6, 2025",
      "is_transient": true,
      "characters_involved": ["Lev", "Nadia"],
      "witnesses": ["Lev", "Nadia"],
      "location": "Nadia's Apartment",
      "is_secret": false,
      "emotional_impact": {},
      "relationship_impact": {}
    },
    {
      "summary": "Nadia booked their first couples counseling session for March 14 at 6 PM; Lev committed to attend after a moment's pause",
      "source_message_ids": [452, 453],
      "importance": 4,
      "temporal_anchor": "Time: 8:45 AM — Thursday, March 6, 2025",
      "is_transient": false,
      "characters_involved": ["Nadia", "Lev"],
      "witnesses": ["Nadia", "Lev"],
      "location": null,
      "is_secret": false,
      "emotional_impact": { "Nadia": "resolve", "Lev": "guarded acceptance" },
      "relationship_impact": { "Nadia→Lev": "initiated couples counseling; Lev agreed — first concrete step toward addressing the relationship" }
    }
  ]
}`,
    },
];
