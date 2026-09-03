export const UNITS_6_TO_10 = [
  {
    id: 'unit_6',
    title: 'Unit 6: Acute Critical Care & Triage',
    level: 'B2',
    reading: {
      passage: 'In acute care settings, clinical deterioration must be recognized swiftly through standardized scoring systems like the National Early Warning Score (NEWS2).',
      quiz: [
        {
          question: 'What is the role of standardized scoring systems like NEWS2?',
          options: ['To automate nurse scheduling', 'To identify early signs of clinical deterioration', 'To replace laboratory testing', 'To calculate treatment billing'],
          correctAnswer: 1,
          explanation: 'Standardized scoring provides objective criteria for detecting patient decline.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Had the emergency team ___ sooner, complications might have been avoided.',
        options: ['arrived', 'arrive', 'been arrived', 'to arrive'],
        correctAnswer: 0,
        explanation: 'Inverted third conditional: Had + subject + past participle.'
      }
    ],
    vocabulary: [
      { phrase: 'hemodynamic stability', definition: 'Adequate blood pressure and flow through all organs', example: 'The team monitored hemodynamic stability continuously.' }
    ],
    speaking: {
      setup: 'Explain triage prioritization principles.',
      instructions: 'Deliver a structured 90-second response detailing how emergency departments prioritize patients by acuity.'
    },
    writing: {
      prompt: 'Discuss the advantages of multidisciplinary rapid response teams in reducing in-hospital mortality.',
      criteria: ['Clear thesis', 'Empirical examples', 'Logical transitions'],
      wordCount: 250
    },
    listening: {
      script: [
        { speaker: 'Dr. Santos', text: 'The arterial blood gas indicates worsening metabolic acidosis.' },
        { speaker: 'Nurse Chen', text: 'I have prepared the bicarbonate infusion and alerted the intensivist.' }
      ]
    }
  },
  {
    id: 'unit_7',
    title: 'Unit 7: Pharmacology & Antimicrobial Stewardship',
    level: 'B2',
    reading: {
      passage: 'Antimicrobial resistance poses a profound global threat, necessitating rigorous antibiotic stewardship programs across inpatient healthcare systems.',
      quiz: [
        {
          question: 'Why are antibiotic stewardship programs critical?',
          options: ['To lower pharmaceutical production costs', 'To combat rising antimicrobial resistance', 'To increase drug shelf life', 'To speed up patent expirations'],
          correctAnswer: 1,
          explanation: 'Stewardship optimizes prescribing practices to prevent resistant bacterial strains.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'It is recommended that broad-spectrum antibiotics ___ only when strictly necessary.',
        options: ['be prescribed', 'are prescribed', 'will be prescribed', 'prescribing'],
        correctAnswer: 0,
        explanation: 'Subjunctive passive after “recommended that”.'
      }
    ],
    vocabulary: [
      { phrase: 'pathogen', definition: 'A bacterium, virus, or other microorganism that can cause disease', example: 'Laboratory cultures identified the resistant pathogen.' }
    ],
    speaking: {
      setup: 'Advise a patient on completing an antibiotic course.',
      instructions: 'Explain clearly why finishing the entire prescribed course prevents bacterial resistance.'
    },
    writing: {
      prompt: 'Evaluate the role of diagnostic rapid testing in minimizing inappropriate antibiotic use.',
      criteria: ['Analytical depth', 'Clinical relevance', 'Academic vocabulary'],
      wordCount: 250
    },
    listening: {
      script: [
        { speaker: 'Pharmacist', text: 'Blood cultures came back negative for bacterial infection.' },
        { speaker: 'Attending Physician', text: 'Then let us de-escalate and discontinue the intravenous vancomycin.' }
      ]
    }
  },
  {
    id: 'unit_8',
    title: 'Unit 8: Bioethics & Patient Autonomy',
    level: 'B2',
    reading: {
      passage: 'Informed consent is not merely a signed document; it is an ongoing dialogue respecting patient autonomy and personal values.',
      quiz: [
        {
          question: 'According to bioethical principles, what constitutes true informed consent?',
          options: ['A brief signature without discussion', 'An ongoing dialogue respecting patient autonomy', 'A hospital administrative formality', 'A legal waiver protecting manufacturers'],
          correctAnswer: 1,
          explanation: 'Informed consent involves comprehensive communication and voluntary decision-making.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Under no circumstances ___ clinicians proceed without voluntary patient consent.',
        options: ['should', 'they should', 'must they to', 'ought'],
        correctAnswer: 0,
        explanation: 'Negative inversion: Under no circumstances + auxiliary + subject + verb.'
      }
    ],
    vocabulary: [
      { phrase: 'patient autonomy', definition: 'The right of patients to make decisions about their medical care', example: 'Shared decision-making upholds patient autonomy.' }
    ],
    speaking: {
      setup: 'Discuss ethical considerations regarding advance directives.',
      instructions: 'Speak for 90 seconds on why advance directives are vital in end-of-life care planning.'
    },
    writing: {
      prompt: 'Analyze the balance between public health mandates and individual healthcare freedoms.',
      criteria: ['Balanced argumentation', 'Bioethical framework', 'Structured conclusion'],
      wordCount: 250
    },
    listening: {
      script: [
        { speaker: 'Bioethicist', text: 'Does the surrogate decision-maker understand the patient’s prior expressed wishes?' },
        { speaker: 'Social Worker', text: 'Yes, the healthcare proxy document was updated last month.' }
      ]
    }
  },
  {
    id: 'unit_9',
    title: 'Unit 9: Health Informatics & Artificial Intelligence',
    level: 'B2',
    reading: {
      passage: 'Predictive algorithms in electronic health records analyze physiological trends to alert care teams before overt decompensation occurs.',
      quiz: [
        {
          question: 'How do predictive algorithms assist clinical care teams?',
          options: ['By automating billing submissions', 'By analyzing vital sign trends to alert teams to early decompensation', 'By replacing radiologist examinations', 'By diagnosing rare diseases without data'],
          correctAnswer: 1,
          explanation: 'Algorithms analyze continuous data to alert clinicians prior to overt crises.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Not only ___ early warning algorithms improve detection, but they also reduce mortality.',
        options: ['do', 'are', 'did they', 'they do'],
        correctAnswer: 0,
        explanation: 'Inversion after “Not only”: auxiliary “do” + subject + verb.'
      }
    ],
    vocabulary: [
      { phrase: 'clinical decision support', definition: 'Digital tools providing health professionals with patient-specific recommendations', example: 'The clinical decision support alert flagged a potential drug interaction.' }
    ],
    speaking: {
      setup: 'Evaluate AI in radiological screening.',
      instructions: 'Deliver a 90-second balanced review of AI algorithms supporting diagnostic imaging accuracy.'
    },
    writing: {
      prompt: 'Discuss how machine learning in health records will influence the clinician-patient relationship.',
      criteria: ['Technology impact', 'Human empathy dimension', 'Critical perspective'],
      wordCount: 250
    },
    listening: {
      script: [
        { speaker: 'Data Specialist', text: 'The neural network achieved 96% sensitivity in identifying diabetic retinopathy.' },
        { speaker: 'Ophthalmologist', text: 'This will drastically reduce screening queues in community clinics.' }
      ]
    }
  },
  {
    id: 'unit_10',
    title: 'Unit 10: Global Public Health & Epidemiology',
    level: 'B2',
    reading: {
      passage: 'Epidemiological surveillance systems track disease incidence, vaccine coverage, and demographic disparities to allocate resources effectively.',
      quiz: [
        {
          question: 'What is the principal objective of epidemiological surveillance?',
          options: ['To track disease patterns and guide public health resource allocation', 'To market private insurance policies', 'To manage hospital payrolls', 'To restrict international travel permanently'],
          correctAnswer: 0,
          explanation: 'Surveillance monitors health trends to direct public health interventions.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Were global health authorities ___ early data sharing, outbreaks could be contained faster.',
        options: ['to mandate', 'mandating', 'mandated', 'mandate'],
        correctAnswer: 0,
        explanation: 'Conditional inversion: Were + subject + to-infinitive.'
      }
    ],
    vocabulary: [
      { phrase: 'herd immunity', definition: 'Resistance to the spread of an infectious disease within a population', example: 'High vaccination rates established effective herd immunity.' }
    ],
    speaking: {
      setup: 'Explain the importance of community vaccination campaigns.',
      instructions: 'Deliver a 90-second talk explaining how community health education overcomes vaccine hesitancy.'
    },
    writing: {
      prompt: 'Evaluate strategies for addressing socioeconomic determinants of health in metropolitan areas.',
      criteria: ['Systemic analysis', 'Concrete policy proposals', 'Academic cohesion'],
      wordCount: 250
    },
    listening: {
      script: [
        { speaker: 'Epidemiologist', text: 'Vector control measures reduced malaria incidence by 40% in the pilot region.' },
        { speaker: 'Health Minister', text: 'We plan to scale the program across neighboring provinces next quarter.' }
      ]
    }
  }
];
