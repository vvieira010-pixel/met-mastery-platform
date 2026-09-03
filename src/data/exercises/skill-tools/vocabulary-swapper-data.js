export const VOCABULARY_SWAPPER_DATA = [
  {
    id: 'vs_1',
    unitId: 'unit_1',
    sentence: 'The patient experienced a bad reaction to the high dose.',
    targets: [
      {
        simpleWord: 'bad',
        correctWord: 'adverse',
        options: ['adverse', 'minor', 'pleasant', 'unrelated'],
        explanation: '“Adverse reaction” is the accurate medical collocation.',
      },
    ],
  },
  {
    id: 'vs_2',
    unitId: 'unit_2',
    sentence: 'The team worked together to finish the project.',
    targets: [
      {
        simpleWord: 'worked together',
        correctWord: 'collaborated',
        options: ['collaborated', 'competed', 'hesitated', 'complied'],
        explanation: '“Collaborated” elevates the register in academic contexts.',
      },
    ],
  },
];
