import { expect, test, type Page } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

type TestUser = {
  id: string;
  email: string;
  user_metadata: { display_name: string };
};

const STUDENT: TestUser = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'e2e.student@example.invalid',
  user_metadata: { display_name: 'E2E Student' },
};

const TEACHER: TestUser = {
  id: '22222222-2222-4222-8222-222222222222',
  email: 'vvieira010@gmail.com',
  user_metadata: { display_name: 'E2E Teacher' },
};

function storedSession(user: TestUser) {
  return {
    // The stored user supplies the identity, so this intentionally non-live
    // token can never authenticate against an external Supabase project.
    access_token: 'e2e-isolated-session-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user,
  };
}

async function seedAuthenticatedSession(page: Page, user: TestUser, role: 'student' | 'teacher') {
  const context = page.context();

  // All Supabase calls are fulfilled in the browser: these tests do not use a
  // real account, change production data, or require a local database.
  await context.route('**/rest/v1/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await context.route('**/rest/v1/rpc/claim_student_by_email', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: role === 'student'
      ? JSON.stringify([{ id: user.id, local_id: 'e2e-student' }])
      : '[]',
  }));
  await page.addInitScript(({ session }) => {
    localStorage.setItem('vv:supabase_session', JSON.stringify(session));
  }, { session: storedSession(user) });
}

async function openStudentDashboard(page: Page) {
  await seedAuthenticatedSession(page, STUDENT, 'student');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
}

async function openTeacherDashboard(page: Page) {
  await seedAuthenticatedSession(page, TEACHER, 'teacher');
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible({ timeout: 15_000 });
}

test('public landing opens the real sign-in screen and validates an empty form', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Prepare for the MET', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Sign in', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  await page.getByRole('button', { name: 'Access Workspace', exact: true }).click();
  await expect(page.getByText('Please enter your email and password.', { exact: true })).toBeVisible();
});

test('student can open every primary workspace page', async ({ page }) => {
  await openStudentDashboard(page);
  await expect(page.getByRole('img', { name: /Academic progress area chart/ })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Chart could not load. Check your connection.')).toHaveCount(0);

  const destinations = [
    { button: 'Home', text: /Good (morning|afternoon|evening),/ },
    { button: 'Practice', text: 'Six skills, zero clutter' },
    { button: 'Subjects', text: 'MET skills' },
    { button: 'Homework', text: 'Assigned practice' },
    { button: 'Feedback', text: "Your teacher's latest notes" },
    { button: 'Progress', text: 'Your MET progress path' },
    { button: 'Resources', text: 'Study Materials & Resources' },
  ] as const;

  for (const destination of destinations) {
    const navButton = page.getByRole('button', { name: destination.button, exact: true });
    await navButton.scrollIntoViewIfNeeded();
    await navButton.click();

    const shell = page.locator('.dash-body, main').first();
    await expect(shell).toBeVisible({ timeout: 20_000 });
    await expect(shell).toContainText(destination.text, { timeout: 20_000 });
  }
});

test('student can open every More-menu page', async ({ page }) => {
  await openStudentDashboard(page);

  const destinations = [
    { item: 'Mock Tests', text: 'MET Mock Test 1' },
    { item: 'Messages', text: 'Inbox' },
    { item: 'Settings', text: 'Settings' },
  ];

  for (const destination of destinations) {
    await page.getByRole('button', { name: 'More', exact: true }).click();
    await page.getByRole('menuitem', { name: destination.item, exact: true }).click();
    await expect(page.locator('.dash-body')).toContainText(destination.text);
  }
});

test('teacher can open every primary workspace page', async ({ page }) => {
  await openTeacherDashboard(page);

  const destinations = [
    { button: 'Today', text: 'Today' },
    { button: 'Students', text: 'Students' },
    { button: 'Diagnose', text: 'Diagnostics' },
    { button: 'Homework', text: 'Homework' },
    { button: 'Review', text: 'Submissions' },
    { button: 'Calendar', text: 'Calendar' },
    { button: 'Resources', text: 'Exercise Library' },
    { button: 'Operations', text: 'Operations' },
  ];

  for (const destination of destinations) {
    await page.getByRole('button', { name: destination.button, exact: true }).click();
    await expect(page.locator('.shell-main')).toContainText(destination.text);
  }
});

test('teacher can create a student login and receive a one-time copyable credential message', async ({ page }) => {
  await seedAuthenticatedSession(page, TEACHER, 'teacher');
  const remoteStudents: Array<Record<string, unknown>> = [];
  let provisionRequest = null as Record<string, unknown> | null;

  await page.context().route('**/rest/v1/students**', async route => {
    const request = route.request();
    const method = request.method();
    if (method === 'POST') {
      const row = request.postDataJSON() as Record<string, unknown>;
      const saved = { id: 'student-row-e2e', ...row };
      remoteStudents.unshift(saved);
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([saved]) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(remoteStudents) });
  });
  await page.context().route('**/api/create-student-account', async route => {
    provisionRequest = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, email: 'new.student@example.invalid', studentId: provisionRequest?.studentId || null, authUserId: 'auth-student-e2e' }),
    });
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();
  await page.getByRole('button', { name: 'Students', exact: true }).click();
  await page.getByRole('button', { name: 'Add Student', exact: true }).first().click();
  await page.getByPlaceholder('e.g. Ana Paula').fill('New Student');
  await page.getByPlaceholder('student@email.com').fill('new.student@example.invalid');
  await page.getByRole('button', { name: 'Add Student', exact: true }).last().click();

  await expect(page.getByText('Account created for New Student', { exact: false })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy credentials', exact: true })).toBeVisible();
  expect(provisionRequest).toMatchObject({
    email: 'new.student@example.invalid',
    name: 'New Student',
  });
  expect(String(provisionRequest?.password || '').length).toBeGreaterThanOrEqual(12);
});

test('teacher secondary routes render their own page shell without a runtime error', async ({ page }) => {
  await seedAuthenticatedSession(page, TEACHER, 'teacher');
  const pageErrors: Error[] = [];
  page.on('pageerror', error => pageErrors.push(error));

  const routes = [
    ['cohorts', 'cohorts-page'],
    ['students:profile?studentId=missing-student', 'student-profile-page'],
    ['calendar:class?classEventId=missing-class', 'class-record-page'],
    ['diagnostics:create', 'diagnostic-create-page'],
    ['diagnostics:errors', 'error-bank-page'],
    ['calendar:inbox', 'inbox-page'],
    ['homework:create', 'homework-create-page'],
    ['submissions:review?submissionId=missing-submission', 'submission-review-page'],
    ['inbox', 'inbox-page'],
    ['error-bank', 'error-bank-page'],
    ['risk-dashboard', 'risk-dashboard-page'],
    ['reports', 'reports-page'],
    ['settings', 'settings-page'],
    ['exercises', 'exercises-page'],
    ['perspective', 'perspective-designer-page'],
    ['mock-test', 'mock-test-page'],
    ['evaluation', 'evaluation-page'],
    ['library:writing', 'writing-practice-page'],
    ['mock-test-results', 'mock-test-results-page'],
    ['mock-test-eval', 'mock-test-eval-page'],
    ['library:evaluation', 'library-evaluation-page'],
    ['speaking-eval', 'speaking-eval-page'],
    ['visual-editor', 'visual-editor-page'],
    ['social-studio', 'social-studio-page'],
  ] as const;

  for (const [route] of routes) {
    await page.goto(`${BASE}#${route}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).not.toBeEmpty({ timeout: 15_000 });
    await expect(page.getByText('Page unavailable', { exact: true })).toHaveCount(0);
  }
  expect(pageErrors.map(error => error.message)).toEqual([]);
});
