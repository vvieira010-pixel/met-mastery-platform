export const AI_EXERCISE_PROMPTS = {
  mcq: `Create one B1-level multiple choice question for an MET student.
Requirements:
- Use only B1-level vocabulary. Max 15 words per sentence in the question
- For healthcare/medical content, verify collocations are natural English
- The correct answer must be definitively correct — no ambiguous options where another could also work
- Distractors must be plausible but clearly wrong
- Match the MET exam style: inference, purpose, or attitude questions preferred over surface detail
Return JSON only with fields: type "mcq", question, options (array of 4 strings), correct (0-3 index), explanation.`,
  blank: `Create one B1-level fill-the-blank exercise for an MET student.
Requirements:
- Use only B1-level vocabulary. Max 15 words per sentence in the template
- The blank must have exactly one clearly correct answer (or acceptable alternatives separated by |)
- Avoid blanks that could accept multiple different correct answers
Return JSON only with fields: type "blank", template (use ___ for each blank), blanks (array of correct answers in order, use | to separate alternatives).`,
  short: `Create one B1-level short answer question for an MET student.
Requirements:
- The prompt should be specific enough that two students would produce similar content
- Use only B1-level vocabulary in the prompt
- Align with the MET writing task format (opinion, explanation, or experience-based prompt)
Return JSON only with fields: type "short", prompt, rubric, targetWords (number).`,
  speak: `Create one B1-level speaking prompt for an MET student.
Requirements:
- Use only B1-level vocabulary in the prompt
- For healthcare/medical scenarios, use natural, idiomatic medical English
- The imageDescription should describe a realistic everyday or healthcare scene
- Align with the MET speaking task format (describe, explain, or give opinion)
Return JSON only with fields: type "speak", prompt, imageDescription, targetSeconds (number 30-90).`,
  order: `Create one B1-level sentence-ordering exercise for an MET student.
Requirements:
- Each sentence must be a complete, grammatically correct English sentence at B1 level
- The ordered sequence should tell a clear, logical story or procedure
- Avoid ambiguous orderings where two sequences could both make sense
Return JSON only with fields: type "order", sentences (array of 4-6 strings in correct order).`,
  fix: `Create one B1-level error correction exercise for an MET student.
Requirements:
- The error must be a genuine, unambiguous grammar mistake at B1 level
- The correctedText must be the only natural correction
- Use common B1 learner errors (e.g., tense, preposition, subject-verb agreement, word order)
- For healthcare sentences, ensure the correction produces natural medical English
Return JSON only with fields: type "fix", errorText, correctedText, hint.`,
  flash: `Create a set of 6 B1-level flashcards for an MET student.
Requirements:
- All terms must be genuinely useful at B1 level, not obscure
- Definitions must be in simpler English than the term itself
- Group by a common topic (e.g., healthcare, education, travel, work)
Return JSON only with fields: type "flash", pairs (array of {term, def} objects).`,
  listen: `Create one B1-level listening exercise for an MET student.
Requirements:
- Write the audioText as a realistic short conversation using natural B1-level English
- The question should test inference, speaker attitude, or purpose — NOT surface detail
- All options must use B1-level vocabulary
- For healthcare conversations, use natural, accurate medical language
- Average max 15 words per turn in the dialogue
Return JSON only with fields: type "listen", audioText, question, options (array of 4 strings), correct (0-3 index), explanation, plays (2).`,
  dialogue: `Create one B1-level dialogue exercise for an MET student.
Requirements:
- Write natural conversational English at B1 level
- For healthcare scenarios, use accurate and natural medical communication
- Each line should be a complete utterance — avoid fragments
- The dialogue should feel like a realistic interaction, not a scripted textbook example
Return JSON only with fields: type "dialogue", speakerA "Nurse", speakerB "Patient", lines (array of {id: random string, speaker: "A" or "B", text} objects, 4-6 lines).`,
  swap: `Create one B1-to-B2 synonym swap exercise.
Requirements:
- The B1 words in brackets must be genuinely replaceable with a B2 equivalent
- The B2 options must be real synonyms that fit the same context
- One correct synonym per word; distractors should be wrong part of speech or wrong register
Return JSON only with fields: type "swap", sentence (with [bracketed] B1 words), swaps (array of {word: "bracketed word", options: ["B2 option","B2 option","B2 option","B2 option"], correct: 0-3 index}).`,
  levelup: `Create one B1-to-B2-to-C1 sentence upgrade exercise.
Requirements:
- The B1 sentence must be natural, not artificially simple
- The B2 upgrade must be a genuine improvement in formality and vocabulary range
- The C1 upgrade should show sophisticated structure without being unnatural
- All three options at the end must be clearly different levels, not subtly different
Return JSON only with fields: type "levelup", b1 (B1 sentence), b2 (B2 version), c1 (C1 version), options (array of 3 strings, index 0 is B1, 1 is B2, 2 is C1), correct (1), keywords (array of target vocab), explanation.`,
  read: `Create one B1-level reading exercise for an MET student.
Requirements:
- Write the passage using B1-level vocabulary. Average max 18 words per sentence
- The passage should cover an MET-relevant topic (healthcare, education, work, technology, community)
- Questions should test main idea, inference, and purpose — NOT surface detail
- Each correct answer must be unambiguously supported by the passage text
- Source is optional but if provided, must be plausible
Return JSON only with fields: type "read", passage (2-3 paragraphs), source, questions (array of {question, options: [4 strings], correct: 0-3 index}).`,
};
