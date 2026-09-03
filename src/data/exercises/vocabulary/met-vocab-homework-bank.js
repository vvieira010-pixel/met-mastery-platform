export const vocabTopics = [
  {
    id: 'work_career',
    title: 'Work and Career',
    exercises: [
      {
        id: 'wc_01',
        type: 'mcq',
        topic: 'Work and Career',
        level: 'B2',
        question: 'The hiring committee was impressed by the candidate’s extensive professional ___.',
        options: ['background', 'curriculum', 'reference', 'enrollment'],
        correct: 0,
        explanation: '“Professional background” is standard collocation for work history and credentials.',
      },
      {
        id: 'wc_02',
        type: 'match',
        topic: 'Work and Career',
        level: 'B2',
        pairs: [
          { left: 'delegate', right: 'assign responsibility to others' },
          { left: 'collaborate', right: 'work jointly with team members' },
          { left: 'commute', right: 'travel regularly between home and work' },
        ],
      },
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare and Patient Care',
    exercises: [
      {
        id: 'hc_01',
        type: 'mcq',
        topic: 'Healthcare and Patient Care',
        level: 'B2',
        question: 'Prior to administering medications, nursing staff must verify the patient’s ___.',
        options: ['identification', 'occupation', 'citizenship', 'destination'],
        correct: 0,
        explanation: 'Patient identification verification is essential for medication safety.',
      },
    ],
  },
  {
    id: 'education',
    title: 'Education and Learning',
    exercises: [
      {
        id: 'ed_01',
        type: 'mcq',
        topic: 'Education and Learning',
        level: 'B2',
        question: 'The university updated its academic ___ to include more clinical practicum hours.',
        options: ['curriculum', 'commute', 'prognosis', 'expenditure'],
        correct: 0,
        explanation: 'A curriculum comprises the courses and learning experiences offered by an educational institution.',
      },
    ],
  },
  {
    id: 'technology',
    title: 'Technology and Digital Life',
    exercises: [
      {
        id: 'tech_01',
        type: 'mcq',
        topic: 'Technology and Digital Life',
        level: 'B2',
        question: 'Cloud storage facilitates secure and seamless data ___ across multiple clinic branches.',
        options: ['synchronization', 'hesitation', 'stagnation', 'limitation'],
        correct: 0,
        explanation: 'Data synchronization keeps records aligned across systems in real time.',
      },
    ],
  },
  {
    id: 'environment',
    title: 'Environment and Sustainability',
    exercises: [
      {
        id: 'env_01',
        type: 'mcq',
        topic: 'Environment and Sustainability',
        level: 'B2',
        question: 'Renewable energy investments aim to significantly reduce greenhouse gas ___.',
        options: ['emissions', 'admissions', 'omissions', 'transmissions'],
        correct: 0,
        explanation: 'Gas emissions refer to greenhouse pollutants released into the atmosphere.',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community and Public Services',
    exercises: [
      {
        id: 'comm_01',
        type: 'mcq',
        topic: 'Community and Public Services',
        level: 'B2',
        question: 'Municipal public health programs provide essential preventive care to ___ populations.',
        options: ['underserved', 'unobserved', 'unreserved', 'undetermined'],
        correct: 0,
        explanation: 'Underserved refers to groups having inadequate access to essential public services.',
      },
    ],
  },
  {
    id: 'travel_culture',
    title: 'Travel, Culture, and Moving Abroad',
    exercises: [
      {
        id: 'tc_01',
        type: 'mcq',
        topic: 'Travel and Culture',
        level: 'B2',
        question: 'Living in a foreign country requires strong cross-cultural ___ and adaptability.',
        options: ['competence', 'competition', 'compliance', 'complaint'],
        correct: 0,
        explanation: 'Cross-cultural competence allows effective communication across diverse cultural contexts.',
      },
    ],
  },
  {
    id: 'money_consumer',
    title: 'Money, Consumer Choices, and Advertising',
    exercises: [
      {
        id: 'mc_01',
        type: 'mcq',
        topic: 'Consumer Choices',
        level: 'B2',
        question: 'Consumers are increasingly conscious of product durability and ethical ___.',
        options: ['sourcing', 'sorting', 'soaring', 'seeking'],
        correct: 0,
        explanation: 'Ethical sourcing refers to responsible and fair procurement of materials.',
      },
    ],
  },
  {
    id: 'family_relationships',
    title: 'Family, Relationships, and Social Life',
    exercises: [
      {
        id: 'fr_01',
        type: 'mcq',
        topic: 'Family and Relationships',
        level: 'B2',
        question: 'Strong interpersonal connections provide an important buffer against emotional ___.',
        options: ['isolation', 'insulation', 'oscillation', 'installation'],
        correct: 0,
        explanation: 'Social connection mitigates feelings of emotional isolation.',
      },
    ],
  },
  {
    id: 'media_news',
    title: 'Media, News, and Communication',
    exercises: [
      {
        id: 'mn_01',
        type: 'mcq',
        topic: 'Media and News',
        level: 'B2',
        question: 'Digital media literacy enables readers to distinguish factual reporting from sensationalist ___.',
        options: ['journalism', 'speculation', 'regulation', 'legislation'],
        correct: 1,
        explanation: 'Sensationalist speculation refers to unverified conjecture designed to elicit emotional reactions.',
      },
    ],
  },
  {
    id: 'general',
    title: 'General Vocabulary',
    exercises: [],
  },
];

export { grammarMCQs } from '../grammar/grammar-92.js';
