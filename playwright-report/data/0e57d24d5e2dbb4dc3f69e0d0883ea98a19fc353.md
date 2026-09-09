# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: practice-studio-submission.spec.ts >> student sees Speaking Question 1–5, chooses a topic, and cannot reopen a submitted topic
- Location: tests\practice-studio-submission.spec.ts:54:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="practice-studio-submission-locked"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="practice-studio-submission-locked"]')

```

```yaml
- link "Skip to content":
  - /url: "#student-content"
- banner:
  - button "MET Mastery student home":
    - strong: MET Mastery
    - text: Student space
  - navigation "Student navigation":
    - button "Home"
    - button "Practice"
    - button "Subjects"
    - button "Homework"
    - button "Feedback"
    - button "Progress"
    - button "Resources"
    - button "More"
  - text: Hi, there
  - button "Sign out"
- main "Practice content":
  - main:
    - link "Skip to practice content":
      - /url: "#practice-studio-content"
    - button "← Topics"
    - heading "Everyday scenes" [level=1]
    - text: Full Support Level 4
    - paragraph: Full hint ladder available
    - note "One-time attempt warning":
      - strong: One-time attempt
      - text: When you answer or skip this question, it is saved and locked. You cannot retry it.
    - text: Progress 0 of 15 completed
    - progressbar "Progress"
    - text: speak
    - button "Previous exercise" [disabled]
    - text: 1 / 15
    - button "Skip exercise"
    - paragraph: Use the 15-second preparation timer to study the image. Then describe it for 60 seconds. Use the present continuous and location phrases such as in the foreground, on the left, and in the background.
    - figure "View larger ⤢":
      - 'link "Practice image: stadium"':
        - /url: /exercises/speaking/image-description/Gemini_Generated_Image_fig1ivfig1ivfig1.jpg
        - 'img "Practice image: stadium"'
      - link "View larger ⤢":
        - /url: /exercises/speaking/image-description/Gemini_Generated_Image_fig1ivfig1ivfig1.jpg
    - text: "Speaking Q1 — Describe a Picture (60s) Best structure General scene → people/actions → details → possible inference Useful phrases This picture shows… In the foreground, I can see… In the background, there is/are… The people seem to be… It looks like… Common mistake: Only listing objects without explaining the situation."
    - paragraph: Describe the football match. Mention the setting, the players, the goalkeeper, the camera operator, and the spectators.
    - text: You will have 15 seconds to prepare. Recording starts automatically, then you have 01:00 to speak.
    - button "Start preparation"
    - button "← Back" [disabled]
    - button "Skip →"
    - button "Next →"
- button "Message teacher"
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | 
  3   | const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  4   | const STUDENT = {
  5   |   id: '11111111-1111-4111-8111-111111111111',
  6   |   email: 'e2e.student@example.invalid',
  7   |   user_metadata: { display_name: 'E2E Student' },
  8   | };
  9   | const TEACHER_ID = '22222222-2222-4222-8222-222222222222';
  10  | const STUDENT_LOCAL_ID = 'e2e-student';
  11  | 
  12  | function storedSession() {
  13  |   return {
  14  |     access_token: 'e2e-isolated-session-token',
  15  |     expires_at: Math.floor(Date.now() / 1000) + 3600,
  16  |     user: STUDENT,
  17  |   };
  18  | }
  19  | 
  20  | async function seedStudentWorkspace(page: Page, practiceRows: Array<Record<string, unknown>>) {
  21  |   const context = page.context();
  22  |   const studentRow = {
  23  |     id: STUDENT.id,
  24  |     local_id: STUDENT_LOCAL_ID,
  25  |     auth_user_id: STUDENT.id,
  26  |     teacher_id: TEACHER_ID,
  27  |   };
  28  | 
  29  |   await context.route('**/rest/v1/**', route => route.fulfill({
  30  |     status: 200,
  31  |     contentType: 'application/json',
  32  |     body: '[]',
  33  |   }));
  34  |   await context.route('**/rest/v1/rpc/claim_student_by_email', route => route.fulfill({
  35  |     status: 200,
  36  |     contentType: 'application/json',
  37  |     body: JSON.stringify([{ id: STUDENT.id, local_id: STUDENT_LOCAL_ID }]),
  38  |   }));
  39  |   await context.route('**/rest/v1/students**', route => route.fulfill({
  40  |     status: 200,
  41  |     contentType: 'application/json',
  42  |     body: JSON.stringify([studentRow]),
  43  |   }));
  44  |   await context.route('**/rest/v1/practice_submissions**', route => route.fulfill({
  45  |     status: 200,
  46  |     contentType: 'application/json',
  47  |     body: JSON.stringify(practiceRows),
  48  |   }));
  49  |   await page.addInitScript(({ session }) => {
  50  |     localStorage.setItem('vv:supabase_session', JSON.stringify(session));
  51  |   }, { session: storedSession() });
  52  | }
  53  | 
  54  | test('student sees Speaking Question 1–5, chooses a topic, and cannot reopen a submitted topic', async ({ page }) => {
  55  |   const practiceRows = [{
  56  |     id: 'practice-submission-e2e',
  57  |     teacher_id: TEACHER_ID,
  58  |     student_id: STUDENT.id,
  59  |     created_at: '2026-09-05T12:00:00.000Z',
  60  |     content: {
  61  |       id: 'practice-submission-e2e',
  62  |       type: 'practice_studio',
  63  |       studentId: STUDENT_LOCAL_ID,
  64  |       sessionKey: 'practice-studio:speaking:all:Q1:Q1::describe_image',
  65  |       topicId: 'Q1::describe_image',
  66  |       speakingQuestion: 'Q1',
  67  |       status: 'submitted',
  68  |       submittedAt: '2026-09-05T12:00:00.000Z',
  69  |       results: [],
  70  |     },
  71  |   }];
  72  |   await seedStudentWorkspace(page, practiceRows);
  73  |   const pageErrors: Error[] = [];
  74  |   const consoleWarnings: string[] = [];
  75  |   page.on('pageerror', error => pageErrors.push(error));
  76  |   page.on('console', message => { if (message.type() === 'warning') consoleWarnings.push(message.text()); });
  77  | 
  78  |   await page.goto(BASE);
  79  |   await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
  80  |   await page.getByRole('button', { name: 'Practice', exact: true }).click();
  81  |   await page.getByRole('button', { name: /Speaking Mirror/ }).click();
  82  | 
  83  |   await expect(page.getByRole('heading', { name: 'MET-style Speaking Practice' })).toBeVisible();
  84  |   for (const question of [
  85  |     'Question 1 — Describe a Picture',
  86  |     'Question 2 — Personal Experience',
  87  |     'Question 3 — Personal Opinion',
  88  |     'Question 4 — Advantages and Disadvantages',
  89  |     'Question 5 — Persuade an Authority',
  90  |   ]) {
  91  |     await expect(page.getByRole('heading', { name: question })).toBeVisible();
  92  |   }
  93  | 
  94  |   await page.getByRole('button', { name: /Question 1 — Describe a Picture/ }).click();
  95  |   await expect(page.getByRole('heading', { name: 'Everyday scenes' })).toBeVisible();
  96  |   await page.getByRole('button', { name: /Everyday scenes/ }).click();
> 97  |   await expect(page.locator('[data-testid="practice-studio-submission-locked"]')).toBeVisible();
      |                                                                                   ^ Error: expect(locator).toBeVisible() failed
  98  |   await expect(page.getByText('This topic has already been submitted', { exact: true })).toBeVisible();
  99  |   expect(pageErrors.map(error => error.message)).toEqual([]);
  100 |   expect(consoleWarnings.filter(message => message.includes('GSAP target'))).toEqual([]);
  101 | });
  102 | 
  103 | test('speaking gives preparation time before automatically opening the timed recorder', async ({ page }) => {
  104 |   await page.clock.install({ time: new Date('2026-09-05T12:00:00.000Z') });
  105 |   await seedStudentWorkspace(page, []);
  106 |   await page.addInitScript(() => {
  107 |     const fakeStream = { getTracks: () => [] } as unknown as MediaStream;
  108 |     Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
  109 |       configurable: true,
  110 |       value: async () => fakeStream,
  111 |     });
  112 |     class FakeMediaRecorder {
  113 |       stream: MediaStream;
  114 |       state = 'inactive';
  115 |       ondataavailable: ((event: BlobEvent) => void) | null = null;
  116 |       onstop: (() => void) | null = null;
  117 |       constructor(stream: MediaStream) { this.stream = stream; }
  118 |       start() { this.state = 'recording'; }
  119 |       stop() { this.state = 'inactive'; this.onstop?.(); }
  120 |     }
  121 |     Object.defineProperty(window, 'MediaRecorder', { configurable: true, value: FakeMediaRecorder });
  122 |   });
  123 | 
  124 |   await page.goto(BASE);
  125 |   await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
  126 |   await page.getByRole('button', { name: 'Practice', exact: true }).click();
  127 |   await page.getByRole('button', { name: /Speaking Mirror/ }).click();
  128 |   await page.getByRole('button', { name: /Question 1 — Describe a Picture/ }).click();
  129 |   await page.getByRole('button', { name: /Everyday scenes/ }).click();
  130 | 
  131 |   await expect(page.getByTestId('speaking-start-preparation')).toBeVisible();
  132 |   await page.getByTestId('speaking-start-preparation').click();
  133 |   await expect(page.getByTestId('speaking-preparation-countdown')).toContainText('Preparation time');
  134 |   await expect(page.getByTestId('speaking-preparation-countdown')).toContainText('00:15');
  135 | 
  136 |   // Advance one interval at a time. Playwright's virtual clock coalesces a
  137 |   // long fast-forward into fewer interval callbacks, while the application
  138 |   // deliberately subtracts one second for each real countdown tick.
  139 |   for (let second = 0; second < 15; second += 1) {
  140 |     await page.clock.fastForward(1_000);
  141 |   }
  142 |   await expect(page.getByTestId('speaking-recording')).toBeVisible();
  143 |   await expect(page.getByTestId('speaking-recording')).toContainText('01:00');
  144 | });
  145 | 
  146 | test('mobile Question 4 keeps the Practice Studio title readable in the student theme', async ({ page }) => {
  147 |   await page.setViewportSize({ width: 390, height: 844 });
  148 |   await seedStudentWorkspace(page, []);
  149 |   await page.goto(BASE);
  150 |   await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
  151 |   await page.getByRole('button', { name: 'Practice', exact: true }).click();
  152 |   await page.getByRole('button', { name: /Speaking Mirror/ }).click();
  153 |   await page.getByRole('button', { name: /Question 4 — Advantages and Disadvantages/ }).click();
  154 |   await page.getByRole('button', { name: /Listen to a prompt/ }).click();
  155 |   await expect(page.getByTestId('speaking-start-preparation')).toBeVisible();
  156 | 
  157 |   const contrast = await page.locator('.student-page-title').evaluate(element => {
  158 |     const parseRgb = (value: string) => (value.match(/\d+(?:\.\d+)?/g) || []).slice(0, 3).map(Number);
  159 |     const relativeLuminance = ([red, green, blue]: number[]) => [red, green, blue]
  160 |       .map(channel => {
  161 |         const normalised = channel / 255;
  162 |         return normalised <= 0.03928 ? normalised / 12.92 : ((normalised + 0.055) / 1.055) ** 2.4;
  163 |       })
  164 |       .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
  165 |     const foreground = relativeLuminance(parseRgb(getComputedStyle(element).color));
  166 |     let backgroundElement: Element | null = element.parentElement;
  167 |     let background = [0, 0, 0];
  168 |     while (backgroundElement) {
  169 |       const candidate = parseRgb(getComputedStyle(backgroundElement).backgroundColor);
  170 |       if (candidate.length === 3 && getComputedStyle(backgroundElement).backgroundColor !== 'rgba(0, 0, 0, 0)') {
  171 |         background = candidate;
  172 |         break;
  173 |       }
  174 |       backgroundElement = backgroundElement.parentElement;
  175 |     }
  176 |     const backgroundLuminance = relativeLuminance(background);
  177 |     return (Math.max(foreground, backgroundLuminance) + 0.05) / (Math.min(foreground, backgroundLuminance) + 0.05);
  178 |   });
  179 | 
  180 |   expect(contrast).toBeGreaterThanOrEqual(4.5);
  181 | });
  182 | 
```