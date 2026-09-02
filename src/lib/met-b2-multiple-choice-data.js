const readingPassageA = `Study Abroad & Work

Many universities around the world now offer short-term exchange programs for international students. These programs usually last from one semester to a full academic year and allow students to take regular courses in the host institution.

In addition to academic benefits, students often gain valuable work experience through part-time jobs or paid internships. Employers tend to appreciate candidates who have international experience, because such candidates are usually more flexible, independent, and better at solving problems in unfamiliar situations.

However, studying abroad is not always easy. Students may struggle with cultural differences, homesickness, and the high cost of living in some countries. Careful planning and a clear budget are essential before deciding to study overseas.`;

const readingPassageB = `Online Learning & Technology

Online learning platforms have become extremely popular among adult learners. Many people choose online courses because they can study at their own pace and access materials from any device. This flexibility is particularly useful for professionals who need to combine full-time work with further studies.

On the other hand, some learners feel that online courses are less personal than traditional classes. They miss face-to-face discussions, group projects, and the opportunity to build strong relationships with classmates and teachers. For these learners, the social element of education is just as important as the content.`;

const listeningDialogue1 = [
  { speaker: 'A', text: 'Hi Carla, did you finish the report for the marketing manager?' },
  { speaker: 'B', text: 'Not yet. I had to attend an unexpected meeting this morning, so I will send it by six p.m. instead of four p.m.' },
  { speaker: 'A', text: 'Okay, I will let her know. Do you need any help with the charts?' },
  { speaker: 'B', text: 'That would be great. Could you check the sales figures for last month?' },
];

const listeningDialogue2 = [
  { speaker: 'A', text: 'Have you heard about the company’s new environmental initiative?' },
  { speaker: 'B', text: 'Only a little. What is changing next month?' },
  { speaker: 'A', text: 'We will reduce paper use by forty percent and store documents digitally. We are also starting a recycling program for plastic bottles and cans.' },
  { speaker: 'B', text: 'Where can employees recycle them?' },
  { speaker: 'A', text: 'There will be special containers in every department. At the end of each month, we will measure the recycled waste and share the results in the internal newsletter.' },
  { speaker: 'B', text: 'And I heard something about volunteering?' },
  { speaker: 'A', text: 'Yes. We are planning Saturday-morning park cleanups. Staff who take part will receive extra vacation hours.' },
];

const listeningDialogue3 = [
  { speaker: 'A', text: 'The online training session has been moved to tomorrow at nine a.m.' },
  { speaker: 'B', text: 'Why was it moved?' },
  { speaker: 'A', text: 'Many participants were unavailable today, so we rescheduled. Could you send an updated invitation to all participants?' },
  { speaker: 'B', text: 'Of course. I will send it now.' },
];

function question(id, skill, prompt, options, correct, explanation, context) {
  return {
    id: `b2_mcq_${id}`,
    type: 'mcq',
    level: 'B2',
    skill,
    question: prompt,
    options,
    correct,
    explanation,
    ...(context ? { context } : {}),
  };
}

function listeningQuestion(id, prompt, options, correct, explanation, script) {
  return {
    id: `b2_mcq_${id}`,
    type: 'listen',
    level: 'B2',
    skill: 'Listening',
    question: prompt,
    options,
    correct,
    explanation,
    plays: 2,
    script,
    audioText: script.map(({ speaker, text }) => `${speaker}: ${text}`).join('\n'),
  };
}

export const MET_B2_MULTIPLE_CHOICE_SECTIONS = [
  { id: 'reading', title: 'Reading' },
  { id: 'listening', title: 'Listening' },
  { id: 'speaking', title: 'Speaking' },
  { id: 'writing', title: 'Writing' },
  { id: 'vocabulary', title: 'Vocabulary' },
  { id: 'grammar', title: 'Grammar' },
];

const READING = [
  question('reading_01', 'Reading', 'Short-term exchange programs allow students to', ['finish their degrees more quickly.', 'study abroad for a semester or a year.', 'avoid taking regular courses.', 'work full-time in another country.'], 1, 'The passage says these programs last from one semester to a full academic year and let students study at the host institution.', readingPassageA),
  question('reading_02', 'Reading', 'Employers often value international experience because', ['students usually speak several languages.', 'students become more flexible and independent.', 'students never feel homesick.', 'students learn how to avoid unfamiliar situations.'], 1, 'The passage directly links international experience with flexibility, independence, and stronger problem-solving in unfamiliar situations.', readingPassageA),
  question('reading_03', 'Reading', 'One possible disadvantage of studying abroad is', ['easy access to internships.', 'high cost of living.', 'meeting new people.', 'learning a new language.'], 1, 'High living costs are listed as one of the difficulties students may face while studying abroad.', readingPassageA),
  question('reading_04', 'Reading', 'Online learning is especially useful for', ['teenagers who dislike technology.', 'students who prefer group projects.', 'professionals combining work and study.', 'people who hate studying alone.'], 2, 'The passage specifically says the flexibility is useful for professionals who combine full-time work with further study.', readingPassageB),
  question('reading_05', 'Reading', 'A learner who misses “face-to-face discussions” probably thinks that online courses are', ['more flexible.', 'less personal.', 'better organized.', 'easier to pass.'], 1, 'Missing live discussions and relationships is presented as the reason some learners find online courses less personal.', readingPassageB),
  question('reading_06', 'Reading', 'In the reading, the “social element of education” refers to', ['exams and grades.', 'online platforms and apps.', 'relationships and interaction in class.', 'textbooks and homework.'], 2, 'The phrase refers back to face-to-face discussions, group projects, and relationships with classmates and teachers.', readingPassageB),
  question('reading_07', 'Reading', 'A student who plans to study abroad should first', ['buy expensive electronic devices.', 'prepare a clear budget and plan.', 'avoid learning about the host culture.', 'refuse to work part-time.'], 1, 'The final sentence says careful planning and a clear budget are essential before studying overseas.', readingPassageA),
  question('reading_08', 'Reading', 'The main purpose of short-term exchanges is to', ['help students travel as tourists.', 'offer academic and personal development opportunities.', 'replace full degrees.', 'prevent students from working.'], 1, 'The passage describes regular study, work experience, independence, and problem-solving, so the broad purpose is academic and personal development.', readingPassageA),
  question('reading_09', 'Reading', 'Online courses may be less suitable for students who', ['enjoy independent study.', 'have busy schedules.', 'need strong social interaction.', 'want to save money.'], 2, 'Students who strongly value direct discussion and relationships may find the reduced social contact unsuitable.', readingPassageB),
  question('reading_10', 'Reading', 'The overall attitude of the writer toward online learning is', ['completely negative.', 'balanced, showing both pros and cons.', 'neutral and uninterested.', 'extremely enthusiastic with no criticism.'], 1, 'The writer presents both flexibility and access as benefits and reduced personal interaction as a disadvantage, creating a balanced view.', `${readingPassageA}\n\n${readingPassageB}`),
];

const LISTENING = [
  listeningQuestion('listening_01', 'Why will Carla send the report later?', ['She forgot about it.', "She didn't understand the charts.", 'She had an unexpected meeting.', 'Her manager changed the deadline.'], 2, 'Carla explicitly says the unexpected morning meeting delayed her work on the report.', listeningDialogue1),
  listeningQuestion('listening_02', 'What does Carla ask for?', ['Help writing emails.', 'Help checking sales figures.', 'Help organizing a meeting.', 'Help printing the report.'], 1, 'She asks the other speaker to check the sales figures for the previous month.', listeningDialogue1),
  listeningQuestion('listening_03', 'What is the main goal of the initiative?', ['To increase company profits.', 'To reduce environmental impact at work.', 'To hire more employees.', 'To expand to new markets.'], 1, 'Reducing paper, recycling waste, and cleaning parks all support the same main goal: reducing environmental impact.', listeningDialogue2),
  listeningQuestion('listening_04', 'How much will paper use be reduced?', ['20 percent.', '30 percent.', '40 percent.', '60 percent.'], 2, 'The speaker says the company will reduce paper use by 40 percent.', listeningDialogue2),
  listeningQuestion('listening_05', 'Where will the recycling containers be placed?', ['Only in the cafeteria.', 'Only in the reception area.', 'In every department.', 'In the parking lot.'], 2, 'The dialogue says special recycling containers will be placed in every department.', listeningDialogue2),
  listeningQuestion('listening_06', 'How will the company share recycling results?', ['On public social media.', 'In television ads.', 'In the internal newsletter.', 'Through personal emails only.'], 2, 'The monthly recycling results will be shared in the company’s internal newsletter.', listeningDialogue2),
  listeningQuestion('listening_07', 'When will the volunteer park-cleaning events take place?', ['Friday evenings.', 'Sunday evenings.', 'Saturday mornings.', 'Monday mornings.'], 2, 'The speakers say the volunteer activities are planned for Saturday mornings.', listeningDialogue2),
  listeningQuestion('listening_08', 'What benefit do volunteers receive?', ['Free lunch.', 'Extra vacation hours.', 'Free transportation.', 'Cash bonuses.'], 1, 'Staff who take part in the park cleanups will receive extra vacation hours.', listeningDialogue2),
  listeningQuestion('listening_09', 'Why was the online training session moved?', ['The trainer is sick.', 'Many participants were unavailable today.', 'The internet connection failed.', 'The room was double-booked.'], 1, 'The speaker gives participant unavailability as the direct reason for rescheduling.', listeningDialogue3),
  listeningQuestion('listening_10', 'What does the speaker ask the listener to do?', ['Cancel the session.', 'Send an updated invitation to all participants.', 'Prepare lunch for attendees.', 'Book a bigger room.'], 1, 'The final request is to send every participant an updated invitation.', listeningDialogue3),
];

const SPEAKING = [
  question('speaking_01', 'Speaking', 'In Task 1 (picture description), the best way to start is', ['“I think this picture is boring.”', '“This image depicts a busy office environment.”', '“I don’t know what is happening here.”', '“Let me talk about my job first.”'], 1, 'This opening immediately and clearly describes the overall scene, which directly addresses the picture-description task.'),
  question('speaking_02', 'Speaking', 'In Task 1, which tense is most appropriate?', ['Past perfect.', 'Present simple and present continuous.', 'Future perfect.', 'Past simple only.'], 1, 'Use the present simple for general facts about the image and the present continuous for actions happening in the scene.'),
  question('speaking_03', 'Speaking', 'In Task 2 (personal question), you usually talk about', ['a past experience related to the picture.', 'a future plan with no connection.', 'general opinions about politics.', 'other people’s experiences only.'], 0, 'Task 2 connects the visual topic to the test taker’s own relevant experience, which is often narrated in the past.'),
  question('speaking_04', 'Speaking', 'For Task 3 (preference), which opening shows strong preference?', ['“I kind of like both.”', '“I might prefer one of them.”', '“I would much rather work from home than in an office.”', '“Maybe they are both okay.”'], 2, '“Would much rather” states a clear, strong preference and sets up reasons and examples.'),
  question('speaking_05', 'Speaking', 'In Task 4 (advantages and disadvantages), what must you do?', ['Give only your personal opinion.', 'Present both positive and negative points.', 'Talk only about your experiences.', 'Compare three different topics.'], 1, 'The task explicitly requires a balanced discussion of advantages and disadvantages, so both sides must be covered.'),
  question('speaking_06', 'Speaking', 'Which connector is ideal for changing from advantages to disadvantages?', ['“First of all…”', '“On the other hand…”', '“In other words…”', '“For example…”'], 1, '“On the other hand” signals contrast, making it a natural transition from positive points to negative ones.'),
  question('speaking_07', 'Speaking', 'In Task 5 (persuasion), a good strong opener is', ['“I disagree with this idea.”', '“I don’t know what to say.”', '“I strongly believe that this proposal should be approved.”', '“Maybe this proposal is okay.”'], 2, 'The sentence clearly states a persuasive position and uses confident language appropriate for trying to influence the listener.'),
  question('speaking_08', 'Speaking', 'When you forget a word in speaking, the best strategy is', ['stop talking completely.', 'say “I don’t know” many times.', 'use a more general word and keep going.', 'restart your entire answer.'], 2, 'Paraphrasing with a simpler or more general word protects fluency and still communicates the intended meaning.'),
  question('speaking_09', 'Speaking', 'To improve fluency, you should', ['speak extremely fast.', 'read your notes aloud.', 'use connectors like “first,” “later,” and “overall.”', 'avoid giving examples.'], 2, 'Connectors organize ideas and help the response progress smoothly; fluency is about clear flow, not extreme speed.'),
  question('speaking_10', 'Speaking', 'In all speaking tasks, examiners evaluate', ['only pronunciation.', 'only vocabulary.', 'vocabulary, grammar, fluency, and task completion.', 'only how many words you say.'], 2, 'Speaking performance is judged across several dimensions, including language range and control, delivery, and whether the task is fully addressed.'),
];

const WRITING = [
  question('writing_01', 'Writing', 'In MET Writing Task 1, you normally', ['write a formal report.', 'write a few sentences answering personal questions.', 'write a long essay.', 'translate a text.'], 1, 'Task 1 calls for short, sentence-level responses to personal questions rather than a long essay.'),
  question('writing_02', 'Writing', 'In Writing Task 2, you usually', ['complete a table.', 'write a multi-paragraph essay on a given prompt.', 'write a dialogue.', 'fill in a form.'], 1, 'Task 2 requires an organized extended response, normally developed across multiple paragraphs.'),
  question('writing_03', 'Writing', 'A good introduction to an essay about tourism is', ['“I don’t like this topic.”', '“Tourism plays an important role in many countries’ economies and daily life.”', '“Tourism is tourism.”', '“Tourism is bad.”'], 1, 'This sentence introduces the topic in a clear, formal, and sufficiently developed way without being vague or overly personal.'),
  question('writing_04', 'Writing', 'When discussing advantages and disadvantages, the best paragraph plan is', ['one long paragraph with everything mixed.', 'one paragraph for advantages, one for disadvantages.', 'only advantages.', 'only disadvantages.'], 1, 'Separating the two sides into distinct paragraphs gives the essay a clear logical structure.'),
  question('writing_05', 'Writing', 'Which sentence is a strong thesis statement?', ['“Many people travel.”', '“Although tourism creates jobs and income, it can also seriously damage the environment.”', '“Tourism is very interesting.”', '“Tourism is always good.”'], 1, 'The sentence presents the essay’s central contrast and previews both the economic benefit and environmental cost.'),
  question('writing_06', 'Writing', 'To improve coherence, you should', ['avoid using connectors.', 'use linking words like “however,” “therefore,” and “as a result.”', 'write each sentence separately with no relation.', 'change topic in every sentence.'], 1, 'Linking words show relationships such as contrast, cause, and result, helping readers follow the argument.'),
  question('writing_07', 'Writing', 'In a conclusion, the writer should', ['introduce new ideas.', 'summarize main points and restate opinion.', 'repeat the introduction exactly.', 'ask a question and end suddenly.'], 1, 'A conclusion closes the argument by synthesizing the main points and confirming the writer’s position, without adding a new major idea.'),
  question('writing_08', 'Writing', 'For Writing Task 1, an appropriate sentence is', ['“I went to the beach once.”', '“Last year, I changed my diet to eat more vegetables, and I felt much healthier.”', '“Vegetables are green.”', '“Last year was last year.”'], 1, 'This response gives a specific personal experience with a relevant action and result, showing more useful language than the other choices.'),
  question('writing_09', 'Writing', 'When writing about personal experience, the most common tense is', ['future simple.', 'present continuous.', 'past simple and sometimes past continuous.', 'past perfect only.'], 2, 'The past simple tells completed events, while the past continuous can describe background actions in a past experience.'),
  question('writing_10', 'Writing', 'To show B2 vocabulary range, you should', ['repeat basic words like “good” and “nice.”', 'avoid adjectives.', 'use more precise words like “beneficial,” “challenging,” and “significant.”', 'write only simple sentences.'], 2, 'Precise, context-appropriate vocabulary demonstrates greater range and control than repeated general words.'),
];

const VOCABULARY = [
  question('vocabulary_01', 'Vocabulary', 'Many adults decide to ___ a short online course to improve their skills.', ['part in', 'care of', 'place', 'take'], 3, 'The standard collocation is “take a course,” meaning to enroll in and study it.'),
  question('vocabulary_02', 'Vocabulary', 'The company wants to ___ paper use by 40 percent.', ['put off', 'look after', 'cut down on', 'turn up'], 2, '“Cut down on” means reduce the amount or frequency of something, so it fits paper use.'),
  question('vocabulary_03', 'Vocabulary', 'Students often try to ___ technological changes.', ['keep up with', 'get off', 'turn into', 'call off'], 0, '“Keep up with” means stay informed about or progress at the same speed as continuing changes.'),
  question('vocabulary_04', 'Vocabulary', 'She hopes to ___ valuable work experience during her internship.', ['do', 'gain', 'make', 'get off'], 1, 'English normally uses the collocation “gain experience” for acquiring knowledge or ability through practice.'),
  question('vocabulary_05', 'Vocabulary', 'All project reports must be ___ before Friday.', ['taken off', 'handed in', 'turned up', 'picked out'], 1, '“Hand in” means submit work to a teacher, manager, or organization.'),
  question('vocabulary_06', 'Vocabulary', 'The training course will help employees ___ difficult customers.', ['deal with', 'deal up', 'do over', 'make out'], 0, '“Deal with” means handle or manage a person, problem, or situation.'),
  question('vocabulary_07', 'Vocabulary', 'Many people feel ___ by the amount of information online.', ['bored', 'overwhelmed', 'excited', 'entertained'], 1, '“Overwhelmed” describes feeling unable to cope because the amount of information is too great.'),
  question('vocabulary_08', 'Vocabulary', 'Volunteering can be an extremely ___ experience.', ['relaxing', 'boring', 'rewarding', 'expensive'], 2, 'A “rewarding experience” is one that gives satisfaction or a sense of value, a common collocation for volunteering.'),
  question('vocabulary_09', 'Vocabulary', 'The manager gave us ___ feedback after the presentation.', ['destructive', 'constructive', 'noisy', 'emotional'], 1, '“Constructive feedback” offers useful comments intended to help someone improve.'),
  question('vocabulary_10', 'Vocabulary', 'Universities are trying to make their campuses more ___.', ['technologically friendly', 'socially friendly', 'environmentally friendly', 'economically friendly'], 2, '“Environmentally friendly” describes choices or places designed to cause less harm to the environment.'),
];

const GRAMMAR = [
  question('grammar_01', 'Grammar', 'Last year I ___ in a call center when I ___ to start preparing for the MET.', ['worked / decide', 'was working / decided', 'was working / was deciding', 'have worked / decided'], 1, 'Use the past continuous for the ongoing background situation (“was working”) and the past simple for the completed decision (“decided”).'),
  question('grammar_02', 'Grammar', 'While I ___ the practice test, my internet connection suddenly ___.', ['took / was failing', 'was taking / failed', 'was taking / was failing', 'took / has failed'], 1, '“While” introduces the ongoing past action, so use “was taking”; the sudden interruption is the past simple “failed.”'),
  question('grammar_03', 'Grammar', 'I ___ so confident about an exam before.', ["didn't feel", 'was never feeling', 'have never felt', 'had never feel'], 2, '“Before” refers to life experience up to now, so the present perfect “have never felt” is appropriate.'),
  question('grammar_04', 'Grammar', 'If you ___ regularly, you ___ your listening skills.', ['studied / will improve', 'study / improved', 'study / will improve', 'will study / improve'], 2, 'The first conditional uses present simple in the if-clause and “will” plus the base verb in the result clause.'),
  question('grammar_05', 'Grammar', 'If students ___ late, the speaking session ___ later.', ['arrive / starts', 'arrive / will start', 'arrived / would start', 'will arrive / starts'], 1, 'This is a real future possibility: present simple “arrive” after “if,” followed by “will start” in the result.'),
  question('grammar_06', 'Grammar', 'If the company ___ paper use, it ___ money.', ['reduces / saves', 'reduces / will save', 'will reduce / saves', 'reduced / will save'], 1, 'For a likely future result, use present simple in the condition (“reduces”) and “will save” in the main clause.'),
  question('grammar_07', 'Grammar', 'Many people ___ to combine work and study these days.', ['is trying', 'tries', 'are trying', 'was trying'], 2, 'The plural subject “many people” takes “are,” and “these days” supports the present continuous for a current trend.'),
  question('grammar_08', 'Grammar', 'Online platforms ___ more popular in recent years.', ['became', 'has become', 'have become', 'are become'], 2, '“In recent years” connects past change to the present, and the plural subject requires “have become.”'),
  question('grammar_09', 'Grammar', 'By the time she took the test, she ___ several practice exams.', ['has completed', 'completed', 'had completed', 'was completing'], 2, 'The practice exams were completed before another past event, so the past perfect “had completed” shows the earlier action.'),
  question('grammar_10', 'Grammar', 'If you ___ more practice speaking, you ___ more fluent.', ['do / became', 'do / will become', 'will do / become', 'did / will become'], 1, 'The first conditional pattern is present simple “do” in the if-clause and future “will become” in the result.'),
];

// The requested Platform 0.2 exercise families share this B2 Skills surface
// so students can practise recognition and production tasks in one session.
import platform02SkillsPack from '../data/exercises/platform-02-skills-pack.js';

export const MET_B2_MULTIPLE_CHOICE = {
  reading: [...READING, ...platform02SkillsPack.reading],
  listening: [...LISTENING, ...platform02SkillsPack.listening],
  speaking: [...SPEAKING, ...platform02SkillsPack.speaking],
  writing: [...WRITING, ...platform02SkillsPack.writing],
  vocabulary: [...VOCABULARY, ...platform02SkillsPack.vocabulary],
  grammar: [...GRAMMAR, ...platform02SkillsPack.grammar],
};

export function getMetB2MultipleChoice(sectionId) {
  return MET_B2_MULTIPLE_CHOICE[sectionId] || [];
}
