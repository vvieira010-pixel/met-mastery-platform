# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth-workflow.test.ts >> student can sign in with mock direct payload
- Location: tests\auth-workflow.test.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  4   | 
  5   | test('student can sign in with mock direct payload', async ({ page }) => {
> 6   |   await page.goto('/');
      |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  7   | 
  8   |   // Wait for app to load - should show login since no auth yet
  9   |   await expect(page.getByText('Welcome back')).toBeVisible();
  10  | 
  11  |   // Sign in as student with mock direct payload
  12  |   await page.getByRole('button', { name: 'Sign in as Student' }).click();
  13  | 
  14  |   // The mock direct sign-in path
  15  |   await page.evaluate(() => {
  16  |     // Simulate mockDirect payload
  17  |     (window as any).mockSignInPayload = {
  18  |       mockDirect: true,
  19  |       role: 'student',
  20  |       email: 'student@example.com',
  21  |       displayName: 'Test Student',
  22  |     };
  23  |     // Trigger the sign-in handler
  24  |     const event = new MouseEvent('click', { bubbles: true });
  25  |     (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  26  |   });
  27  | 
  28  |   // Should now be on dashboard as student
  29  |   await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();
  30  |   await expect(page.getByText('Test Student')).toBeVisible();
  31  | });
  32  | 
  33  | test('teacher can sign in with mock direct payload', async ({ page }) => {
  34  |   await page.goto('/');
  35  | 
  36  |   await expect(page.getByText('Welcome back')).toBeVisible();
  37  | 
  38  |   // Sign in as teacher
  39  |   await page.getByRole('button', { name: 'Sign in as Teacher' }).click();
  40  | 
  41  |   await page.evaluate(() => {
  42  |     (window as any).mockSignInPayload = {
  43  |       mockDirect: true,
  44  |       role: 'teacher',
  45  |       email: 'teacher@example.com',
  46  |       displayName: 'Test Teacher',
  47  |     };
  48  |     const event = new MouseEvent('click', { bubbles: true });
  49  |     (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  50  |   });
  51  | 
  52  |   await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();
  53  |   await expect(page.getByText('Test Teacher')).toBeVisible();
  54  | });
  55  | 
  56  | test('user can sign out', async ({ page }) => {
  57  |   await page.goto('/');
  58  | 
  59  |   // First sign in as student
  60  |   await page.evaluate(() => {
  61  |     (window as any).mockSignInPayload = {
  62  |       mockDirect: true,
  63  |       role: 'student',
  64  |       email: 'student@example.com',
  65  |       displayName: 'Test Student',
  66  |     };
  67  |     const event = new MouseEvent('click', { bubbles: true });
  68  |     (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  69  |   });
  70  | 
  71  |   await expect(page.locator('[data-testid="student-dashboard"]')).toBeVisible();
  72  | 
  73  |   // Sign out
  74  |   await page.getByRole('button', { name: 'Sign out' }).click();
  75  | 
  76  |   // Should return to login
  77  |   await expect(page.getByText('Welcome back')).toBeVisible();
  78  |   await expect(page.locator('[data-testid="student-dashboard"]')).not.toBeVisible();
  79  | });
  80  | 
  81  | test('teacher can navigate between tabs', async ({ page }) => {
  82  |   await page.goto('/');
  83  | 
  84  |   // Sign in as teacher
  85  |   await page.evaluate(() => {
  86  |     (window as any).mockSignInPayload = {
  87  |       mockDirect: true,
  88  |       role: 'teacher',
  89  |       email: 'teacher@example.com',
  90  |       displayName: 'Test Teacher',
  91  |     };
  92  |     const event = new MouseEvent('click', { bubbles: true });
  93  |     (document.querySelector('button[type=submit]') || document.querySelector('button'))?.dispatchEvent(event);
  94  |   });
  95  | 
  96  |   await expect(page.locator('[data-testid="teacher-dashboard"]')).toBeVisible();
  97  | 
  98  |   // Navigate to students tab
  99  |   await page.getByRole('button', { name: 'Students' }).click();
  100 | 
  101 |   // Should navigate to students page
  102 |   await expect(page.locator('[data-testid="students-page"]')).toBeVisible();
  103 | 
  104 |   // Navigate back to dashboard
  105 |   await page.getByRole('button', { name: 'Today' }).click();
  106 | 
```