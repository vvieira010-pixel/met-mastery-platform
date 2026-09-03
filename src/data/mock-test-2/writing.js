export const WRITING_TASKS = {
  task1: {
    id: 'mt2_task1',
    title: 'Task 1: Short Answer Responses',
    instructions: 'Answer each of the three questions below with 1 to 3 complete sentences.',
    questions: [
      {
        id: 'mt2_t1_q1',
        prompt: 'Explain one method that healthcare facilities use to prevent hospital-acquired infections.',
      },
      {
        id: 'mt2_t1_q2',
        prompt: 'Why is active listening crucial when taking a medical history from an anxious patient?',
      },
      {
        id: 'mt2_t1_q3',
        prompt: 'How do electronic health record systems contribute to interprofessional healthcare collaboration?',
      },
    ],
  },
  task2: {
    id: 'mt2_task2',
    title: 'Task 2: Essay',
    instructions: 'Write a formal argumentative essay of at least 200 words addressing the prompt below.',
    prompt: 'Many healthcare systems are transitioning towards value-based healthcare models that tie provider reimbursement to patient health outcomes rather than the quantity of services delivered. Proponents claim this incentivizes preventive care, whereas critics argue it unfairly penalizes providers serving patients with complex chronic co-morbidities.\n\nEvaluate both arguments and provide your perspective on the effectiveness of outcome-based healthcare models.',
  },
};
