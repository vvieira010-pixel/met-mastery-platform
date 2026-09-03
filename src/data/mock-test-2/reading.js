export const READING_PART1 = {
  label: 'Part 1 · Grammar & Reading',
  instructions: 'Choose the one word or phrase that best completes the sentence.',
  questions: [
    { id: 'mt2_r1_1', text: 'The triage protocol requires that all vital signs ___ recorded immediately upon admission.', options: ['be', 'are been', 'would', 'to be'], answer: 0, level: 'B2', type: 'grammar' },
    { id: 'mt2_r1_2', text: 'Scarcely had the emergency siren sounded ___ the trauma team assembled in the resuscitation bay.', options: ['than', 'when', 'then', 'while'], answer: 1, level: 'B2', type: 'grammar' },
    { id: 'mt2_r1_3', text: 'The pharmacist verified the dosage to prevent any adverse drug ___.', options: ['interactions', 'interferences', 'interceptions', 'interludes'], answer: 0, level: 'B2', type: 'vocabulary' },
    { id: 'mt2_r1_4', text: 'Despite the high patient volume, the nursing staff maintained a ___ standard of clinical care.', options: ['flawless', 'rigorous', 'reckless', 'stagnant'], answer: 1, level: 'B2', type: 'vocabulary' },
    { id: 'mt2_r1_5', text: 'The infectious disease specialist recommended that the isolation ward ___ ventilated continuously.', options: ['is', 'be', 'was', 'being'], answer: 1, level: 'B2', type: 'grammar' },
  ],
};

export const READING_PART2 = {
  label: 'Part 2 · Short Passages',
  instructions: 'Read each passage and answer the questions that follow.',
  passages: [
    {
      id: 'mt2_r2_p1',
      title: 'Point-of-Care Ultrasonography in Acute Settings',
      text: 'Point-of-care ultrasonography (POCUS) has revolutionized rapid bedside diagnostics in acute care medicine. Unlike conventional comprehensive ultrasound exams performed in specialized radiology suites, POCUS is performed and interpreted in real time by the treating clinician. This immediate visual data facilitates prompt decision-making in critical scenarios such as suspected pericardial effusion, pneumothorax, or acute vascular compromise.',
      questions: [
        { id: 'mt2_r2_q1', text: 'What distinguishes POCUS from traditional radiology ultrasound?', options: ['It requires higher radiation exposure', 'It is executed at bedside by the treating clinician in real time', 'It takes several days to process results', 'It can only be used on pediatric patients'], answer: 1, level: 'B2', type: 'reading' },
        { id: 'mt2_r2_q2', text: 'In which scenario is POCUS particularly beneficial according to the text?', options: ['Routine dental checkups', 'Critical evaluations like suspected pneumothorax', 'Administrative billing assessments', 'Laboratory inventory management'], answer: 1, level: 'B2', type: 'reading' },
      ],
    },
  ],
};

export const READING_PART3 = {
  label: 'Part 3 · Extended Text Sets',
  instructions: 'Read the multi-part texts and answer the questions that follow.',
  textSets: [
    {
      id: 'mt2_r3_ts1',
      title: 'Interprofessional Simulation Training in Nursing',
      texts: [
        {
          heading: 'Text A: Educational Curriculum Overview',
          body: 'High-fidelity simulation labs replicate complex clinical crisis scenarios using advanced mannequin simulators. Nursing trainees practice rapid response algorithms, closed-loop communication, and team leadership without risk to actual patients.'
        },
        {
          heading: 'Text B: Post-Training Retention Analysis',
          body: 'A 12-month follow-up study showed that cohorts engaged in quarterly simulated resuscitations demonstrated a 34% reduction in medication administration lag during real in-hospital cardiac arrests.'
        }
      ],
      questions: [
        { id: 'mt2_r3_q1', text: 'What is a major advantage of simulation training described in Text A?', options: ['It reduces classroom tuition fees', 'It allows risk-free practice of crisis response and communication', 'It eliminates the need for clinical internships', 'It automates bedside charting'], answer: 1, level: 'B2', type: 'reading' },
        { id: 'mt2_r3_q2', text: 'What outcome was recorded in the 12-month follow-up study in Text B?', options: ['Faster response during actual hospital cardiac emergencies', 'Decreased overall nurse staffing levels', 'Increased simulator maintenance overhead', 'Longer medication prep intervals'], answer: 0, level: 'B2', type: 'reading' },
      ],
    },
  ],
};
