import { expect, test } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function invokeTourTool(page: import('@playwright/test').Page, name: string, input: Record<string, unknown> = {}) {
  return page.evaluate(async ({ name, input }) => {
    const tool = (window as any).__webMcpTourTools.find((item: any) => item.name === name);
    return JSON.parse(await tool.execute(input, {}));
  }, { name, input });
}

test('WebMCP tour guides a learner into a Grammar Sprint without acting for them', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).__webMcpTourTools = [];
    Object.defineProperty(document, 'modelContext', {
      configurable: true,
      value: { registerTool: async (tool: unknown) => (window as any).__webMcpTourTools.push(tool) },
    });
  });

  await page.goto(BASE);
  // The sign-in entry point is a <button> with text "Already a member? Sign in".
  // Use the stable data-testid so this locator survives any copy changes.
  await page.getByTestId('sign-in-btn').click();
  await expect(page.locator('.dash')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as any).__webMcpTourTools.length)).toBe(6);

  const initial = await invokeTourTool(page, 'met_practice_tour_read_state');
  expect(initial.activeTab).toBe('home');
  expect(initial.practice.screen).toBe('not-visible');

  const targets = await invokeTourTool(page, 'met_practice_tour_list_targets');
  expect(targets.targets.find((target: any) => target.id === 'practice-navigation').visible).toBe(true);
  expect(targets.targets.find((target: any) => target.id === 'practice-skill-grammar').visible).toBe(false);

  const hiddenTarget = await invokeTourTool(page, 'met_practice_tour_highlight_target', { targetId: 'practice-skill-grammar' });
  expect(hiddenTarget.visible).toBe(false);
  await expect(page.getByText('This target is not visible yet.')).toBeVisible();
  await invokeTourTool(page, 'met_practice_tour_dismiss_highlight');
  await expect(page.getByRole('button', { name: 'Dismiss highlight' })).toBeHidden();

  await page.getByRole('button', { name: 'Practice' }).first().click();
  const waited = await invokeTourTool(page, 'met_practice_tour_wait_for_state_change', {
    afterRevision: initial.revision,
    timeoutMs: 500,
  });
  expect(waited.changed).toBe(true);
  await expect(page.getByRole('heading', { name: 'Practice Studio' })).toBeVisible();

  const grammarHighlight = await invokeTourTool(page, 'met_practice_tour_highlight_target', { targetId: 'practice-skill-grammar' });
  expect(grammarHighlight.visible).toBe(true);
  await expect(page.getByRole('heading', { name: 'Grammar Sprint' })).toBeVisible();
  await page.getByRole('button', { name: /Grammar Sprint/ }).click();
  await expect(page.getByRole('button', { name: 'Common Mistakes' })).toBeVisible();
  await page.getByRole('button', { name: 'Common Mistakes' }).click();
  await expect(page.locator('[data-tour-target="practice-session"]')).toBeVisible();
});
