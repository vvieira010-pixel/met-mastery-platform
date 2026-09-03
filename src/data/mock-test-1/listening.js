export const LISTENING_PART1 = {
  label: 'Part 1 · Short Conversations',
  instructions: 'Listen to short conversations and answer the question for each.',
  questions: [
    {
      id: 'l1_1',
      text: 'What will the nurse do next?',
      options: ['Call the pharmacy for a medication refill', 'Check the patient’s vitals in room 302', 'Sign out at the end of the shift', 'Schedule an ultrasound appointment'],
      answer: 1,
      audio: '',
      level: 'B2',
      type: 'listening'
    },
    {
      id: 'l1_2',
      text: 'Why is the appointment delayed?',
      options: ['The physician is in an emergency procedure', 'The clinic power was interrupted', 'The patient arrived late for check-in', 'The lab results were misplaced'],
      answer: 0,
      audio: '',
      level: 'B2',
      type: 'listening'
    },
    {
      id: 'l1_3',
      text: 'What instruction does the doctor emphasize?',
      options: ['Take the antibiotic with food twice daily', 'Discontinue the medication if feeling better', 'Avoid drinking water before sleep', 'Return for blood tests in six months'],
      answer: 0,
      audio: '',
      level: 'B2',
      type: 'listening'
    },
  ],
};

export const LISTENING_PART2 = {
  label: 'Part 2 · Extended Dialogues',
  instructions: 'Listen to a dialogue between colleagues or clinician and patient, then answer the questions.',
  conversations: [
    {
      id: 'l2_c1',
      title: 'Shift Handoff in Intensive Care',
      audio: '',
      questions: [
        { id: 'l2_q1', text: 'What is the main topic of the handoff conversation?', options: ['Transferring a patient to the step-down unit', 'Reviewing fluid balance and ventilator adjustments', 'Ordering new monitoring equipment', 'Addressing a scheduling conflict among nursing staff'], answer: 1, level: 'B2', type: 'listening' },
        { id: 'l2_q2', text: 'What change occurred during the night shift?', options: ['The patient experienced an allergic reaction', 'Oxygen saturation stabilized after bronchodilator therapy', 'The arterial line had to be replaced', 'The patient was discharged home'], answer: 1, level: 'B2', type: 'listening' },
      ],
    },
  ],
};

export const LISTENING_PART3 = {
  label: 'Part 3 · Academic & Clinical Talks',
  instructions: 'Listen to a short lecture or clinical presentation and answer the questions.',
  talks: [
    {
      id: 'l3_t1',
      title: 'Antibiotic Stewardship in Tertiary Care',
      audio: '',
      scriptContext: 'A clinical presentation on reducing broad-spectrum antibiotic overuse in hospital inpatient wards.',
      questions: [
        { id: 'l3_q1', text: 'What is the speaker’s primary concern?', options: ['The rising cost of diagnostic imaging', 'The proliferation of multidrug-resistant pathogens', 'The shortage of infectious disease specialists', 'The delay in federal regulatory approvals'], answer: 1, level: 'B2', type: 'listening' },
        { id: 'l3_q2', text: 'What strategy did the hospital implement to improve prescribing habits?', options: ['Mandatory infectious disease consultation after 48 hours', 'Complete cessation of third-generation cephalosporins', 'Replacing intravenous therapy with oral supplements', 'Restricting pharmacy operating hours'], answer: 0, level: 'B2', type: 'listening' },
      ],
    },
  ],
};
