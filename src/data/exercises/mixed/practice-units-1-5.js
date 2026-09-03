export const UNITS_1_TO_5 = [
  {
    id: 'unit_1',
    title: 'Unit 1: Healthcare & Hospital Routines',
    level: 'B1+',
    reading: {
      passage: 'Modern healthcare facilities rely heavily on structured handoff procedures to prevent communication lapses during shift changes. Effective communication ensures patient safety.',
      quiz: [
        {
          question: 'What is the primary goal of structured handoff procedures?',
          options: ['To minimize paperwork', 'To ensure patient safety and continuity of care', 'To reduce working hours', 'To train junior nurses'],
          correctAnswer: 1,
          explanation: 'Handoffs ensure essential clinical details are accurately passed on between shifts.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Nurses ___ check vital signs before administering this medication.',
        options: ['must', 'ought', 'may not', 'used to'],
        correctAnswer: 0,
        explanation: '“Must” indicates obligation for safety.'
      }
    ],
    vocabulary: [
      { phrase: 'vital signs', definition: 'Clinical measurements like heart rate and blood pressure', example: 'Record the patient’s vital signs every two hours.' }
    ],
    speaking: {
      setup: 'Describe a standard shift handoff scenario.',
      instructions: 'Speak clearly for 60 seconds explaining how you report patient status.'
    },
    writing: {
      prompt: 'Write a brief clinical summary of a newly admitted patient.',
      criteria: ['Clear chronology', 'Accurate medical terminology', 'Professional tone'],
      wordCount: 150
    },
    listening: {
      script: [
        { speaker: 'Nurse A', text: 'Room 204 is resting comfortably post-procedure.' },
        { speaker: 'Nurse B', text: 'Great, did the physician update the medication chart?' },
        { speaker: 'Nurse A', text: 'Yes, everything is signed off.' }
      ]
    }
  },
  {
    id: 'unit_2',
    title: 'Unit 2: Academic Study & Research Methods',
    level: 'B1+',
    reading: {
      passage: 'Academic research requires systematic methodologies and rigorous literature reviews to establish validity.',
      quiz: [
        {
          question: 'Why is a literature review necessary in academic research?',
          options: ['To fulfill formatting rules', 'To understand current knowledge and identify gaps', 'To make papers longer', 'To publish quickly'],
          correctAnswer: 1,
          explanation: 'Literature reviews contextualize new research within existing scholarly work.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Researchers ___ several trials before reaching definitive conclusions.',
        options: ['have conducted', 'has conducted', 'conducting', 'was conducted'],
        correctAnswer: 0,
        explanation: 'Present perfect with plural subject “Researchers”.'
      }
    ],
    vocabulary: [
      { phrase: 'peer review', definition: 'Evaluation of scientific work by others working in the same field', example: 'The study was published after rigorous peer review.' }
    ],
    speaking: {
      setup: 'Explain the importance of peer review.',
      instructions: 'Speak for 60 seconds outlining why peer review maintains research quality.'
    },
    writing: {
      prompt: 'Summarize the ethical considerations in clinical research.',
      criteria: ['Informed consent', 'Data privacy', 'Risk assessment'],
      wordCount: 150
    },
    listening: {
      script: [
        { speaker: 'Professor', text: 'Be sure your survey sample is representative.' },
        { speaker: 'Student', text: 'I have included participants across three demographics.' }
      ]
    }
  },
  {
    id: 'unit_3',
    title: 'Unit 3: Environmental Sciences & Conservation',
    level: 'B1+',
    reading: {
      passage: 'Urban canopy expansion helps mitigate the urban heat island effect while improving local air filtration.',
      quiz: [
        {
          question: 'What benefit does urban tree canopy provide?',
          options: ['Increased heat absorption', 'Mitigation of heat island effects and air filtration', 'Higher traffic speed', 'Reduced rainfall'],
          correctAnswer: 1,
          explanation: 'Trees provide shading, cooling, and natural air filtration.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'If cities ___ more green spaces, ambient temperatures ___ noticeably.',
        options: ['add / will decrease', 'adds / will decrease', 'added / will decrease', 'add / decreases'],
        correctAnswer: 0,
        explanation: 'First conditional structure.'
      }
    ],
    vocabulary: [
      { phrase: 'biodiversity', definition: 'The variety of plant and animal life in a particular habitat', example: 'Urban parks enhance local biodiversity.' }
    ],
    speaking: {
      setup: 'Discuss the benefits of urban parks.',
      instructions: 'Provide two main reasons why cities should invest in green spaces.'
    },
    writing: {
      prompt: 'Describe how community gardens contribute to sustainability.',
      criteria: ['Environmental benefits', 'Social cohesion', 'Food production'],
      wordCount: 150
    },
    listening: {
      script: [
        { speaker: 'Speaker A', text: 'Our city planted 5,000 native trees along major roads.' },
        { speaker: 'Speaker B', text: 'Air monitoring stations already show lower particulate levels.' }
      ]
    }
  },
  {
    id: 'unit_4',
    title: 'Unit 4: Technology & Telehealth',
    level: 'B1+',
    reading: {
      passage: 'Telehealth platforms bridge geographic barriers, allowing specialists to consult with remote patients seamlessly.',
      quiz: [
        {
          question: 'What is a major advantage of telehealth mentioned in the text?',
          options: ['It replaces all in-person procedures', 'It connects remote patients with specialists', 'It reduces the need for internet access', 'It eliminates hospital facilities'],
          correctAnswer: 1,
          explanation: 'Telehealth overcomes geographical distances for specialized care.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Patients who live in rural areas ___ significantly from remote monitoring.',
        options: ['benefit', 'benefits', 'is benefiting', 'benefited by'],
        correctAnswer: 0,
        explanation: 'Subject-verb agreement: plural “Patients” takes “benefit”.'
      }
    ],
    vocabulary: [
      { phrase: 'remote monitoring', definition: 'Tracking patient health metrics from a distance using digital sensors', example: 'Remote monitoring alerted the cardiology team.' }
    ],
    speaking: {
      setup: 'Compare virtual appointments with in-clinic visits.',
      instructions: 'State one advantage and one limitation of virtual consultations.'
    },
    writing: {
      prompt: 'Discuss how digital health records improve coordination of care.',
      criteria: ['Accessibility', 'Accuracy', 'Interprofessional communication'],
      wordCount: 150
    },
    listening: {
      script: [
        { speaker: 'Doctor', text: 'Can you show me the incision site through the camera?' },
        { speaker: 'Patient', text: 'Yes, here it is. It looks much less swollen today.' }
      ]
    }
  },
  {
    id: 'unit_5',
    title: 'Unit 5: Nutrition & Preventive Health',
    level: 'B1+',
    reading: {
      passage: 'Preventive healthcare initiatives focus on lifestyle modifications such as balanced nutrition and physical activity to prevent chronic illnesses.',
      quiz: [
        {
          question: 'What is the focus of preventive healthcare initiatives?',
          options: ['Surgical treatments only', 'Lifestyle modifications and chronic disease prevention', 'Emergency room expansion', 'Medication advertising'],
          correctAnswer: 1,
          explanation: 'Preventive medicine focuses on lifestyle factors to prevent disease onset.'
        }
      ]
    },
    grammar: [
      {
        sentence: 'Adopting balanced nutritional habits ___ chronic disease risk.',
        options: ['reduces', 'reduce', 'are reducing', 'have reduced'],
        correctAnswer: 0,
        explanation: 'Gerund phrase subject (“Adopting...”) takes singular verb “reduces”.'
      }
    ],
    vocabulary: [
      { phrase: 'dietary fiber', definition: 'Plant-derived food component that aids digestion', example: 'Adequate dietary fiber supports metabolic health.' }
    ],
    speaking: {
      setup: 'Explain the benefits of regular physical activity.',
      instructions: 'Deliver a 60-second explanation of how daily exercise benefits long-term health.'
    },
    writing: {
      prompt: 'Write a proposal for a workplace wellness campaign promoting balanced nutrition.',
      criteria: ['Feasible recommendations', 'Employee incentives', 'Measurable outcomes'],
      wordCount: 150
    },
    listening: {
      script: [
        { speaker: 'Nutritionist', text: 'Gradual dietary changes are much easier to maintain.' },
        { speaker: 'Client', text: 'I started by adding fresh vegetables to every lunch.' }
      ]
    }
  }
];
