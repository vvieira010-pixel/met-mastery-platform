# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-workflow.test.ts >> student can open every primary workspace page
- Location: tests\auth-workflow.test.ts:77:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.dash-body, main').first()
Expected substring: "Assigned practice"
Received string:    "MET skillsBuild your MET map.Use Subjects to understand each skill, learn the strategies behind it, and choose a focused place to practise next.6 MET skills62 topic explanationsB1–B2 study tipsA simple way to use this pageLearn → notice → practiseChoose a skillStart with the area you want to understand better.Open a topicRead what it is and how to apply it on the MET.Take it to PracticeUse a focused exercise when you are ready to try.Choose a skillWhat do you want to work on?Each subject includes explanations and topic-by-topic guidance. You can return here whenever you need to refresh a strategy.ReadingCore reading skills explanations for MET preparation — from finding the main idea to comparing texts and timing your strategy.FocusRead for purpose, evidence, and meaning in context.12 topicsStarts with: Finding the Main IdeaOpen Reading reference →ListeningB1–B2 listening for MET: catch gist, details, and speaker intent while handling distractors, paraphrase, and connected speech under time pressure.FocusListen for the point, the details, and what the speaker intends.10 topicsStarts with: Listening for the Main Idea (The Gist) — B1Open Listening reference →SpeakingB1–B2 speaking for MET: plan in seconds, describe, narrate, opine, compare, and persuade with clear structure and natural flow.FocusPlan quickly, speak clearly, and keep your answer moving.10 topicsStarts with: Describing a Scene (Task 1) — B1Open Speaking reference →WritingBuild clear responses with a main point, supporting ideas, and accurate language — from decoding the prompt to editing under time pressure.FocusMake your ideas easy to follow from the first sentence to the last.10 topicsStarts with: Understanding the PromptOpen Writing reference →GrammarB1–B2 grammar for accuracy and range: use the right tense, modal, and connector so meaning is precise, not approximate.FocusNotice how grammar changes meaning, time, and relationships between ideas.10 topicsStarts with: Verb Tenses and Time (B1–B2)Open Grammar reference →VocabularyB1–B2 vocabulary for MET: learn words in chunks, recognise paraphrase, and choose the register that fits — from collocations to idioms.FocusLearn words in context so you can understand and use them with confidence.10 topicsStarts with: Meaning in Context — B1Open Vocabulary reference →How to study5 Study Tips — B1–B2Short, repeatable habits that make the 62 units stick. Pick one and start today.5 Words/Day + Spaced Recall10 min/dayKeep vocabulary by reusing it, not by collecting lists. 5 new words max per day, each with collocation + family + your sentence.1. Card = word + collocation + family + your sentence (e.g., put off | put off a meeting | postponement | I put off my dentist appointment until Friday). 2. Review Day 1 → 3 → 7 → 14, 5 min each. 3. Use each word once in speaking and once in writing within 48h. 4. Weekly test: write the collocation from memory; misses go back to Day 1.B1–B245–10 Focus Block45 min study + 10 min breakShort, intense blocks beat long, scattered sessions. One subject per block with a single technique, then switch to reset attention.1. Pick 1 subject + 1 technique (e.g., Reading: skimming map or scanning drill). 2. Work 45 min: 20 min technique → 20 min practice → 5 min quick check. 3. Break 10 min away from screen. 4. 3 blocks = a full session (Reading → Listening → Writing). Track blocks with a simple tally.B1–B2Shadow 10 Seconds Daily5 min/dayMimic native rhythm to fix both listening speed and speaking clarity. Shadowing trains the stressed-word beat that carries meaning.1. Pick a 10-sec MET clip (announcement or dialogue). 2. Listen once for stressed words. 3. Play again and speak along, matching rhythm and linking exactly (gonna, shoulda, didja). 4. Record 1 take and compare endings (-ed, -s) and stress. 5. Same clip 3 days in a row; change clip on day 4.B1–B21 PEEL Paragraph/Day12 min/dayOne perfect paragraph builds writing faster than one rushed essay. PEEL = Point → Explain → Example → Link. Reuse your 5 words inside it.1. Topic sentence = your point (e.g., One benefit of online learning is flexibility). 2. Explain why it matters (cause → effect, 1–2 sentences). 3. Add one specific example (personal or observed, with because/which). 4. Close with As a result / Therefore + link. 5. Insert 1–2 of today's 5 words; check for one complex sentence.B1–B2Weekly Mini-Mock + Evidence Check30 min/weekTrain exam discipline: every answer must point to a line. No line = no point. One focused review teaches more than three unchecked mocks.1. Do 10 reading questions under time (1.5 min each). 2. For each answer, underline the exact 1–2 sentence window that proves it. 3. If two answers feel plausible, pick the one with the closer paraphrase match. 4. Log errors by unit (main idea? scanning? inference?) — next week, drill only the weakest unit. 5. Keep a 4-week error tally to see progress.B1–B2Loading…"

Call log:
  - Expect "toContainText" with timeout 20000ms
  - waiting for locator('.dash-body, main').first()
    5 × locator resolved to <main class="dash-body" id="student-content" aria-label="Homework content">…</main>
      - unexpected value "MET skillsBuild your MET map.Use Subjects to understand each skill, learn the strategies behind it, and choose a focused place to practise next.6 MET skills62 topic explanationsB1–B2 study tipsA simple way to use this pageLearn → notice → practiseChoose a skillStart with the area you want to understand better.Open a topicRead what it is and how to apply it on the MET.Take it to PracticeUse a focused exercise when you are ready to try.Choose a skillWhat do you want to work on?Each subject includes explanations and topic-by-topic guidance. You can return here whenever you need to refresh a strategy.ReadingCore reading skills explanations for MET preparation — from finding the main idea to comparing texts and timing your strategy.FocusRead for purpose, evidence, and meaning in context.12 topicsStarts with: Finding the Main IdeaOpen Reading reference →ListeningB1–B2 listening for MET: catch gist, details, and speaker intent while handling distractors, paraphrase, and connected speech under time pressure.FocusListen for the point, the details, and what the speaker intends.10 topicsStarts with: Listening for the Main Idea (The Gist) — B1Open Listening reference →SpeakingB1–B2 speaking for MET: plan in seconds, describe, narrate, opine, compare, and persuade with clear structure and natural flow.FocusPlan quickly, speak clearly, and keep your answer moving.10 topicsStarts with: Describing a Scene (Task 1) — B1Open Speaking reference →WritingBuild clear responses with a main point, supporting ideas, and accurate language — from decoding the prompt to editing under time pressure.FocusMake your ideas easy to follow from the first sentence to the last.10 topicsStarts with: Understanding the PromptOpen Writing reference →GrammarB1–B2 grammar for accuracy and range: use the right tense, modal, and connector so meaning is precise, not approximate.FocusNotice how grammar changes meaning, time, and relationships between ideas.10 topicsStarts with: Verb Tenses and Time (B1–B2)Open Grammar reference →VocabularyB1–B2 vocabulary for MET: learn words in chunks, recognise paraphrase, and choose the register that fits — from collocations to idioms.FocusLearn words in context so you can understand and use them with confidence.10 topicsStarts with: Meaning in Context — B1Open Vocabulary reference →How to study5 Study Tips — B1–B2Short, repeatable habits that make the 62 units stick. Pick one and start today.5 Words/Day + Spaced Recall10 min/dayKeep vocabulary by reusing it, not by collecting lists. 5 new words max per day, each with collocation + family + your sentence.1. Card = word + collocation + family + your sentence (e.g., put off | put off a meeting | postponement | I put off my dentist appointment until Friday). 2. Review Day 1 → 3 → 7 → 14, 5 min each. 3. Use each word once in speaking and once in writing within 48h. 4. Weekly test: write the collocation from memory; misses go back to Day 1.B1–B245–10 Focus Block45 min study + 10 min breakShort, intense blocks beat long, scattered sessions. One subject per block with a single technique, then switch to reset attention.1. Pick 1 subject + 1 technique (e.g., Reading: skimming map or scanning drill). 2. Work 45 min: 20 min technique → 20 min practice → 5 min quick check. 3. Break 10 min away from screen. 4. 3 blocks = a full session (Reading → Listening → Writing). Track blocks with a simple tally.B1–B2Shadow 10 Seconds Daily5 min/dayMimic native rhythm to fix both listening speed and speaking clarity. Shadowing trains the stressed-word beat that carries meaning.1. Pick a 10-sec MET clip (announcement or dialogue). 2. Listen once for stressed words. 3. Play again and speak along, matching rhythm and linking exactly (gonna, shoulda, didja). 4. Record 1 take and compare endings (-ed, -s) and stress. 5. Same clip 3 days in a row; change clip on day 4.B1–B21 PEEL Paragraph/Day12 min/dayOne perfect paragraph builds writing faster than one rushed essay. PEEL = Point → Explain → Example → Link. Reuse your 5 words inside it.1. Topic sentence = your point (e.g., One benefit of online learning is flexibility). 2. Explain why it matters (cause → effect, 1–2 sentences). 3. Add one specific example (personal or observed, with because/which). 4. Close with As a result / Therefore + link. 5. Insert 1–2 of today's 5 words; check for one complex sentence.B1–B2Weekly Mini-Mock + Evidence Check30 min/weekTrain exam discipline: every answer must point to a line. No line = no point. One focused review teaches more than three unchecked mocks.1. Do 10 reading questions under time (1.5 min each). 2. For each answer, underline the exact 1–2 sentence window that proves it. 3. If two answers feel plausible, pick the one with the closer paraphrase match. 4. Log errors by unit (main idea? scanning? inference?) — next week, drill only the weakest unit. 5. Keep a 4-week error tally to see progress.B1–B2Loading…"
  - Test timeout of 30000ms exceeded.

```

```yaml
- main "Homework content": Loading…
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | 
  3   | const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  4   | 
  5   | type TestUser = {
  6   |   id: string;
  7   |   email: string;
  8   |   user_metadata: { display_name: string };
  9   | };
  10  | 
  11  | const STUDENT: TestUser = {
  12  |   id: '11111111-1111-4111-8111-111111111111',
  13  |   email: 'e2e.student@example.invalid',
  14  |   user_metadata: { display_name: 'E2E Student' },
  15  | };
  16  | 
  17  | const TEACHER: TestUser = {
  18  |   id: '22222222-2222-4222-8222-222222222222',
  19  |   email: 'vvieira010@gmail.com',
  20  |   user_metadata: { display_name: 'E2E Teacher' },
  21  | };
  22  | 
  23  | function storedSession(user: TestUser) {
  24  |   return {
  25  |     // The stored user supplies the identity, so this intentionally non-live
  26  |     // token can never authenticate against an external Supabase project.
  27  |     access_token: 'e2e-isolated-session-token',
  28  |     expires_at: Math.floor(Date.now() / 1000) + 3600,
  29  |     user,
  30  |   };
  31  | }
  32  | 
  33  | async function seedAuthenticatedSession(page: Page, user: TestUser, role: 'student' | 'teacher') {
  34  |   const context = page.context();
  35  | 
  36  |   // All Supabase calls are fulfilled in the browser: these tests do not use a
  37  |   // real account, change production data, or require a local database.
  38  |   await context.route('**/rest/v1/**', route => route.fulfill({
  39  |     status: 200,
  40  |     contentType: 'application/json',
  41  |     body: '[]',
  42  |   }));
  43  |   await context.route('**/rest/v1/rpc/claim_student_by_email', route => route.fulfill({
  44  |     status: 200,
  45  |     contentType: 'application/json',
  46  |     body: role === 'student'
  47  |       ? JSON.stringify([{ id: user.id, local_id: 'e2e-student' }])
  48  |       : '[]',
  49  |   }));
  50  |   await page.addInitScript(({ session }) => {
  51  |     localStorage.setItem('vv:supabase_session', JSON.stringify(session));
  52  |   }, { session: storedSession(user) });
  53  | }
  54  | 
  55  | async function openStudentDashboard(page: Page) {
  56  |   await seedAuthenticatedSession(page, STUDENT, 'student');
  57  |   await page.goto(BASE);
  58  |   await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
  59  | }
  60  | 
  61  | async function openTeacherDashboard(page: Page) {
  62  |   await seedAuthenticatedSession(page, TEACHER, 'teacher');
  63  |   await page.goto(BASE);
  64  |   await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible({ timeout: 15_000 });
  65  | }
  66  | 
  67  | test('public landing opens the real sign-in screen and validates an empty form', async ({ page }) => {
  68  |   await page.goto(BASE);
  69  |   await expect(page.getByText('Prepare for the MET', { exact: false })).toBeVisible();
  70  | 
  71  |   await page.getByRole('button', { name: 'Sign in', exact: true }).first().click();
  72  |   await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  73  |   await page.getByRole('button', { name: 'Access Workspace', exact: true }).click();
  74  |   await expect(page.getByText('Please enter your email and password.', { exact: true })).toBeVisible();
  75  | });
  76  | 
  77  | test('student can open every primary workspace page', async ({ page }) => {
  78  |   await openStudentDashboard(page);
  79  |   await expect(page.getByRole('img', { name: /Academic progress area chart/ })).toBeVisible({ timeout: 20_000 });
  80  |   await expect(page.getByText('Chart could not load. Check your connection.')).toHaveCount(0);
  81  | 
  82  |   const destinations = [
  83  |     { button: 'Home', text: /Good (morning|afternoon|evening),/ },
  84  |     { button: 'Practice', text: 'Six skills, zero clutter' },
  85  |     { button: 'Subjects', text: 'MET skills' },
  86  |     { button: 'Homework', text: 'Assigned practice' },
  87  |     { button: 'Feedback', text: "Your teacher's latest notes" },
  88  |     { button: 'Progress', text: 'Your MET progress path' },
  89  |     { button: 'Resources', text: 'Study Materials & Resources' },
  90  |   ] as const;
  91  | 
  92  |   for (const destination of destinations) {
  93  |     const navButton = page.getByRole('button', { name: destination.button, exact: true });
  94  |     await navButton.scrollIntoViewIfNeeded();
  95  |     await navButton.click();
  96  | 
  97  |     const shell = page.locator('.dash-body, main').first();
  98  |     await expect(shell).toBeVisible({ timeout: 20_000 });
> 99  |     await expect(shell).toContainText(destination.text, { timeout: 20_000 });
      |                         ^ Error: expect(locator).toContainText(expected) failed
  100 |   }
  101 | });
  102 | 
  103 | test('student can open every More-menu page', async ({ page }) => {
  104 |   await openStudentDashboard(page);
  105 | 
  106 |   const destinations = [
  107 |     { item: 'Mock Tests', text: 'MET Mock Test 1' },
  108 |     { item: 'Messages', text: 'Inbox' },
  109 |     { item: 'Settings', text: 'Settings' },
  110 |   ];
  111 | 
  112 |   for (const destination of destinations) {
  113 |     await page.getByRole('button', { name: 'More', exact: true }).click();
  114 |     await page.getByRole('menuitem', { name: destination.item, exact: true }).click();
  115 |     await expect(page.locator('.dash-body')).toContainText(destination.text);
  116 |   }
  117 | });
  118 | 
  119 | test('teacher can open every primary workspace page', async ({ page }) => {
  120 |   await openTeacherDashboard(page);
  121 | 
  122 |   const destinations = [
  123 |     { button: 'Today', text: 'Today' },
  124 |     { button: 'Students', text: 'Students' },
  125 |     { button: 'Diagnose', text: 'Diagnostics' },
  126 |     { button: 'Homework', text: 'Homework' },
  127 |     { button: 'Review', text: 'Submissions' },
  128 |     { button: 'Calendar', text: 'Calendar' },
  129 |     { button: 'Resources', text: 'Exercise Library' },
  130 |     { button: 'Operations', text: 'Operations' },
  131 |   ];
  132 | 
  133 |   for (const destination of destinations) {
  134 |     await page.getByRole('button', { name: destination.button, exact: true }).click();
  135 |     await expect(page.locator('.shell-main')).toContainText(destination.text);
  136 |   }
  137 | });
  138 | 
  139 | test('teacher can create a student login and receive a one-time copyable credential message', async ({ page }) => {
  140 |   await seedAuthenticatedSession(page, TEACHER, 'teacher');
  141 |   const remoteStudents: Array<Record<string, unknown>> = [];
  142 |   let provisionRequest = null as Record<string, unknown> | null;
  143 | 
  144 |   await page.context().route('**/rest/v1/students**', async route => {
  145 |     const request = route.request();
  146 |     const method = request.method();
  147 |     if (method === 'POST') {
  148 |       const row = request.postDataJSON() as Record<string, unknown>;
  149 |       const saved = { id: 'student-row-e2e', ...row };
  150 |       remoteStudents.unshift(saved);
  151 |       await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([saved]) });
  152 |       return;
  153 |     }
  154 |     await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(remoteStudents) });
  155 |   });
  156 |   await page.context().route('**/api/create-student-account', async route => {
  157 |     provisionRequest = route.request().postDataJSON() as Record<string, unknown>;
  158 |     await route.fulfill({
  159 |       status: 201,
  160 |       contentType: 'application/json',
  161 |       body: JSON.stringify({ ok: true, email: 'new.student@example.invalid', studentId: provisionRequest?.studentId || null, authUserId: 'auth-student-e2e' }),
  162 |     });
  163 |   });
  164 | 
  165 |   await page.goto(BASE);
  166 |   await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();
  167 |   await page.getByRole('button', { name: 'Students', exact: true }).click();
  168 |   await page.getByRole('button', { name: 'Add Student', exact: true }).first().click();
  169 |   await page.getByPlaceholder('e.g. Ana Paula').fill('New Student');
  170 |   await page.getByPlaceholder('student@email.com').fill('new.student@example.invalid');
  171 |   await page.getByRole('button', { name: 'Add Student', exact: true }).last().click();
  172 | 
  173 |   await expect(page.getByText('Account created for New Student', { exact: false })).toBeVisible();
  174 |   await expect(page.getByRole('button', { name: 'Copy credentials', exact: true })).toBeVisible();
  175 |   expect(provisionRequest).toMatchObject({
  176 |     email: 'new.student@example.invalid',
  177 |     name: 'New Student',
  178 |   });
  179 |   expect(String(provisionRequest?.password || '').length).toBeGreaterThanOrEqual(12);
  180 | });
  181 | 
  182 | test('teacher secondary routes render their own page shell without a runtime error', async ({ page }) => {
  183 |   await seedAuthenticatedSession(page, TEACHER, 'teacher');
  184 |   const pageErrors: Error[] = [];
  185 |   page.on('pageerror', error => pageErrors.push(error));
  186 | 
  187 |   const routes = [
  188 |     ['cohorts', 'cohorts-page'],
  189 |     ['students:profile?studentId=missing-student', 'student-profile-page'],
  190 |     ['calendar:class?classEventId=missing-class', 'class-record-page'],
  191 |     ['diagnostics:create', 'diagnostic-create-page'],
  192 |     ['diagnostics:errors', 'error-bank-page'],
  193 |     ['calendar:inbox', 'inbox-page'],
  194 |     ['homework:create', 'homework-create-page'],
  195 |     ['submissions:review?submissionId=missing-submission', 'submission-review-page'],
  196 |     ['inbox', 'inbox-page'],
  197 |     ['error-bank', 'error-bank-page'],
  198 |     ['risk-dashboard', 'risk-dashboard-page'],
  199 |     ['reports', 'reports-page'],
```