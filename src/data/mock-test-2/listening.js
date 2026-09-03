export const LISTENING_PART1 = {
  label: 'Part 1 · Short Conversations',
  instructions: 'Listen to short conversations and answer the questions.',
  questions: [
    {
      id: 'mt2_l1_1',
      text: 'What is the nurse requested to verify before administering the infusion?',
      options: ['The patient’s identification band and allergies', 'The hospital room temperature', 'The parking validation stamp', 'The next meal delivery schedule'],
      answer: 0,
      audio: '',
      level: 'B2',
      type: 'listening'
    },
    {
      id: 'mt2_l1_2',
      text: 'When will the radiology technician arrive?',
      options: ['Immediately after lunch', 'In approximately twenty minutes', 'Tomorrow morning', 'At the end of the shift'],
      answer: 1,
      audio: '',
      level: 'B2',
      type: 'listening'
    },
  ],
};

export const LISTENING_PART2 = {
  label: 'Part 2 · Extended Dialogues',
  instructions: 'Listen to the dialogue and answer the questions.',
  conversations: [
    {
      id: 'mt2_l2_c1',
      title: 'Multidisciplinary Team Discharge Planning',
      audio: '',
      questions: [
        { id: 'mt2_l2_q1', text: 'What is the primary goal of the discharge meeting?', options: ['Planning home health support and wound care follow-up', 'Canceling elective surgeries', 'Reviewing billing statements', 'Ordering new wheelchairs'], answer: 0, level: 'B2', type: 'listening' },
        { id: 'mt2_l2_q2', text: 'Who will coordinate the in-home physical therapy sessions?', options: ['The hospital social worker', 'The attending surgeon', 'The triage receptionist', 'The patient’s neighbor'], answer: 0, level: 'B2', type: 'listening' },
      ],
    },
  ],
};

export const LISTENING_PART3 = {
  label: 'Part 3 · Clinical & Scientific Talks',
  instructions: 'Listen to the lecture and answer the questions.',
  talks: [
    {
      id: 'mt2_l3_t1',
      title: 'Innovations in Sepsis Early Warning Systems',
      audio: '',
      scriptContext: 'A grand rounds presentation on automated continuous biomarker monitoring for sepsis detection.',
      questions: [
        { id: 'mt2_l3_q1', text: 'Why is early detection of sepsis vital?', options: ['Mortality risk increases significantly with every hour of delayed antibiotic therapy', 'It reduces hospital electrical consumption', 'It eliminates the need for blood pressure cuffs', 'It speeds up patient discharge on day one'], answer: 0, level: 'B2', type: 'listening' },
        { id: 'mt2_l3_q2', text: 'What key metric does the automated algorithm monitor?', options: ['Lactate levels, temperature, and vital sign trends', 'Dietary carbohydrate intake', 'Patient room lighting levels', 'Visitor badge scans'], answer: 0, level: 'B2', type: 'listening' },
      ],
    },
  ],
};
