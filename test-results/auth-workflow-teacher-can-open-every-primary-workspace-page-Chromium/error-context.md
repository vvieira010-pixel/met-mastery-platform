# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-workflow.test.ts >> teacher can open every primary workspace page
- Location: tests\auth-workflow.test.ts:119:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.shell-main')
Expected substring: "Exercise Library"
Received string:    "Calendar0 upcoming · 0 need diagnosis Schedule ClassSeptember 2026SunMonTueWedThuFriSat123456789101112131415161718192021222324252627282930Upcoming ClassesNone scheduled.Loading your workspace…"

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('.shell-main')
    4 × locator resolved to <main tabindex="-1" id="main-content" class="shell-main">…</main>
      - unexpected value "Calendar0 upcoming · 0 need diagnosis Schedule ClassSeptember 2026SunMonTueWedThuFriSat123456789101112131415161718192021222324252627282930Upcoming ClassesNone scheduled.Loading your workspace…"
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

```

```yaml
- main:
  - status:
    - paragraph: Loading your workspace…
```

# Test source

```ts
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
  99  |     await expect(shell).toContainText(destination.text, { timeout: 20_000 });
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
> 135 |     await expect(page.locator('.shell-main')).toContainText(destination.text);
      |                                               ^ Error: expect(locator).toContainText(expected) failed
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
  200 |     ['settings', 'settings-page'],
  201 |     ['exercises', 'exercises-page'],
  202 |     ['perspective', 'perspective-designer-page'],
  203 |     ['mock-test', 'mock-test-page'],
  204 |     ['evaluation', 'evaluation-page'],
  205 |     ['library:writing', 'writing-practice-page'],
  206 |     ['mock-test-results', 'mock-test-results-page'],
  207 |     ['mock-test-eval', 'mock-test-eval-page'],
  208 |     ['library:evaluation', 'library-evaluation-page'],
  209 |     ['speaking-eval', 'speaking-eval-page'],
  210 |     ['visual-editor', 'visual-editor-page'],
  211 |     ['social-studio', 'social-studio-page'],
  212 |   ] as const;
  213 | 
  214 |   for (const [route] of routes) {
  215 |     await page.goto(`${BASE}#${route}`);
  216 |     await expect(page.locator('main')).not.toBeEmpty({ timeout: 15_000 });
  217 |     await expect(page.getByText('Page unavailable', { exact: true })).toHaveCount(0);
  218 |   }
  219 |   expect(pageErrors.map(error => error.message)).toEqual([]);
  220 | });
  221 | 
```