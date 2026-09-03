export const GRAMMAR_DOCTOR_DATA = [
  {
    id: 'gd_1',
    unitId: 'unit_1',
    symptom: 'Despite of the rain, the clinical trial continued without delay.',
    focus: 'Preposition Overuse with Despite',
    linguisticRule: '“Despite” takes a noun directly without “of”. Use “in spite of” or “despite”.',
    remedyOptions: [
      { text: 'Despite the rain, the clinical trial continued without delay.', isCorrect: true },
      { text: 'In despite of the rain, the clinical trial continued without delay.', isCorrect: false },
      { text: 'Although of the rain, the clinical trial continued without delay.', isCorrect: false },
    ],
  },
  {
    id: 'gd_2',
    unitId: 'unit_2',
    symptom: 'The nurse suggested him to take the medication after meals.',
    focus: 'Verb Patterns: Suggest',
    linguisticRule: '“Suggest” does not take an indirect object + to-infinitive. Use “suggested that he take” or “suggested taking”.',
    remedyOptions: [
      { text: 'The nurse suggested that he take the medication after meals.', isCorrect: true },
      { text: 'The nurse suggested to him taking the medication after meals.', isCorrect: false },
      { text: 'The nurse suggested him taking the medication after meals.', isCorrect: false },
    ],
  },
];
