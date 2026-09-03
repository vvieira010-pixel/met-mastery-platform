export const LEVEL_UP_DATA = [
  {
    id: 'lu_1',
    unitId: 'unit_1',
    b1Sentence: 'The doctor talked to the patient because he was scared about the surgery.',
    options: [
      { text: 'The physician consulted with the patient to address his pre-operative anxieties.', explanation: 'Uses precise formal register (“physician”, “consulted with”, “pre-operative anxieties”).' },
      { text: 'The doctor spoke a lot to the patient who had big fears.', explanation: 'Informal phrasing and imprecise vocabulary.' },
      { text: 'The surgeon was talking because the patient was very frightened.', explanation: 'Basic structure without academic cohesion.' },
    ],
    correctOptionIndex: 0,
  },
  {
    id: 'lu_2',
    unitId: 'unit_2',
    b1Sentence: 'A lot of people think that eating good food helps you not get sick.',
    options: [
      { text: 'Many people feel that good eating stops diseases.', explanation: 'Informal vocabulary.' },
      { text: 'Substantial evidence suggests that adopting balanced nutrition significantly reduces the incidence of chronic illness.', explanation: 'High-level academic structure, precise vocabulary (“incidence”, “chronic illness”).' },
      { text: 'Everyone knows healthy eating makes you not sick at all.', explanation: 'Informal generalization.' },
    ],
    correctOptionIndex: 1,
  },
];
