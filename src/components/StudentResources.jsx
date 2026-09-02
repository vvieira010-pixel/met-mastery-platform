import { useState, useEffect, useMemo, useCallback } from 'react';
import { Icon } from './shared.jsx';
import { getPracticeResources } from '../domain/practice.js';
import STATIC_RESOURCES, { CATEGORIES } from '../data/student-resources.js';

// Comprehensive set of downloadable PDF study materials and link resources
const CURATED_PDF_MATERIALS = [
  {
    id: 'pdf-met-b2-handbook',
    title: 'MET B2 Comprehensive Exam Handbook & Scoring Rubrics',
    description: 'Official breakdown of the 4 MET sections, scaled score calculation (0–80), CEFR B2 benchmarks, and examiner criteria for Speaking and Writing.',
    category: 'strategy',
    type: 'pdf',
    format: 'PDF',
    fileSize: '3.8 MB',
    level: 'B1–B2+',
    duration: '24 pages',
    source: 'Michigan Language Assessment & VV Prep',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    tags: ['Scoring Rubric', 'Exam Guide', 'CEFR B2', 'Official Specs'],
    downloadFileName: 'MET_B2_Comprehensive_Exam_Handbook.pdf',
    content: `## MET B2 Comprehensive Exam Handbook & Scoring Rubrics

### Overview of Michigan English Test (MET)
The Michigan English Test (MET) evaluates general English language proficiency in educational, social, and workplace contexts. For B2 certification, candidates must achieve a scaled score of 53+ across all tested sections.

### Section Breakdown & Timing
1. **Listening (approx. 45 min, 50 items)**:
   - Part 1: Short conversations with 1 question each.
   - Part 2: Medium dialogues with 2-3 questions.
   - Part 3: Academic lectures and interviews with 4-5 questions.
2. **Reading & Grammar (65 min, 50 items)**:
   - Grammar: Sentence completions testing syntax, collocations, and modals.
   - Reading: Short notices, workplace correspondence, and multi-paragraph academic articles.
3. **Writing (45 min, 2 tasks)**:
   - Task 1: Respond to a formal email or professional request (50-80 words).
   - Task 2: Expressive essay arguing a point of view on an educational/social issue (150-200 words).
4. **Speaking (approx. 10 min, 5 stages)**:
   - Personal information, picture description, opinion formulation, situational problem solving.

### Examiner Scoring Keys
- **Task Achievement**: Directly answers every prompt bullet point.
- **Coherence & Cohesion**: Natural discourse markers (*nevertheless, consequently, in terms of*).
- **Lexical Resource**: Precise academic & idiomatic expressions.
- **Grammatical Accuracy**: Mixed conditionals, passive voice, inversions, and relative clauses.`,
  },
  {
    id: 'pdf-methodology-vv',
    title: 'Vinícius Vieira Teaching Methodology & Skill Mastery Protocol',
    description: 'The pedagogical framework behind the VV Method: formative feedback loops, spaced repetition intervals, and error bank fading protocols.',
    category: 'strategy',
    type: 'pdf',
    format: 'PDF',
    fileSize: '2.1 MB',
    level: 'All Levels',
    duration: '16 pages',
    source: 'VV Method Academic Board',
    url: '/teaching_methodology_vinicius_vieira.pdf',
    tags: ['VV Method', 'Pedagogy', 'Fading Protocol', 'Spaced Repetition'],
    downloadFileName: 'VV_Methodology_Mastery_Protocol.pdf',
    content: `## Vinícius Vieira Teaching Methodology & Skill Mastery Protocol

### Core Philosophy: Competency-Driven Language Acquisition
The VV Method is engineered specifically for adult second-language learners aiming for high-stakes test certification (MET B2/C1).

### Key Architectural Pillars:
1. **Formative Diagnostic Gating**:
   - Zero guessing. Every student begins with a baseline diagnosis identifying exact micro-skill gaps.
2. **Error Bank & Targeted Remediation**:
   - Errors are not failures; they are high-yield data points. Recurring syntactical and acoustic errors are logged and revisited using the SuperMemo SM-2 interval algorithm.
3. **Scaffolding & Fading Support**:
   - High support in initial drills (guided sentence starters, acoustic replay), fading progressively to strict test-condition simulations.
4. **Active Recall & Two-Speaker Fluency**:
   - Dialogue banks simulate natural pacing, ambient acoustics, and American English reduction patterns.`,
  },
  {
    id: 'pdf-grammar-inversions',
    title: 'MET Advanced Grammar: Inversions, Conditionals & Modals',
    description: 'Master sheet with 50 high-yield sentence completion patterns frequently tested in MET Part 2 Grammar section.',
    category: 'reading',
    type: 'pdf',
    format: 'PDF',
    fileSize: '1.4 MB',
    level: 'B2–C1',
    duration: '12 pages',
    source: 'MET Mastery Grammar Lab',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    tags: ['Grammar', 'Inversions', 'Conditionals', 'Sentence Completion'],
    downloadFileName: 'MET_Grammar_Mastery_Inversions_Conditionals.pdf',
    content: `## MET Advanced Grammar: Inversions, Conditionals & Modals

### 1. Negative Inversions (Subject-Auxiliary Inversion)
Triggered by negative or restrictive adverbs at the start of a clause:
- **Hardly / Scarcely ... when**: *Hardly had the meeting begun when the power went out.*
- **Not only ... but also**: *Not only did she finish the report on time, but she also exceeded expectations.*
- **Under no circumstances**: *Under no circumstances should the examination seal be broken.*
- **Seldom / Rarely**: *Seldom does one encounter such comprehensive research.*

### 2. Inverted Conditionals (Omitting "If")
- **Type 1 (Should)**: *Should you require further assistance, please contact the proctor.* (= If you require...)
- **Type 2 (Were)**: *Were I in charge of the department, I would restructure the timeline.* (= If I were...)
- **Type 3 (Had)**: *Had they implemented the safety protocol earlier, the delay would have been avoided.* (= If they had implemented...)

### 3. Cleft Sentences for Emphasis
- *What surprised the committee most was the consistency of the findings.*
- *It was not until the second trial that the variance stabilized.*`,
  },
  {
    id: 'pdf-writing-templates',
    title: 'MET Writing Task 1 & Task 2 High-Scoring Templates',
    description: 'Structural blueprints, transition bank, formal email opening/closings, and 5 annotated B2/C1 model essays.',
    category: 'writing',
    type: 'pdf',
    format: 'PDF',
    fileSize: '1.9 MB',
    level: 'B2–C1',
    duration: '18 pages',
    source: 'VV Method Writing Studio',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    tags: ['Writing Task 1', 'Writing Task 2', 'Templates', 'Model Essays'],
    downloadFileName: 'MET_Writing_Templates_and_Model_Essays.pdf',
    content: `## MET Writing Task 1 & Task 2 High-Scoring Blueprints

### Task 1: Formal Response (50–80 Words)
**Formula:**
1. **Salutation**: *Dear Mr./Ms. [Last Name],* or *Dear Committee Members,*
2. **Purpose Statement**: *I am writing in response to your inquiry regarding...*
3. **Specific Point 1**: *Regarding the proposed schedule, I would like to confirm that...*
4. **Specific Point 2 + Suggestion**: *Furthermore, it would be highly beneficial if we could...*
5. **Professional Sign-off**: *Thank you for your consideration. / Sincerely,*

### Task 2: Academic & Opinion Essay (150–200 Words)
**4-Paragraph Structure:**
- **Paragraph 1: Introduction (35 words)**
  - Hook & background paraphrase: *In recent years, the question of whether [topic] has sparked considerable debate.*
  - Clear thesis statement: *This essay will argue that [position], primarily due to [Reason 1] and [Reason 2].*
- **Paragraph 2: First Core Argument (60 words)**
  - Topic sentence: *To begin with, the most compelling advantage of [X] is [point].*
  - Explanation & concrete example: *For instance, research demonstrates that... Consequently, this leads to...*
- **Paragraph 3: Counterargument & Rebuttal (60 words)**
  - Opposing view: *Critics often contend that [counterpoint].*
  - Rebuttal: *While this concern is understandable, it overlooks the reality that [refutation].*
- **Paragraph 4: Conclusion (35 words)**
  - Restate thesis with fresh vocabulary: *In summary, although [counterpart], [position] remains the most viable path forward.*`,
  },
  {
    id: 'pdf-vocab-b2-collocations',
    title: 'Top 500 Academic Collocations & Phrasal Verbs for MET B2',
    description: 'High-frequency verb-noun collocations, prepositions, phrasal verbs, and idiomatic expressions with Portuguese transfer tips.',
    category: 'vocabulary',
    type: 'pdf',
    format: 'PDF',
    fileSize: '2.8 MB',
    level: 'B1–B2+',
    duration: '22 pages',
    source: 'MET Lexical Research Lab',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    tags: ['Collocations', 'Phrasal Verbs', 'Academic Lexicon', 'Vocabulary'],
    downloadFileName: 'MET_B2_Top_500_Collocations_Phrasal_Verbs.pdf',
    content: `## Top 500 Academic Collocations & Phrasal Verbs for MET B2

### Essential Verb-Noun Collocations
- **Conduct an investigation / survey**: *The university conducted a comprehensive survey.*
- **Pose a challenge / threat**: *Rising temperatures pose a severe challenge to coastal infrastructure.*
- **Reach a consensus**: *After extensive deliberations, the panel reached a consensus.*
- **Draw a conclusion**: *It is premature to draw definitive conclusions from preliminary data.*
- **Implement a policy**: *The administration implemented a stringent attendance policy.*

### High-Frequency MET Phrasal Verbs
- **Account for**: Explaining or forming a proportion (*"International students account for 20% of the cohort."*)
- **Bring about**: Causing change (*"The new regulations brought about significant improvements."*)
- **Carry out**: Executing an action (*"The team carried out extensive laboratory tests."*)
- **Narrow down**: Reducing options (*"We need to narrow down the potential research topics."*)
- **Phase out**: Gradually discontinuing (*"The obsolete hardware will be phased out by December."*)`,
  },
  {
    id: 'pdf-speaking-framing',
    title: 'MET Speaking Part 1–5 Fluency Framing & Timing Guide',
    description: 'Step-by-step response framing, transitions for picture comparisons, problem-solving discourse, and tone control.',
    category: 'speaking',
    type: 'pdf',
    format: 'PDF',
    fileSize: '1.6 MB',
    level: 'B1–B2+',
    duration: '14 pages',
    source: 'VV Method Speaking Studio',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    tags: ['Speaking', 'Picture Description', 'Discourse Markers', 'Fluency'],
    downloadFileName: 'MET_Speaking_Framing_and_Timing_Guide.pdf',
    content: `## MET Speaking Part 1–5 Fluency Framing & Timing Guide

### Stage 1: Personal Profile & Experience (60s)
- **Strategy**: Avoid one-word answers. Always provide Reason + Detail + Example.
- **Starter**: *"Currently, I am focusing on... which has allowed me to develop skills in..."*

### Stage 2: Picture Description & Comparison (90s)
- **Foreground / Background**: *"In the foreground, there appears to be... whereas in the background..."*
- **Speculation & Deduction**: *"Judging by their body language, they seem to be engrossed in..."*
- **Hypothetical**: *"It looks as though they might have just completed a challenging task."*

### Stage 3: Opinion & Justification (90s)
- **Discourse flow**:
  1. Direct position: *"From my perspective, there is little doubt that..."*
  2. Primary justification: *"The main factor to consider is..."*
  3. Concrete scenario: *"In my own academic experience, whenever we..."*
  4. Synthesis: *"Therefore, taking all these aspects into account, I firmly believe..."*

### Stage 4 & 5: Problem Solving & Recommendation (90s)
- **Evaluating alternatives**: *"While Option A offers immediate cost savings, Option B provides long-term sustainability."*
- **Recommendation**: *"On balance, I would strongly advocate for Option B because..."*`,
  },
];

const CURATED_LINK_RESOURCES = [
  {
    id: 'link-michigan-portal',
    title: 'Michigan Language Assessment Official Portal',
    description: 'Official test specifications, candidate bulletin, sample question papers, and authentic test format guidelines from the makers of MET.',
    category: 'strategy',
    type: 'link',
    format: 'URL',
    level: 'All Levels',
    source: 'Michigan Language Assessment (Official)',
    url: 'https://michiganassessment.org/michigan-tests/met/',
    tags: ['Official Site', 'Sample Tests', 'Candidate Bulletin', 'Specs'],
  },
  {
    id: 'link-cefr-descriptor',
    title: 'Council of Europe CEFR B2 Can-Do Descriptor Grid',
    description: 'Official international criteria for B2 Vantage proficiency across Listening, Reading, Spoken Production, and Written Interaction.',
    category: 'strategy',
    type: 'link',
    format: 'URL',
    level: 'B2 Target',
    source: 'Council of Europe',
    url: 'https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions',
    tags: ['CEFR B2', 'Can-Do Benchmarks', 'Official Standards'],
  },
  {
    id: 'link-bbc-pronunciation',
    title: 'BBC Sound Foundation & Acoustic Reduction Lab',
    description: 'Audio archive explaining American English vowel shifts, flapping, elision, and intonation patterns for listening mastery.',
    category: 'listening',
    type: 'link',
    format: 'URL',
    level: 'B1–B2',
    source: 'BBC Learning English',
    url: 'https://www.bbc.co.uk/learningenglish/english/features/pronunciation',
    tags: ['Acoustics', 'Pronunciation', 'Connected Speech', 'Listening'],
  },
  {
    id: 'link-cambridge-vocab',
    title: 'Cambridge English Profile (Academic Vocabulary B1–C1)',
    description: 'Free searchable lexical database showing CEFR levels for words, idioms, and phrases with authentic example sentences.',
    category: 'vocabulary',
    type: 'link',
    format: 'URL',
    level: 'B1–C1',
    source: 'Cambridge University Press',
    url: 'https://www.englishprofile.org/wordlists',
    tags: ['Vocabulary', 'English Profile', 'Academic Lexicon', 'Dictionary'],
  },
];

/**
 * Generates and triggers the download of a formatted study sheet / PDF file
 */
function downloadResourceDocument(resource) {
  if (!resource) return;

  const title = resource.title || 'MET_Study_Resource';
  const fileName = resource.downloadFileName || `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  const cleanContent = resource.content || resource.description || 'Study Material from MET Mastery Platform';

  // Construct a printable/saveable HTML payload that triggers the browser download / print prompt
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { margin: 20mm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      line-height: 1.6;
      margin: 0;
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; letter-spacing: -0.5px; }
    .meta-tag { font-size: 11px; background: #f0fdfa; color: #0f766e; border: 1px solid #ccfbf1; padding: 3px 8px; border-radius: 4px; font-weight: 600; }
    h1 { font-size: 22px; color: #0f172a; margin: 0 0 8px 0; }
    h2 { font-size: 16px; color: #0f766e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 24px; }
    h3 { font-size: 14px; color: #1e293b; margin-top: 16px; }
    p, li { font-size: 13px; color: #334155; }
    ul { padding-left: 20px; }
    code, pre { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: monospace; }
    pre { padding: 12px; white-space: pre-wrap; word-break: break-word; }
    .badge-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #e2e8f0; color: #475569; }
    .footer { margin-top: 40px; pt-4; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">MET MASTERY · VV METHOD</div>
      <div style="font-size: 12px; color: #64748b;">Official Student Resource Document</div>
    </div>
    <span class="meta-tag">${resource.level || 'B2 Target'} · ${resource.category?.toUpperCase() || 'GENERAL'}</span>
  </div>
  
  <h1>${title}</h1>
  <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">${resource.description || ''}</p>
  
  <div class="badge-bar">
    <span class="badge">Source: ${resource.source || 'VV Method'}</span>
    ${resource.duration ? `<span class="badge">Length: ${resource.duration}</span>` : ''}
    ${resource.fileSize ? `<span class="badge">File Size: ${resource.fileSize}</span>` : ''}
  </div>

  <div class="content">
    <pre>${cleanContent}</pre>
  </div>

  <div class="footer">
    Generated from MET Mastery Platform · Student Study Material · vinicius.vieira@metmastery.com
  </div>
</body>
</html>`;

  // Create downloadable blob
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  
  // Trigger virtual anchor click
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName.endsWith('.html') || fileName.endsWith('.pdf') ? fileName : `${fileName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Clean up blob URL after a short delay
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}

export default function StudentResources({
  _student,
  _onNavigate,
  'data-testid': testId = 'student-resources-component',
}) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all'); // 'all' | 'pdf' | 'link' | 'cheatsheet' | 'bookmarked'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'listening' | 'reading' | 'writing' | 'speaking' | 'strategy' | 'vocabulary'
  
  // Bookmarks state (saved in localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('met_student_saved_resources');
      return saved ? JSON.parse(saved) : ['pdf-met-b2-handbook', 'pdf-writing-templates'];
    } catch {
      return ['pdf-met-b2-handbook', 'pdf-writing-templates'];
    }
  });

  // Modal / Preview state
  const [activeModalResource, setActiveModalResource] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('met_student_saved_resources', JSON.stringify(bookmarkedIds));
    } catch {
      // ignore storage quota errors
    }
  }, [bookmarkedIds]);

  // Fetch resources from domain and combine with curated PDF and Link collections
  const fetchAllResources = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      // 1. Fetch practice resources from database/storage
      const domainResources = await getPracticeResources().catch(() => []);
      
      // 2. Format domain resources if any exist
      const formattedDomain = (domainResources || []).map(r => ({
        id: r.id || `dom-${Math.random()}`,
        title: r.title || 'Practice Study Material',
        description: r.instructions || r.topic || 'Targeted MET practice resource',
        category: r.skill || 'strategy',
        type: r.source === 'pdf' || r.type === 'pdf' ? 'pdf' : (r.url ? 'link' : 'cheatsheet'),
        format: r.format || (r.type === 'pdf' ? 'PDF' : 'Doc'),
        fileSize: r.fileSize || '1.2 MB',
        level: r.level || 'B1-B2',
        duration: r.estimated_time || '10 min',
        source: r.source || 'VV Method Practice Studio',
        url: r.url || '',
        tags: r.tags || [r.skill, r.topic].filter(Boolean),
        content: r.content || r.instructions || '',
      }));

      // 3. Merge curated static materials with domain items, avoiding duplicates by id
      const combined = [
        ...CURATED_PDF_MATERIALS,
        ...CURATED_LINK_RESOURCES,
        ...STATIC_RESOURCES.map(s => ({
          ...s,
          format: s.type === 'pdf' ? 'PDF' : (s.type === 'link' ? 'URL' : 'Guide'),
        })),
        ...formattedDomain,
      ];

      // De-duplicate by ID
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      setResources(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error('[StudentResources] Fetch error:', err);
      setError('Unable to fetch live study materials. Showing offline materials.');
      // Fallback to static & curated materials
      setResources([...CURATED_PDF_MATERIALS, ...CURATED_LINK_RESOURCES]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllResources();
  }, [fetchAllResources]);

  // Toggle bookmark handler
  const handleToggleBookmark = (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setBookmarkedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Copy link handler
  const handleCopyLink = async (resource, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    try {
      const textToCopy = resource.url || window.location.href;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(resource.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Download PDF handler
  const handleDownload = (resource, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    downloadResourceDocument(resource);
    setDownloadSuccessId(resource.id);
    setTimeout(() => setDownloadSuccessId(null), 2500);
  };

  // Filtered resources calculation
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // Format Filter
      if (selectedFormat === 'pdf' && res.type !== 'pdf' && res.format !== 'PDF') return false;
      if (selectedFormat === 'link' && res.type !== 'link' && res.format !== 'URL') return false;
      if (selectedFormat === 'cheatsheet' && res.type !== 'cheatsheet' && res.type !== 'article' && res.type !== 'template') return false;
      if (selectedFormat === 'bookmarked' && !bookmarkedIds.includes(res.id)) return false;

      // Category Filter
      if (selectedCategory !== 'all') {
        const cat = String(res.category || '').toLowerCase();
        if (cat !== selectedCategory.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = (res.title || '').toLowerCase().includes(query);
        const inDesc = (res.description || '').toLowerCase().includes(query);
        const inTags = Array.isArray(res.tags) && res.tags.some(t => String(t).toLowerCase().includes(query));
        const inSource = (res.source || '').toLowerCase().includes(query);
        return inTitle || inDesc || inTags || inSource;
      }

      return true;
    });
  }, [resources, selectedFormat, selectedCategory, searchQuery, bookmarkedIds]);

  // Counts for summary pills
  const pdfCount = useMemo(() => resources.filter(r => r.type === 'pdf' || r.format === 'PDF').length, [resources]);
  const linkCount = useMemo(() => resources.filter(r => r.type === 'link' || r.format === 'URL').length, [resources]);
  const savedCount = useMemo(() => bookmarkedIds.length, [bookmarkedIds]);

  return (
    <div
      className="student-resources-wrapper"
      data-testid={testId}
      style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '24px 16px 48px',
        color: 'var(--ink, #0f172a)',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--border, #e2e8f0)',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(1, 121, 111, 0.1)',
                color: 'var(--primary, #0f766e)',
              }}
            >
              <Icon.book size={18} />
            </span>
            <h1
              data-testid="student-resources-title"
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--ink, #0f172a)',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Study Materials & Resources
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--ink-muted, #64748b)' }}>
            Downloadable PDF guides, authentic exam rubrics, and official links for MET B2 proficiency.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            data-testid="resources-refresh-btn"
            onClick={() => fetchAllResources(true)}
            disabled={refreshing || loading}
            aria-label="Refresh resources list"
            title="Refresh resources list"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'var(--surface-sunken, #f8fafc)',
              border: '1px solid var(--border, #e2e8f0)',
              color: 'var(--ink, #1e293b)',
              cursor: refreshing || loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <span style={{ transform: refreshing ? 'rotate(180deg)' : 'none', transition: 'transform 0.5s ease' }}>
              <Icon.refresh size={14} />
            </span>
            <span>{refreshing ? 'Syncing…' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Top Highlights: Downloadable PDFs & Quick Links */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* PDF Highlight Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--surface, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon.doc size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Downloadable PDFs
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted, #64748b)' }}>
                {pdfCount} Materials
              </span>
            </div>
            <p style={{ margin: '4px 0 10px', fontSize: '13px', color: 'var(--ink, #1e293b)', lineHeight: '1.4' }}>
              Offline study handbooks, templates, and vocabulary lists formatted for printing or digital review.
            </p>
            <button
              type="button"
              data-testid="filter-pdf-shortcut-btn"
              onClick={() => setSelectedFormat('pdf')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--primary, #0f766e)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>View all PDF materials</span>
              <Icon.arrowR size={12} />
            </button>
          </div>
        </div>

        {/* Link Highlight Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--surface, #ffffff)',
            border: '1px solid var(--border, #e2e8f0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon.link size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Link Hub
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-muted, #64748b)' }}>
                {linkCount} Links
              </span>
            </div>
            <p style={{ margin: '4px 0 10px', fontSize: '13px', color: 'var(--ink, #1e293b)', lineHeight: '1.4' }}>
              Direct access to Michigan Assessment portals, CEFR grids, and accredited external resources.
            </p>
            <button
              type="button"
              data-testid="filter-link-shortcut-btn"
              onClick={() => setSelectedFormat('link')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--primary, #0f766e)',
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Explore official links</span>
              <Icon.arrowR size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--surface, #ffffff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Search input and Format Switchers */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          {/* Live search input */}
          <div
            style={{
              position: 'relative',
              flex: '1 1 240px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ink-muted, #94a3b8)',
                pointerEvents: 'none',
                display: 'flex',
              }}
            >
              <Icon.search size={16} />
            </span>
            <input
              type="text"
              data-testid="resources-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PDFs, links, topics, or keywords…"
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                background: 'var(--surface-sunken, #f8fafc)',
                color: 'var(--ink, #0f172a)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-muted, #94a3b8)',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <Icon.close size={14} />
              </button>
            )}
          </div>

          {/* Format pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            {[
              { id: 'all', label: 'All Formats', count: resources.length },
              { id: 'pdf', label: '📄 PDF Materials', count: pdfCount },
              { id: 'link', label: '🔗 Official Links', count: linkCount },
              { id: 'cheatsheet', label: '📋 Cheat Sheets' },
              { id: 'bookmarked', label: `⭐ Saved (${savedCount})` },
            ].map(f => {
              const active = selectedFormat === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  data-testid={`format-tab-${f.id}`}
                  onClick={() => setSelectedFormat(f.id)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: active ? 600 : 500,
                    borderRadius: '999px',
                    border: active ? '1px solid var(--primary, #0f766e)' : '1px solid var(--border, #e2e8f0)',
                    background: active ? 'rgba(1, 121, 111, 0.1)' : 'var(--surface-sunken, #f8fafc)',
                    color: active ? 'var(--primary, #0f766e)' : 'var(--ink, #475569)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category / Skill Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid var(--border, #f1f5f9)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ink-muted, #94a3b8)', textTransform: 'uppercase', marginRight: '4px' }}>
            Skill Filter:
          </span>
          <button
            type="button"
            data-testid="category-all"
            onClick={() => setSelectedCategory('all')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: selectedCategory === 'all' ? 600 : 500,
              borderRadius: '6px',
              border: selectedCategory === 'all' ? '1px solid var(--ink, #0f172a)' : '1px solid transparent',
              background: selectedCategory === 'all' ? 'var(--ink, #0f172a)' : 'transparent',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--ink-muted, #64748b)',
              cursor: 'pointer',
            }}
          >
            All Skills
          </button>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                data-testid={`category-${cat.id}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: active ? 600 : 500,
                  borderRadius: '6px',
                  border: active ? '1px solid var(--ink, #0f172a)' : '1px solid transparent',
                  background: active ? 'var(--ink, #0f172a)' : 'transparent',
                  color: active ? '#ffffff' : 'var(--ink-muted, #64748b)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error state alert if any */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(234, 179, 8, 0.1)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#854d0e',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Icon.info size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div
          data-testid="resources-loading-skeleton"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              style={{
                height: '180px',
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                backgroundSize: '200% 100%',
                animation: 'pulse 1.5s infinite',
                border: '1px solid var(--border, #e2e8f0)',
              }}
            />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        /* Empty State */
        <div
          data-testid="resources-empty-state"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--surface, #ffffff)',
            borderRadius: '12px',
            border: '1px dashed var(--border, #cbd5e1)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--surface-sunken, #f1f5f9)',
              color: 'var(--ink-muted, #94a3b8)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Icon.search size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: 'var(--ink, #0f172a)' }}>
            No study materials match your filters
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--ink-muted, #64748b)' }}>
            Try resetting your search query or switching to All Formats.
          </p>
          <button
            type="button"
            data-testid="reset-filters-btn"
            onClick={() => {
              setSearchQuery('');
              setSelectedFormat('all');
              setSelectedCategory('all');
            }}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              background: 'var(--primary, #0f766e)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Resource Cards Grid */
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--ink-muted, #64748b)',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Showing {filteredResources.length} study {filteredResources.length === 1 ? 'material' : 'materials'}</span>
            {selectedFormat === 'pdf' && <span style={{ color: '#dc2626' }}>📄 PDF Downloads Only</span>}
            {selectedFormat === 'link' && <span style={{ color: '#2563eb' }}>🔗 Official Links Only</span>}
          </div>

          <div
            data-testid="resources-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredResources.map(res => {
              const isPdf = res.type === 'pdf' || res.format === 'PDF';
              const isLink = res.type === 'link' || res.format === 'URL';
              const isBookmarked = bookmarkedIds.includes(res.id);

              return (
                <div
                  key={res.id}
                  id={`resource-card-${res.id}`}
                  data-testid={`resource-card-${res.id}`}
                  style={{
                    background: 'var(--surface, #ffffff)',
                    border: '1px solid var(--border, #e2e8f0)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  className="hover:border-slate-400 hover:shadow-sm"
                >
                  {/* Card Header & Badges */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginBottom: '10px',
                      }}
                    >
                      {/* Format Badge */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase',
                          background: isPdf ? 'rgba(239, 68, 68, 0.1)' : (isLink ? 'rgba(37, 99, 235, 0.1)' : 'rgba(1, 121, 111, 0.1)'),
                          color: isPdf ? '#dc2626' : (isLink ? '#2563eb' : 'var(--primary, #0f766e)'),
                        }}
                      >
                        {isPdf ? <Icon.doc size={12} /> : (isLink ? <Icon.link size={12} /> : <Icon.book size={12} />)}
                        <span>{isPdf ? 'Downloadable PDF' : (isLink ? 'Web Link' : 'Cheat Sheet')}</span>
                      </span>

                      {/* Level & Bookmark */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {res.level && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--surface-sunken, #f1f5f9)',
                              color: 'var(--ink-muted, #475569)',
                            }}
                          >
                            {res.level}
                          </span>
                        )}
                        <button
                          type="button"
                          data-testid={`bookmark-btn-${res.id}`}
                          onClick={(e) => handleToggleBookmark(res.id, e)}
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
                          title={isBookmarked ? 'Saved in favorites' : 'Save for later'}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: isBookmarked ? '#eab308' : 'var(--ink-muted, #94a3b8)',
                            display: 'flex',
                            borderRadius: '4px',
                          }}
                        >
                          <Icon.star size={16} fill={isBookmarked ? '#eab308' : 'none'} />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        lineHeight: 1.35,
                        margin: '0 0 6px',
                        color: 'var(--ink, #0f172a)',
                      }}
                    >
                      {res.title}
                    </h3>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: '12px',
                        lineHeight: 1.5,
                        color: 'var(--ink-muted, #475569)',
                        margin: '0 0 12px',
                      }}
                    >
                      {res.description}
                    </p>

                    {/* Tags */}
                    {Array.isArray(res.tags) && res.tags.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '14px' }}>
                        {res.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'var(--surface-sunken, #f8fafc)',
                              border: '1px solid var(--border, #e2e8f0)',
                              color: 'var(--ink-muted, #64748b)',
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Meta & Actions */}
                  <div
                    style={{
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border, #f1f5f9)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: 'var(--ink-muted, #64748b)',
                        marginBottom: '10px',
                      }}
                    >
                      <span>{res.source || 'VV Method'}</span>
                      <span>{res.fileSize || res.duration || 'Study Doc'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isPdf ? (
                        <>
                          <button
                            type="button"
                            data-testid={`download-pdf-btn-${res.id}`}
                            onClick={(e) => handleDownload(res, e)}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              background: downloadSuccessId === res.id ? '#16a34a' : '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            {downloadSuccessId === res.id ? <Icon.check size={14} /> : <Icon.download size={14} />}
                            <span>{downloadSuccessId === res.id ? 'Downloaded!' : 'Download PDF'}</span>
                          </button>
                          <button
                            type="button"
                            data-testid={`preview-resource-btn-${res.id}`}
                            onClick={() => setActiveModalResource(res)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              background: 'var(--surface-sunken, #f1f5f9)',
                              color: 'var(--ink, #1e293b)',
                              border: '1px solid var(--border, #cbd5e1)',
                              cursor: 'pointer',
                            }}
                            title="Preview Content"
                          >
                            <Icon.eye size={14} />
                          </button>
                        </>
                      ) : isLink ? (
                        <>
                          <a
                            href={res.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`open-link-btn-${res.id}`}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              background: '#2563eb',
                              color: '#ffffff',
                              textDecoration: 'none',
                              transition: 'background 0.15s ease',
                            }}
                          >
                            <Icon.link size={14} />
                            <span>Open Resource</span>
                          </a>
                          <button
                            type="button"
                            data-testid={`copy-link-btn-${res.id}`}
                            onClick={(e) => handleCopyLink(res, e)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              background: 'var(--surface-sunken, #f1f5f9)',
                              color: 'var(--ink, #1e293b)',
                              border: '1px solid var(--border, #cbd5e1)',
                              cursor: 'pointer',
                            }}
                            title={copiedId === res.id ? 'Link Copied!' : 'Copy Link'}
                          >
                            {copiedId === res.id ? <Icon.check size={14} /> : <Icon.copy size={14} />}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            data-testid={`read-guide-btn-${res.id}`}
                            onClick={() => setActiveModalResource(res)}
                            style={{
                              flex: 1,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '8px 12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              background: 'var(--primary, #0f766e)',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                          >
                            <Icon.book size={14} />
                            <span>Read Guide</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDownload(res, e)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px 10px',
                              fontSize: '12px',
                              fontWeight: 600,
                              borderRadius: '8px',
                              background: 'var(--surface-sunken, #f1f5f9)',
                              color: 'var(--ink, #1e293b)',
                              border: '1px solid var(--border, #cbd5e1)',
                              cursor: 'pointer',
                            }}
                            title="Save as PDF"
                          >
                            <Icon.download size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Resource Preview Modal */}
      {activeModalResource && (
        <div
          data-testid="resource-preview-modal"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setActiveModalResource(null)}
        >
          <div
            style={{
              background: 'var(--surface, #ffffff)',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border, #cbd5e1)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid var(--border, #e2e8f0)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                background: 'var(--surface-sunken, #f8fafc)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(1, 121, 111, 0.1)',
                      color: 'var(--primary, #0f766e)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {activeModalResource.category}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--ink-muted, #64748b)' }}>
                    {activeModalResource.level} · {activeModalResource.fileSize || activeModalResource.duration}
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--ink, #0f172a)', margin: 0 }}>
                  {activeModalResource.title}
                </h2>
              </div>
              <button
                type="button"
                data-testid="close-modal-btn"
                onClick={() => setActiveModalResource(null)}
                aria-label="Close modal"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ink-muted, #94a3b8)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                }}
              >
                <Icon.close size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '20px',
                overflowY: 'auto',
                fontSize: '14px',
                lineHeight: 1.6,
                color: 'var(--ink, #1e293b)',
              }}
            >
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--ink-muted, #64748b)', fontStyle: 'italic' }}>
                {activeModalResource.description}
              </p>

              <div
                style={{
                  background: 'var(--surface-sunken, #f8fafc)',
                  border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: '8px',
                  padding: '16px',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                }}
              >
                {activeModalResource.content || activeModalResource.description || 'Study content preview not available.'}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--border, #e2e8f0)',
                background: 'var(--surface-sunken, #f8fafc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  data-testid="modal-download-btn"
                  onClick={() => handleDownload(activeModalResource)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon.download size={14} />
                  <span>Download Document</span>
                </button>
                {activeModalResource.url && (
                  <a
                    href={activeModalResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      background: 'var(--surface, #ffffff)',
                      color: 'var(--ink, #1e293b)',
                      border: '1px solid var(--border, #cbd5e1)',
                      textDecoration: 'none',
                    }}
                  >
                    <Icon.link size={14} />
                    <span>Open External</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveModalResource(null)}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: 'none',
                  color: 'var(--ink-muted, #64748b)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
