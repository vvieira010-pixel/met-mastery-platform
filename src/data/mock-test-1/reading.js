export const READING_PART1 = {
  label: 'Part 1 · Grammar & Reading',
  instructions: 'Choose the one word or phrase that best completes the sentence.',
  questions: [
    { id: 'r1_1', text: 'The hospital administrator announced that new shift schedules ___ implemented next month.', options: ['will be', 'are been', 'would being', 'have to'], answer: 0, level: 'B2', type: 'grammar' },
    { id: 'r1_2', text: 'Nurses must ensure that patient records are kept strictly confidential, ___ circumstances.', options: ['whatever the', 'in spite of', 'regardless of the', 'even though'], answer: 2, level: 'B2', type: 'grammar' },
    { id: 'r1_3', text: 'Had the doctor known about the allergy earlier, she ___ a different medication.', options: ['prescribed', 'would prescribe', 'would have prescribed', 'will have prescribed'], answer: 2, level: 'B2', type: 'grammar' },
    { id: 'r1_4', text: 'The laboratory results were ___ consistent with the preliminary diagnosis.', options: ['broadly', 'heavily', 'tightly', 'strictly'], answer: 0, level: 'B2', type: 'vocabulary' },
    { id: 'r1_5', text: 'Neither the surgeon nor the assisting staff ___ aware of the power outage in the east wing.', options: ['were', 'was', 'are', 'have been'], answer: 1, level: 'B2', type: 'grammar' },
    { id: 'r1_6', text: 'The clinical trial had to be suspended due to an unexpected ___ of side effects.', options: ['incident', 'incidence', 'incidental', 'coincide'], answer: 1, level: 'B2', type: 'vocabulary' },
    { id: 'r1_7', text: 'Patients are advised to abstain from eating ___ twelve hours prior to surgery.', options: ['for at least', 'during up to', 'since within', 'until around'], answer: 0, level: 'B2', type: 'grammar' },
    { id: 'r1_8', text: 'Effective communication among medical personnel is essential ___ preventing medical errors.', options: ['for', 'to', 'with', 'by'], answer: 0, level: 'B2', type: 'grammar' },
    { id: 'r1_9', text: 'The newly acquired imaging scanner is capable of detecting anomalies ___ standard x-rays cannot reveal.', options: ['whose', 'that', 'what', 'where'], answer: 1, level: 'B2', type: 'grammar' },
    { id: 'r1_10', text: 'The dosage should be adjusted ___ to the patient’s body weight and kidney function.', options: ['accordingly', 'proportionately', 'substantially', 'consequently'], answer: 1, level: 'B2', type: 'vocabulary' },
  ],
};

export const READING_PART2 = {
  label: 'Part 2 · Short Passages',
  instructions: 'Read each passage and answer the questions that follow based on what is stated or implied.',
  passages: [
    {
      id: 'r2_p1',
      title: 'Post-Operative Mobilization Protocols',
      text: 'Early ambulation—getting patients up and walking soon after surgical procedures—has become a cornerstone of contemporary perioperative nursing. Research consistently indicates that prolonged bed rest correlates with increased risks of deep vein thrombosis, pulmonary embolism, and loss of muscle mass. When patients begin gentle walking within twelve to twenty-four hours post-surgery, their respiratory mechanics improve substantially, gastrointestinal motility resumes faster, and overall hospital stays are shortened by an average of thirty percent. However, protocols must remain individualized: factors such as hemodynamic stability, pain control, and surgical site integrity must be assessed before initiating movement.',
      questions: [
        { id: 'r2_q1', text: 'What is the main purpose of the passage?', options: ['To discourage surgical interventions for minor injuries', 'To highlight the clinical advantages of early post-operative walking', 'To compare different brands of mobility assistive devices', 'To explain the surgical procedure for deep vein thrombosis'], answer: 1, level: 'B2', type: 'reading' },
        { id: 'r2_q2', text: 'According to the text, which of the following is reduced by early ambulation?', options: ['The hospital duration of stay', 'The necessity for pre-operative assessments', 'The reliance on individualized care plans', 'The baseline hemodynamic stability'], answer: 0, level: 'B2', type: 'reading' },
        { id: 'r2_q3', text: 'What must healthcare providers evaluate before a patient walks after surgery?', options: ['The patient’s insurance policy', 'The availability of family visitors', 'Pain management and hemodynamic stability', 'The hospital discharge schedule'], answer: 2, level: 'B2', type: 'reading' },
      ],
    },
    {
      id: 'r2_p2',
      title: 'Digital Triage in Emergency Departments',
      text: 'Emergency departments worldwide are increasingly integrating AI-assisted digital triage software to streamline patient flow during peak admission hours. These automated systems collect vital signs, pain metrics, and presenting complaints directly from patients or paramedics, calculating an acuity score within seconds. Preliminary trials indicate that high-priority cases such as acute coronary syndromes are flagged forty percent faster than with traditional paper-based intake. Nonetheless, clinicians emphasize that artificial intelligence serves as a decision-support tool rather than an autonomous diagnosis engine; senior nursing triage staff retain final authority over resource allocation and bed assignments.',
      questions: [
        { id: 'r2_q4', text: 'What is the primary benefit of digital triage systems noted in the passage?', options: ['They eliminate the need for emergency nurses', 'They expedite the identification of critical cases', 'They diagnose complex illnesses autonomously', 'They reduce the cost of paramedic transport'], answer: 1, level: 'B2', type: 'reading' },
        { id: 'r2_q5', text: 'Who maintains the final authority in determining patient care priorities?', options: ['The automated triage algorithm', 'The hospital administrative board', 'The senior triage nursing staff', 'The paramedic team dispatchers'], answer: 2, level: 'B2', type: 'reading' },
      ],
    },
  ],
};

export const READING_PART3 = {
  label: 'Part 3 · Extended Text Sets',
  instructions: 'Read the multi-part texts and answer the questions that follow.',
  textSets: [
    {
      id: 'r3_ts1',
      title: 'Community Health Interventions & Urban Air Quality',
      texts: [
        {
          heading: 'Text A: Public Health Advisory',
          body: 'Urban regions with elevated particulate matter (PM2.5) have documented a 15% increase in pediatric asthma admissions over the past triennium. Vulnerable populations, including older adults with chronic obstructive pulmonary disease and pediatric patients, are urged to monitor municipal air quality indices before engaging in outdoor physical exertion.'
        },
        {
          heading: 'Text B: Hospital Initiative Report',
          body: 'Metropolitan Health launched a mobile screening and preventive education clinic targeting underserved neighborhoods located near major industrial corridors. During its first six months of operation, over 1,200 spirometry assessments were conducted, identifying early-stage respiratory impairment in 280 individuals who previously lacked primary care access.'
        }
      ],
      questions: [
        { id: 'r3_q1', text: 'Both texts address which central healthcare issue?', options: ['Dietary deficiencies in urban centers', 'The impact of environmental pollution on respiratory health', 'New pharmacological treatments for asthma', 'Emergency room staffing shortages'], answer: 1, level: 'B2', type: 'reading' },
        { id: 'r3_q2', text: 'What did the mobile clinic accomplish during its initial six months?', options: ['It distributed portable air filtration units', 'It conducted more than 1,200 respiratory screenings', 'It trained municipal air quality inspectors', 'It rebuilt local hospital facilities'], answer: 1, level: 'B2', type: 'reading' },
      ],
    },
  ],
};
