const e=`---\r
# AGENT SKILLS STANDARD FIELDS (v2)\r
name: elaborative-interrogation-generator\r
description: "Generate elaborative interrogation prompts that deepen encoding through targeted why and how questions. Use when students memorise without understanding or need deeper processing of content."\r
disable-model-invocation: false\r
user-invocable: true\r
effort: medium\r
\r
# EXISTING FIELDS\r
\r
skill_id: "memory-learning-science/elaborative-interrogation-generator"\r
skill_name: "Elaborative Interrogation Prompt Generator"\r
domain: "memory-learning-science"\r
version: "1.0"\r
evidence_strength: "strong"\r
evidence_sources:\r
  - "Pressley et al. (1992) — Elaborative interrogation facilitates acquisition of confusing facts"\r
  - "Woloshyn et al. (1994) — Use of elaborative interrogation to help students acquire information consistent with prior knowledge"\r
  - "Dunlosky et al. (2013) — Elaborative interrogation rated moderate-utility learning strategy"\r
  - "McDaniel & Donnelly (1996) — Learning with analogy and elaborative interrogation"\r
  - "Ozgungor & Guthrie (2004) — Interactions among elaborative interrogation, knowledge, and interest in the process of constructing knowledge from text"\r
input_schema:\r
  required:\r
    - field: "topic"\r
      type: "string"\r
      description: "The concept, fact set, or content area students are learning"\r
    - field: "student_level"\r
      type: "string"\r
      description: "Age/year group and approximate prior knowledge level"\r
    - field: "prompt_count"\r
      type: "integer"\r
      description: "Number of elaborative prompts to generate (recommended 5–8)"\r
  optional:\r
    - field: "content_text"\r
      type: "string"\r
      description: "The specific text or content students are engaging with"\r
    - field: "prior_knowledge"\r
      type: "string"\r
      description: "What students already know that can be connected to this topic"\r
    - field: "student_profiles"\r
      type: "array"\r
      description: "From context engine: language levels, prior knowledge data"\r
    - field: "learning_objectives"\r
      type: "string"\r
      description: "Specific learning objectives the prompts should support"\r
output_schema:\r
  type: "object"\r
  fields:\r
    - field: "elaborative_prompts"\r
      type: "array"\r
      description: "Ordered list of why/how prompts with target knowledge and expected depth"\r
    - field: "implementation_guide"\r
      type: "string"\r
      description: "How to use the prompts — timing, grouping, written vs verbal"\r
    - field: "connection_prompts"\r
      type: "array"\r
      description: "Prompts that connect new learning to prior knowledge"\r
chains_well_with:\r
  - "retrieval-practice-generator"\r
  - "self-regulation-scaffold-generator"\r
  - "metacognitive-prompt-library"\r
  - "reading-comprehension-strategy-selector"\r
teacher_time: "3 minutes"\r
tags: ["elaboration", "encoding", "comprehension", "deep-processing", "questioning"]\r
---\r
\r
# Elaborative Interrogation Prompt Generator\r
\r
## What This Skill Does\r
\r
Generates a set of "why?" and "how does this connect?" prompts designed to deepen encoding by forcing students to generate explanations that link new information to existing knowledge. Unlike comprehension questions (which check understanding), elaborative interrogation prompts require students to explain *why* a fact is true or *how* it relates to something they already know — the act of generating the explanation strengthens the memory trace. AI is specifically valuable here because effective elaborative prompts must be pitched at the precise intersection of what students are learning and what they already know — too disconnected from prior knowledge and students can't generate explanations; too obvious and there's no elaboration needed.\r
\r
## Evidence Foundation\r
\r
Pressley et al. (1992) demonstrated that answering "why?" questions about factual information produced significantly better retention than reading the same facts, with effect sizes around 0.59. The mechanism is elaborative encoding — generating an explanation creates additional retrieval pathways to the information. Woloshyn et al. (1994) showed that elaborative interrogation is most effective when students have sufficient prior knowledge to generate plausible explanations — the strategy requires existing schemas to connect to. Dunlosky et al. (2013) rated elaborative interrogation as a "moderate utility" strategy, noting strong evidence for factual learning but less clarity on its effectiveness for complex conceptual learning. McDaniel & Donnelly (1996) demonstrated that elaborative interrogation combined with analogical reasoning produces stronger encoding than either strategy alone. Ozgungor & Guthrie (2004) found that the effectiveness of elaborative interrogation interacts with prior knowledge and interest — students with some relevant knowledge benefit most, while those with very low knowledge may struggle to generate explanations.\r
\r
## Input Schema\r
\r
The teacher must provide:\r
- **Topic:** The concept or content students are learning. *e.g. "Properties of metals and non-metals" / "Causes of the French Revolution" / "The structure of a sonnet"*\r
- **Student level:** Year group and prior knowledge. *e.g. "Year 9 Chemistry, mid-ability, have covered atomic structure"*\r
- **Prompt count:** Number of prompts needed. *e.g. 6*\r
\r
Optional (injected by context engine if available):\r
- **Content text:** The specific text, passage, or resource students are working with\r
- **Prior knowledge:** What relevant prior knowledge students have (improves prompt calibration)\r
- **Student profiles:** Language levels and individual prior knowledge data\r
- **Learning objectives:** Specific objectives the prompts should support\r
\r
## Prompt\r
\r
\`\`\`\r
You are an expert in the cognitive psychology of encoding and memory, specialising in elaborative processing. You have deep knowledge of Pressley et al.'s (1992) research on elaborative interrogation, Woloshyn et al.'s (1994) work on elaboration and prior knowledge, and McDaniel & Donnelly's (1996) research on elaboration and analogy.\r
\r
Your task is to generate {{prompt_count}} elaborative interrogation prompts for students learning about "{{topic}}" at the {{student_level}} level.\r
\r
The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."\r
\r
**Specific content:** {{content_text}} — if provided, generate prompts that target the key claims and relationships in this text. If not provided, generate prompts based on general subject knowledge of the topic.\r
**Student prior knowledge:** {{prior_knowledge}} — if provided, calibrate prompts to connect new learning to this existing knowledge. If not provided, assume standard prior knowledge for the stated year group and subject.\r
**Learning objectives:** {{learning_objectives}} — if provided, focus prompts on the most important learning targets. If not provided, target the core causal relationships and mechanisms within the topic.\r
**Student profiles:** {{student_profiles}} — if provided, adjust language complexity and provide differentiated versions where appropriate. If not provided, design for a typical mixed-ability class.\r
\r
Apply these evidence-based principles:\r
\r
1. **"Why?" is the core prompt type.** The primary mechanism of elaborative interrogation is generating explanations for why facts or relationships are true. Every prompt should begin with or be reducible to a "why?" question. "What?" and "how?" are useful secondary types but only when they force explanation, not recall.\r
\r
2. **Target causal relationships, not isolated facts.** Elaborative prompts should target the relationships between concepts, causes and effects, and mechanisms — not definitions or labels. "Why do metals conduct electricity?" forces elaboration. "What is a metal?" forces recall. Both are useful but only the first is elaborative interrogation.\r
\r
3. **Calibrate to prior knowledge (Woloshyn et al., 1994).** Prompts only work if students have enough prior knowledge to generate a plausible explanation. If students know nothing about a topic, they can't elaborate — they need direct instruction first. Calibrate each prompt to connect to something students already know.\r
\r
4. **Include connection prompts (McDaniel & Donnelly, 1996).** Some prompts should explicitly ask students to connect new information to analogous concepts they've already learned. "How is this similar to...?" or "Why might this work in the same way as...?"\r
\r
5. **Vary the prompt type.** Include a mix of:\r
   - **Causal why:** "Why does X happen?"\r
   - **Contrastive why:** "Why does X happen but not Y?"\r
   - **Mechanism how:** "How does X lead to Y?"\r
   - **Connection:** "How is X similar to Y, which you learned about in [previous topic]?"\r
   - **Predictive:** "Based on what you know about X, what would you predict about Z? Why?"\r
\r
6. **Avoid disguised recall questions.** A prompt that has a single correct factual answer is a recall question, not an elaborative prompt. Elaborative prompts should have multiple plausible explanations that students can generate from their existing knowledge.\r
\r
Return your output in this exact format:\r
\r
## Elaborative Interrogation Prompts: [Topic]\r
\r
**For:** [Student level]\r
**Prior knowledge assumed:** [What students need to know for these prompts to work]\r
\r
### Prompts\r
\r
For each prompt:\r
- The prompt text\r
- **Type:** [Causal why / Contrastive why / Mechanism how / Connection / Predictive]\r
- **Targets:** [What knowledge or relationship this prompt deepens]\r
- **Prior knowledge activated:** [What existing knowledge students draw on to answer]\r
\r
### Connection Prompts\r
\r
2–3 prompts specifically connecting this topic to previously learned material.\r
\r
### Implementation Guide\r
\r
- When to use (during reading, after instruction, as homework)\r
- How to structure (individual written → pair discussion → class share)\r
- Time needed\r
- What to do if students can't generate explanations (prior knowledge is insufficient)\r
\r
**Self-check before returning output:** Verify that (a) every prompt requires explanation, not just recall, (b) prompts are calibrated to the stated prior knowledge level — students can plausibly generate answers, (c) no prompt has a single-word or single-fact answer, and (d) the prompts target relationships and mechanisms, not definitions.\r
\`\`\`\r
\r
## Example Output\r
\r
**Scenario:** *Topic: "Adaptations of desert animals" / Student level: "Year 8 Biology, have covered basic cell structure and habitats/ecosystems" / Prompt count: 6*\r
\r
---\r
\r
## Elaborative Interrogation Prompts: Adaptations of Desert Animals\r
\r
**For:** Year 8 Biology\r
**Prior knowledge assumed:** Students understand that cells need water to function, know what a habitat is, understand that organisms are affected by their environment, have encountered the idea of food chains. They have NOT yet studied evolution or natural selection in detail.\r
\r
### Prompts\r
\r
**1.** The fennec fox has enormous ears compared to its body size, while the Arctic fox has very small ears. Why might ear size be connected to surviving in a hot desert versus a cold tundra?\r
\r
- **Type:** Contrastive why\r
- **Targets:** Surface area to volume ratio as a mechanism for heat regulation; connection between body features and environmental pressures\r
- **Prior knowledge activated:** Students know hot and cold environments exist; they can reason that big ears = more skin surface = more heat loss, even if they haven't formally studied SA:V ratio\r
\r
**2.** Many desert animals are nocturnal — they're active at night and sleep during the day. Why would being active at night help an animal survive in the desert, even though it's harder to find food in the dark?\r
\r
- **Type:** Causal why\r
- **Targets:** Behavioural adaptation as energy/water conservation strategy; trade-off reasoning (accepting one disadvantage to gain a bigger advantage)\r
- **Prior knowledge activated:** Students know deserts are hot during the day and cooler at night; they understand that animals need water and energy\r
\r
**3.** Camels can survive for weeks without drinking water, but they can't survive without food for nearly as long. Why do you think water is a bigger survival challenge than food in the desert? Think about what you know about cells.\r
\r
- **Type:** Mechanism how (why water > food for survival)\r
- **Targets:** Connecting cellular biology (cells need water for chemical reactions, transport, structure) to organism-level adaptation; building understanding that adaptations solve specific environmental problems\r
- **Prior knowledge activated:** Cell structure — students learned that cells are mostly water, that chemical reactions in cells require water\r
\r
**4.** The thorny devil lizard has spiny skin covered in tiny grooves that channel rainwater toward its mouth. If you were designing a solution to collect water in a dry environment, what principles would you use? Why does the thorny devil's solution work so well?\r
\r
- **Type:** Predictive + Mechanism how\r
- **Targets:** Structure-function relationship; the idea that physical features can solve environmental problems through passive mechanisms (capillary action, surface tension)\r
- **Prior knowledge activated:** Students' general knowledge of water behaviour; connecting to any prior work on materials/surfaces in science or DT\r
\r
**5.** Desert plants like cacti store water in their thick stems, but most plants you see in the UK don't have thick stems at all. Why don't UK plants need to store water? Why would it actually be a disadvantage for a UK plant to have a thick, fleshy stem like a cactus?\r
\r
- **Type:** Contrastive why\r
- **Targets:** Adaptation as environment-specific — features that are advantageous in one environment may be disadvantageous in another; understanding that adaptations have costs (thick stems use energy, are heavy, attract herbivores)\r
- **Prior knowledge activated:** Students' knowledge of UK climate (frequent rain) and everyday experience of local plants\r
\r
**6.** Kangaroo rats in the Sonoran Desert never drink water — they get all their water from the dry seeds they eat. How is it possible to get water from a dry seed? Think about what happens during digestion and chemical reactions.\r
\r
- **Type:** Mechanism how\r
- **Targets:** Metabolic water production; connecting chemistry (chemical reactions produce water as a by-product) to biology (digestion as a chemical process); deep processing of adaptation as a metabolic, not just behavioural or structural, phenomenon\r
- **Prior knowledge activated:** Students have covered basic chemical reactions and know that digestion breaks food down; they may know that respiration produces water\r
\r
### Connection Prompts\r
\r
**C1.** In the ecosystems topic last term, you learned that food chains show energy flow through a habitat. Desert food chains tend to be shorter than rainforest food chains. Why might there be fewer "links" in a desert food chain? How does this connect to what you know about energy and the scarcity of resources?\r
\r
**C2.** When we studied cells, we learned that water moves across cell membranes through osmosis. A desert animal that loses too much water faces a serious problem at the cellular level. Using what you know about osmosis, explain what would happen to an animal's cells if it became severely dehydrated. Why does this make water conservation literally a life-or-death issue?\r
\r
### Implementation Guide\r
\r
- **When to use:** After initial instruction on desert adaptations (not before — students need the new content to elaborate on). Ideal as a 15-minute activity in the second half of a lesson, or as structured homework.\r
- **Structure:** Individual written response first (5 minutes per prompt — assign 3 prompts per student, not all 6). Then pair discussion: compare answers with a partner. Finish with class share on one prompt, focusing on the range of plausible explanations generated.\r
- **Time needed:** 15–20 minutes for 3 prompts (individual + pair discussion). Do not rush — the learning happens in the generation of explanations, which takes time.\r
- **If students can't generate explanations:** This signals insufficient prior knowledge. For Prompt 3 (cells and water), students may need a brief reminder of cell structure. For Prompt 6 (metabolic water), this is a stretch — if students can't answer, use it as a teacher-led discussion rather than individual writing. Do not provide the answer immediately — the struggle to generate an explanation is where the learning happens, as long as the struggle is productive rather than impossible.\r
- **Important:** Accept multiple plausible explanations. These are elaborative prompts, not quiz questions with a single correct answer. A student who explains nocturnal behaviour as "avoiding predators that hunt by day" is generating a valid elaboration even if the "textbook answer" is about heat and water conservation.\r
\r
---\r
\r
## Known Limitations\r
\r
1. **Elaborative interrogation requires sufficient prior knowledge to generate explanations.** If students have no relevant prior knowledge (e.g., Year 7 students with no science background attempting Prompt 6 about metabolic water), they cannot elaborate and the prompts become frustrating rather than productive. Ozgungor & Guthrie (2004) found this interaction between elaboration and prior knowledge is significant. Teachers must verify that the "prior knowledge assumed" section matches their students' actual knowledge.\r
\r
2. **The evidence base is strongest for factual/conceptual learning, not procedural skills.** Pressley et al. (1992) and most elaborative interrogation studies used factual materials. The strategy transfers less clearly to mathematical procedures, physical skills, or creative tasks where "why?" questions may not deepen encoding in the same way.\r
\r
3. **Elaborative interrogation is more effective than re-reading but less effective than retrieval practice.** Dunlosky et al. (2013) rated it as "moderate utility" rather than "high utility." It is best used as a complement to retrieval practice and spaced practice, not as a replacement. Use elaborative prompts during initial encoding, then switch to retrieval practice for consolidation.\r
`;export{e};
