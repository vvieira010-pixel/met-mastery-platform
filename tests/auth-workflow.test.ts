import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test('student can sign in with mock direct payload', async ({ page }) => {
  await page.goto('/');

  // Wait for app to load - should show login since no auth yet
  await expect(page.getByText('Welcome back')).toBeVisible();

  // Sign in as student with mock direct payload
  await page.getByRole('button', { name: 'Sign in as Student' }).click();

  // The mock direct sign-in path
  await page.evaluate(() => {
    // Simulate mockDirect payload
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'student',
      email: 'student@example.com',
      displayName: 'Test Student',
    };
    // Trigger the sign-in handler
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  // Should now be on dashboard as student
  await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();
  await expect(page.getByText('Test Student')).toBeVisible();
});

test('teacher can sign in with mock direct payload', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Welcome back')).toBeVisible();

  // Sign in as teacher
  await page.getByRole('button', { name: 'Sign in as Teacher' }).click();

  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'teacher',
      email: 'teacher@example.com',
      displayName: 'Test Teacher',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();
  await expect(page.getByText('Test Teacher')).toBeVisible();
});

test('user can sign out', async ({ page }) => {
  await page.goto('/');

  // First sign in as student
  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'student',
      email: 'student@example.com',
      displayName: 'Test Student',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();

  // Sign out
  await page.getByRole('button', { name: 'Sign out' }).click();

  // Should return to login
  await expect(page.getByText('Welcome back')).toBeVisible();
  await expect(page.locator('[data-testid="student-dashboard"]')).not.toBeVisible();
});

test('teacher can navigate between tabs', async ({ page }) => {
  await page.goto('/');

  // Sign in as teacher
  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'teacher',
      email: 'teacher@example.com',
      displayName: 'Test Teacher',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();

  // Navigate to students tab
  await page.getByRole('button', { name: 'Students' }).click();

  // Should navigate to students page
  await expect(page.locator('[data-testid="students-page"]')).toBeVisible();

  // Navigate back to dashboard
  await page.getByRole('button', { name: 'Today' }).click();

  await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();
});

test('student can navigate to mock test', async ({ page }) => {
  await page.goto('/');

  // Sign in as student
  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'student',
      email: 'student@example.com',
      displayName: 'Test Student',
      studentId: 'st_1',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();

  // Open palette and take mock test
  await page.getByRole('button', { name: 'Take Mock Test' }).click();

  await expect(page.locator('[data-testid="mock-test-page"]')).toBeVisible();
});

test('hash navigation works', async ({ page }) => {
  await page.goto('/#diagnostics');

  // Should navigate to diagnostics
  await expect(page.locator('[data-testid="diagnostics-page"]')).toBeVisible();

  // Navigate to homework
  await page.goto('/#homework:create');

  await expect(page.locator('[data-testid="homework-create-page"]')).toBeVisible();
});

test('keyboard shortcuts work for teacher', async ({ page }) => {
  await page.goto('/');

  // Sign in as teacher
  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'teacher',
      email: 'teacher@example.com',
      displayName: 'Test Teacher',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();

  // Press 'k' to open palette
  await page.keyboard.press('KeyK');
  await expect(page.locator('[role=dialog]')).toBeVisible();

  // Press 'd' to navigate to diagnostics
  await page.keyboard.press('KeyD');
  await expect(page.locator('[data-testid="diagnostics-page"]')).toBeVisible();
});

test('keyboard shortcuts work for student', async ({ page }) => {
  await page.goto('/');

  // Sign in as student
  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'student',
      email: 'student@example.com',
      displayName: 'Test Student',
      studentId: 'st_1',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();

  // Press 'm' to navigate to mock test
  await page.keyboard.press('KeyM');
  await expect(page.locator('[data-testid="mock-test-page"]')).toBeVisible();
});

test('theme toggle works', async ({ page }) => {
  await page.goto('/');

  // Sign in as teacher
  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'teacher',
      email: 'teacher@example.com',
      displayName: 'Test Teacher',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();

  // Toggle dark mode
  await page.locator('button[data-testid="dark-mode-toggle"]').click();

  // Check if theme changed
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Toggle back to light
  await page.locator('button[data-testid="dark-mode-toggle"]').click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('online/offline bar appears/disappears', async ({ page }) => {
  await page.goto('/');

  // Sign in as teacher
  await page.evaluate(() => {
    (window as any).mockSignInPayload = {
      mockDirect: true,
      role: 'teacher',
      email: 'teacher@example.com',
      displayName: 'Test Teacher',
    };
    const event = new MouseEvent('click', { bubbles: true });
    (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  });

  // Check if offline bar is visible (it's not initially since we're online)
  // The bar should NOT be visible when online
  await expect(page.locator('[data-testid="offline-bar"]')).not.toBeVisible();

  // Go offline
  await page.evaluate(() => {
    navigator.onLine = false;
    const event = new Event('offline');
    window.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="offline-bar"]')).toBeVisible();
  await expect(page.locator('[data-testid="offline-bar"]').locator('text=No internet connection')).toBeVisible();

  // Go online
  await page.evaluate(() => {
    navigator.onLine = true;
    const event = new Event('online');
    window.dispatchEvent(event);
  });

  await expect(page.locator('[data-testid="offline-bar"]')).not.toBeVisible();
});