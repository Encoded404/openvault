/**
 * Russian event extraction few-shot examples.
 * 7 examples following SFW → kink gradient.
 *
 * Inputs mirror the production `<source source_message_id="…">` wrapper so the
 * model can copy ids instead of guessing at indices, and every ideal output
 * carries `source_message_ids` because the contract requires it.
 */

export const EXAMPLES = [
    {
        label: 'Confession (RU/SFW)',
        input: `<source source_message_id="512" role="assistant">[Тоня]: Тоня поставила кружку на стол и не подняла глаз.
«Я уволилась три недели назад,» — сказала она. — «Ты первый, кому я это говорю.»</source>

<source source_message_id="513" role="user">[Рустам]: Рустам замер. Потом тихо спросил: «Ты нормально?»
«Нет.» Она наконец посмотрела на него. «Но теперь немного лучше.»</source>`,
        thinking: `Step 1: Tonya -> resigned(3 weeks ago); Rustam = first to know; she admitted not ok + feels better
Step 2: Cross-ref -> no established memories
Step 3: Progression -> new event; secret disclosed; trust + vulnerability
Step 4: Format -> importance = 4; first disclosure + trust shift; values in Russian; ids -> 512, 513`,
        output: `{
  "events": [{
    "summary": "Тоня призналась Рустаму, что уволилась три недели назад — он первый, кому она это рассказала",
    "source_message_ids": [512, 513],
    "importance": 4,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Тоня", "Рустам"],
    "witnesses": ["Тоня", "Рустам"],
    "location": null,
    "is_secret": false,
    "emotional_impact": { "Тоня": "уязвимость и облегчение", "Рустам": "тревога" },
    "relationship_impact": { "Тоня→Рустам": "оказанное исключительное доверие" }
  }]
}`,
    },
    {
        label: 'First kiss (RU/Moderate)',
        input: `<source source_message_id="518" role="assistant">[Арсений]: *Вероника убирала со стола. Арсений подошёл сзади и накрыл её руку своей ладонью.*
«Не уходи ещё,» — сказал он. — «Пожалуйста.»</source>

<source source_message_id="519" role="user">[Вероника]: Она развернулась. Они стояли так близко, что она слышала его дыхание.
«Арсений,» — начала она — но он уже наклонился, и слова пропали.</source>

<source source_message_id="520" role="assistant">[Арсений]: Поцелуй был долгим. Когда он закончился, она не отступила.</source>`,
        thinking: `Step 1: Arseny -> asked -> stay; hand over hers; she turned; he -> kissed -> first; long; she = didn't pull back
Step 2: Cross-ref -> no romantic contact memories
Step 3: Progression -> new event; first kiss; mutual acceptance
Step 4: Format -> importance = 4; first romantic contact; values in Russian; ids -> 518, 519, 520`,
        output: `{
  "events": [{
    "summary": "Арсений поцеловал Веронику первым — долгий поцелуй, она не отстранилась",
    "source_message_ids": [518, 519, 520],
    "importance": 4,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Арсений", "Вероника"],
    "witnesses": ["Арсений", "Вероника"],
    "location": null,
    "is_secret": false,
    "emotional_impact": { "Вероника": "смятение и желание", "Арсений": "решимость" },
    "relationship_impact": { "Арсений↔Вероника": "первый романтический контакт" }
  }]
}`,
    },
    {
        label: 'Sexual scene (RU/Explicit)',
        input: `<source source_message_id="524" role="assistant">[Злата]: Злата толкнула его на кровать и встала над ним на коленях. Нурлан потянулся к ней, но она поймала его запястья и прижала к подушке.
«Тихо,» — сказала она. — «Моя очередь.»</source>

<source source_message_id="525" role="user">[Нурлан]: Она опустилась на его член медленно, до конца, выдыхая сквозь зубы. Нурлан застонал. Она начала двигаться — ровно, с контролем, наблюдая за его лицом.</source>`,
        thinking: `Step 1: Zlata -> pushed -> Nurlan(bed) + pinned wrists + "quiet"; lowered onto cock; rhythm = controlled; watched face
Step 2: Cross-ref -> no sexual contact memories
Step 3: Progression -> new event; first penetration; Zlata = dominant; Nurlan = restrained
Step 4: Format -> importance = 4; power dynamic from first contact; values in Russian; ids -> 524, 525`,
        output: `{
  "events": [{
    "summary": "Злата прижала запястья Нурлана и первой опустилась на его член, задав доминирующий ритм",
    "source_message_ids": [524, 525],
    "importance": 4,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Злата", "Нурлан"],
    "witnesses": ["Злата", "Нурлан"],
    "location": "Спальня",
    "is_secret": false,
    "emotional_impact": { "Злата": "контроль и возбуждение", "Нурлан": "удовольствие и подчинение" },
    "relationship_impact": { "Злата→Нурлан": "первый сексуальный контакт, инициирован с доминирования" }
  }]
}`,
    },
    {
        label: 'Power dynamic (RU/Kink)',
        input: `<source source_message_id="530" role="assistant">[Карина]: «Встань у стены,» — сказала Карина. — «Руки над головой.»</source>

<source source_message_id="531" role="user">[Тимур]: Тимур подчинился. Она зашла за его спину, накинула шёлковый шарф на запястья и завязала на балке. Подтянула узел.
«Цвет?» — спросила тихо.
«Зелёный.»</source>

<source source_message_id="532" role="assistant">[Карина]: Она провела ладонью по его спине, не торопясь, сверху вниз — и резко шлёпнула ладонью. Тимур вздрогнул всем телом и выдохнул сквозь зубы.</source>`,
        thinking: `Step 1: Karina -> ordered -> Timur(wall, hands up); tied wrists(scarf, beam); color = green; hand -> back -> slap; Timur -> flinched
Step 2: Cross-ref -> no restraint play memories
Step 3: Progression -> new event; first bondage + color system + first impact
Step 4: Format -> importance = 4; D/s dynamic + restraint + consent; values in Russian; ids -> 530, 531, 532`,
        output: `{
  "events": [{
    "summary": "Карина привязала запястья Тимура шарфом к балке, провела цветовую проверку и ударила ладонью по спине после его зелёного ответа",
    "source_message_ids": [530, 531, 532],
    "importance": 4,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Карина", "Тимур"],
    "witnesses": ["Карина", "Тимур"],
    "location": null,
    "is_secret": true,
    "emotional_impact": { "Карина": "контроль", "Тимур": "подчинение" },
    "relationship_impact": { "Карина→Тимур": "установлена динамика доминирования с протоколом согласия" }
  }]
}`,
    },
    {
        label: 'Dedup - continuation (RU/Edge)',
        input: `<source source_message_id="536" role="assistant">[Злата]: Злата ускорила ритм. Нурлан приподнял бёдра ей навстречу — она резко прижала его обратно.</source>

<source source_message_id="537" role="user">[Нурлан]: «Не двигайся,» — выдохнула она. Он замер. Она продолжила — медленнее теперь, намеренно, пока его дыхание не стало рваным.</source>

<established_memories>
[★★★★] Злата прижала запястья Нурлана и первой опустилась на его член, задав доминирующий ритм
</established_memories>`,
        thinking: `Step 1: Zlata -> sped up; Nurlan -> hips rose -> she pressed back; "don't move"; she -> slowed deliberately; breathing = ragged
Step 2: Cross-ref -> existing: "pinned wrists + set dominant rhythm"
Step 3: Progression -> same position; he broke control -> she corrected; slowing = control escalation
Step 4: Format -> importance = 2; minor escalation in established scene; values in Russian; ids -> 536, 537`,
        output: `{
  "events": [{
    "summary": "Нурлан попытался двигать бёдрами, Злата прижала его обратно и приказала не двигаться, замедлив ритм намеренно",
    "source_message_ids": [536, 537],
    "importance": 2,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Злата", "Нурлан"],
    "witnesses": ["Злата", "Нурлан"],
    "location": null,
    "is_secret": false,
    "emotional_impact": { "Нурлан": "вынужденное подчинение" },
    "relationship_impact": {}
  }]
}`,
    },
    {
        label: 'Conversational commitment (RU/SFW)',
        input: `<source source_message_id="542" role="user">[Глеб]: — Я не смогу забирать Матвея из сада по средам, — сказал Глеб, завязывая шнурки. — Совещания сдвинули.</source>

<source source_message_id="543" role="assistant">[Ирина]: — Ладно. Тогда среды мои, — ответила Ирина, не отрываясь от ноутбука. — Но пятницы твои без исключений. И звони, если задерживаешься — не пиши, именно звони.</source>

<source source_message_id="544" role="user">[Глеб]: — Договорились. — Он встал. — Ключи у тебя?</source>`,
        thinking: `Step 1: Gleb -> can't pick up Matvey(Wed, meetings); Irina -> takes Wed; Gleb -> takes Fri(no exceptions); Irina -> demands -> calls not texts if late; Gleb -> agreed
Step 2: Cross-ref -> no matches
Step 3: Progression -> new schedule + communication rules
Step 4: Format -> pickup split + call rule = durable; standing + keys = momentary; importance = 3; values in Russian; ids -> 542, 543`,
        output: `{
  "events": [{
    "summary": "Глеб и Ирина договорились: среды она забирает Матвея, пятницы он — без исключений, при задержке звонить, не писать",
    "source_message_ids": [542, 543],
    "importance": 3,
    "temporal_anchor": null,
    "is_transient": false,
    "characters_involved": ["Глеб", "Ирина"],
    "witnesses": ["Глеб", "Ирина"],
    "location": null,
    "is_secret": false,
    "emotional_impact": {},
    "relationship_impact": { "Глеб↔Ирина": "установлен новый график и правило коммуникации при задержках" }
  }]
}`,
    },
    {
        label: 'Timestamp with transient and durable (RU/SFW)',
        input: `<source source_message_id="548" role="assistant">[Олег]: [ 🕒 Суббота, 14 сентября 2024. 11:20 | 🏠 Кухня | ☁️ Пасмурно ]
Олег посмотрел на часы. «Выезжаем в два, не позже — иначе встанем в пробке».</source>

<source source_message_id="549" role="user">[Диана]: Диана налила кофе. «Хорошо. Только я заеду к маме завтра после работы, занесу ей таблетки — она не может сама в аптеку».</source>

<source source_message_id="550" role="assistant">[Олег]: «Понял», — кивнул Олег. — «Напиши, когда будешь выезжать оттуда».</source>`,
        thinking: `Step 1: Timestamp header; Oleg -> departure(2 PM, avoid traffic); Diana -> visit mom(tomorrow, medicine); Oleg -> asked -> text when leaving
Step 2: Cross-ref -> no matches
Step 3: Progression -> two commitments; departure = today(transient); mom visit = tomorrow(durable, third person)
Step 4: Format -> anchor strips emojis + location + weather; departure = transient; mom visit = durable; values in Russian; ids -> 548 and 549, 550`,
        output: `{
  "events": [{
    "summary": "Олег и Диана договорились выехать в 14:00, чтобы не попасть в пробки",
    "source_message_ids": [548],
    "importance": 3,
    "temporal_anchor": "Суббота, 14 сентября 2024. 11:20",
    "is_transient": true,
    "characters_involved": ["Олег", "Диана"],
    "witnesses": ["Олег", "Диана"],
    "location": "Кухня",
    "is_secret": false,
    "emotional_impact": {},
    "relationship_impact": {}
  }, {
    "summary": "Диана пообещала заехать к маме завтра после работы и отвезти ей таблетки",
    "source_message_ids": [549, 550],
    "importance": 3,
    "temporal_anchor": "Суббота, 14 сентября 2024. 11:20",
    "is_transient": false,
    "characters_involved": ["Диана"],
    "witnesses": ["Олег", "Диана"],
    "location": null,
    "is_secret": false,
    "emotional_impact": {},
    "relationship_impact": { "Диана→Олег": "взяла на себя обязательство, он в курсе графика" }
  }]
}`,
    },
];
