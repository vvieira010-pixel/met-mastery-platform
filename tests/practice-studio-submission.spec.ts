import { expect, test, type Page } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const STUDENT = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'e2e.student@example.invalid',
  user_metadata: { display_name: 'E2E Student' },
};
const TEACHER_ID = '22222222-2222-4222-8222-222222222222';
const STUDENT_LOCAL_ID = 'e2e-student';

function storedSession() {
  return {
    access_token: 'e2e-isolated-session-token',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: STUDENT,
  };
}

async function seedStudentWorkspace(page: Page, practiceRows: Array<Record<string, unknown>>) {
  const context = page.context();
  const studentRow = {
    id: STUDENT.id,
    local_id: STUDENT_LOCAL_ID,
    auth_user_id: STUDENT.id,
    teacher_id: TEACHER_ID,
  };

  await context.route('**/rest/v1/**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: '[]',
  }));
  await context.route('**/rest/v1/rpc/claim_student_by_email', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: STUDENT.id, local_id: STUDENT_LOCAL_ID }]),
  }));
  await context.route('**/rest/v1/students**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([studentRow]),
  }));
  await context.route('**/rest/v1/practice_submissions**', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(practiceRows),
  }));
  await page.addInitScript(({ session }) => {
    localStorage.setItem('vv:supabase_session', JSON.stringify(session));
  }, { session: storedSession() });
}

test('student sees Speaking Question 1–5 and skips an individually saved question', async ({ page }) => {
  const practiceRows = [{
    id: 'practice-submission-e2e',
    teacher_id: TEACHER_ID,
    student_id: STUDENT.id,
    created_at: '2026-09-05T12:00:00.000Z',
    content: {
      id: 'practice-submission-e2e',
      type: 'practice_studio_exercise',
      studentId: STUDENT_LOCAL_ID,
      sessionKey: 'practice-studio:speaking:all:Q1:Q1::describe_image:exercise:image_description_01',
      topicId: 'Q1::describe_image',
      speakingQuestion: 'Q1',
      status: 'submitted',
      submittedAt: '2026-09-05T12:00:00.000Z',
      results: [],
    },
  }];
  await seedStudentWorkspace(page, practiceRows);
  const pageErrors: Error[] = [];
  const consoleWarnings: string[] = [];
  page.on('pageerror', error => pageErrors.push(error));
  page.on('console', message => { if (message.type() === 'warning') consoleWarnings.push(message.text()); });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /Speaking Mirror/ }).click();

  await expect(page.getByRole('heading', { name: 'MET-style Speaking Practice' })).toBeVisible();
  for (const question of [
    'Question 1 — Describe a Picture',
    'Question 2 — Personal Experience',
    'Question 3 — Personal Opinion',
    'Question 4 — Advantages and Disadvantages',
    'Question 5 — Persuade an Authority',
  ]) {
    await expect(page.getByRole('heading', { name: question })).toBeVisible();
  }

  await page.getByRole('button', { name: /Question 1 — Describe a Picture/ }).click();
  await expect(page.getByRole('heading', { name: 'Everyday scenes' })).toBeVisible();
  await page.getByRole('button', { name: /Everyday scenes/ }).click();
  await expect(page.getByText('Describe the bus interior.', { exact: false })).toBeVisible();
  await expect(page.getByText('Describe the football match.', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('note', { name: 'One-time attempt warning' })).toBeVisible();
  expect(pageErrors.map(error => error.message)).toEqual([]);
  expect(consoleWarnings.filter(message => message.includes('GSAP target'))).toEqual([]);
});

test('speaking gives preparation time before automatically opening the timed recorder', async ({ page }) => {
  await seedStudentWorkspace(page, []);
  await page.addInitScript(() => {
    const fakeStream = { getTracks: () => [] } as unknown as MediaStream;
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: async () => fakeStream },
    });
    class FakeMediaRecorder {
      stream: MediaStream;
      state = 'inactive';
      ondataavailable: ((event: BlobEvent) => void) | null = null;
      onstop: (() => void) | null = null;
      constructor(stream: MediaStream) { this.stream = stream; }
      start() { this.state = 'recording'; }
      stop() { this.state = 'inactive'; this.onstop?.(); }
    }
    Object.defineProperty(globalThis, 'MediaRecorder', { configurable: true, writable: true, value: FakeMediaRecorder });
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /Speaking Mirror/ }).click();
  await page.getByRole('button', { name: /Question 1 — Describe a Picture/ }).click();
  await page.getByRole('button', { name: /Everyday scenes/ }).click();

  const startPreparation = page.getByTestId('speaking-start-preparation');
  await expect(startPreparation).toBeVisible();
  // Install the virtual clock only after the lazy Practice Studio chunks have
  // loaded. WebKit otherwise freezes their loading work before the recorder is
  // even reachable.
  await page.clock.install({ time: new Date('2026-09-05T12:00:00.000Z') });
  await startPreparation.click({ force: true });
  await expect(page.getByTestId('speaking-preparation-countdown')).toContainText('Preparation time');
  await expect(page.getByTestId('speaking-preparation-countdown')).toContainText('00:15');

  // Advance one interval at a time. Playwright's virtual clock coalesces a
  // long fast-forward into fewer interval callbacks, while the application
  // deliberately subtracts one second for each real countdown tick.
  for (let second = 0; second < 15; second += 1) {
    await page.clock.fastForward(1_000);
  }
  await expect(page.getByTestId('speaking-recording')).toBeVisible();
  await expect(page.getByTestId('speaking-recording')).toContainText('01:00');
});

test('mobile Question 4 keeps the Practice Studio title readable in the student theme', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedStudentWorkspace(page, []);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.dash')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Practice', exact: true }).click();
  await page.getByRole('button', { name: /Speaking Mirror/ }).click();
  await page.getByRole('button', { name: /Question 4 — Advantages and Disadvantages/ }).click();
  await page.getByRole('button', { name: /Listen to a prompt/ }).click();
  await expect(page.getByTestId('speaking-start-preparation')).toBeVisible();

  const contrast = await page.locator('.student-page-title').evaluate(element => {
    const parseRgb = (value: string) => (value.match(/\d+(?:\.\d+)?/g) || []).slice(0, 3).map(Number);
    const relativeLuminance = ([red, green, blue]: number[]) => [red, green, blue]
      .map(channel => {
        const normalised = channel / 255;
        return normalised <= 0.03928 ? normalised / 12.92 : ((normalised + 0.055) / 1.055) ** 2.4;
      })
      .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
    const foreground = relativeLuminance(parseRgb(getComputedStyle(element).color));
    let backgroundElement: Element | null = element.parentElement;
    let background = [0, 0, 0];
    while (backgroundElement) {
      const candidate = parseRgb(getComputedStyle(backgroundElement).backgroundColor);
      if (candidate.length === 3 && getComputedStyle(backgroundElement).backgroundColor !== 'rgba(0, 0, 0, 0)') {
        background = candidate;
        break;
      }
      backgroundElement = backgroundElement.parentElement;
    }
    const backgroundLuminance = relativeLuminance(background);
    return (Math.max(foreground, backgroundLuminance) + 0.05) / (Math.min(foreground, backgroundLuminance) + 0.05);
  });

  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
