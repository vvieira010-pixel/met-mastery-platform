export const WRITING_TASKS = {
  task1: {
    id: 'task1',
    title: 'Task 1: Short Answer Responses',
    instructions: 'Answer each of the three questions below. Write 1 to 3 complete sentences for each question.',
    questions: [
      {
        id: 't1_q1',
        prompt: 'Describe a situation where teamwork among healthcare workers improved a patient’s outcome.',
      },
      {
        id: 't1_q2',
        prompt: 'What strategies can medical professionals use to manage stress during demanding work shifts?',
      },
      {
        id: 't1_q3',
        prompt: 'Why is clear written documentation critical in preventing medication administration errors?',
      },
    ],
  },
  task2: {
    id: 'task2',
    title: 'Task 2: Essay',
    instructions: 'Read the prompt below and write a formal essay of at least 200 words. Support your arguments with specific examples and evidence.',
    prompt: 'In recent years, telemedicine and remote patient monitoring technologies have expanded rapidly. Some argue that virtual consultations improve accessibility for rural and elderly patients, while others worry that the lack of in-person physical examinations compromises diagnostic accuracy.\n\nDiscuss both perspectives and state your own view on the future role of telemedicine in healthcare.',
  },
};
