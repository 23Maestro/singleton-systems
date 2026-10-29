import { test, expect } from '@playwright/test';

const url = process.env.DASHBOARD_TEST_URL ?? 'http://127.0.0.1:4187';
for (const width of [390, 834, 1440]) {
  test(`client board stays focused and returns task focus at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url);
    await page.getByRole('button', { name: 'Clients', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Clients', exact: true })).toBeVisible();
    await expect(page.getByText('WORK VIEW', { exact: true })).toHaveCount(0);
    await expect(page.getByText('One place for your clients and their next steps.', { exact: true })).toHaveCount(0);
    await expect(page.getByText('A clear view of what each client needs next.', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('combobox', { name: 'Client work view' })).toHaveValue('content');
    await expect(page.getByRole('tab', { name: /^Active/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('heading', { name: 'Northstar Media' })).toBeVisible();
    const card = page.getByRole('button', { name: 'Open Weekly power rankings', exact: true });
    await card.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Build the first cut', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(card).toBeFocused();
    await expect(page.getByRole('button', { name: 'New contact', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

for (const width of [390, 834, 1440]) {
  test(`contact entry reveals extra fields and keeps values after a failed save at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(url);
    await page.getByRole('button', { name: 'Clients', exact: true }).click();
    await page.getByRole('button', { name: 'New contact', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox')).toHaveCount(3);
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveAttribute('required', '');
    await dialog.getByLabel('Name', { exact: true }).fill('Dashboard form review');
    await dialog.getByLabel('Company', { exact: true }).fill('Sample company');
    await dialog.getByLabel('Email', { exact: true }).fill('review@example.com');
    await dialog.getByText('More details', { exact: true }).click();
    await dialog.getByLabel('Phone', { exact: true }).fill('555-0100');
    await dialog.getByText('More details', { exact: true }).click();
    await expect(dialog.getByRole('textbox')).toHaveCount(3);
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('Changes are not saved or sent');
    await expect(dialog.getByLabel('Name', { exact: true })).toHaveValue('Dashboard form review');
    await dialog.getByText('More details', { exact: true }).click();
    await expect(dialog.getByLabel('Phone', { exact: true })).toHaveValue('555-0100');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('button', { name: 'New contact', exact: true }).click();
    await expect(page.getByRole('dialog').getByLabel('Name', { exact: true })).toHaveValue('');
  });
}

test('contact entry keeps keyboard focus inside and Escape returns to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  const trigger = page.getByRole('button', { name: 'New contact', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'New contact', exact: true });
  await expect(dialog.getByLabel('Name', { exact: true })).toBeFocused();
  await dialog.getByLabel('Name', { exact: true }).fill('Unsaved keyboard proof');
  await dialog.getByRole('button', { name: 'Save', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close', exact: true })).toBeFocused();
  await dialog.getByLabel('Name', { exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole('dialog').getByLabel('Name', { exact: true })).toHaveValue('');
});

for (const width of [390, 430]) {
  test(`phone navigation stays at the bottom with a separate capture action at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(url);
    const nav = page.getByRole('navigation', { name: 'Primary navigation' });
    await expect(nav).toBeVisible();
    const bounds = await nav.boundingBox();
    expect(bounds.y).toBeGreaterThan(740);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
    await expect(page.getByRole('button', { name: 'Add task', exact: true })).toBeVisible();
    const queue = page.getByRole('button', { name: 'Show task queue', exact: true });
    await expect(queue).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('heading', { name: 'Task queue', exact: true })).not.toBeVisible();
    if (process.env.DASHBOARD_CAPTURE_DIR) await page.screenshot({ path: `${process.env.DASHBOARD_CAPTURE_DIR}/planner-${width}.png` });
    await nav.getByRole('button', { name: 'Clients', exact: true }).click();
    await page.getByRole('button', { name: 'Open Weekly power rankings', exact: true }).click();
    const sheet = await page.getByRole('dialog', { name: 'Edit task', exact: true }).boundingBox();
    expect(sheet.x).toBeLessThanOrEqual(1);
    expect(sheet.width).toBeGreaterThanOrEqual(width - 2);
    expect(sheet.y + sheet.height).toBeGreaterThanOrEqual(840);
    if (process.env.DASHBOARD_CAPTURE_DIR) await page.screenshot({ path: `${process.env.DASHBOARD_CAPTURE_DIR}/task-sheet-${width}.png` });
    await page.keyboard.press('Escape');
    await nav.getByRole('button', { name: 'Planner', exact: true }).click();
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'New task', exact: true })).toBeVisible();
  });
}

test('phone calendar opens around the current time with a clear day and timezone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T14:35:00-04:00'));
  await page.goto(url);
  await expect(page.getByText('EDT', { exact: true })).toBeVisible();
  await expect(page.getByText('2:35 PM', { exact: true })).toBeInViewport();
  await expect(page.getByRole('combobox', { name: 'Calendar view', exact: true })).toHaveValue('1');
  if (process.env.DASHBOARD_CAPTURE_DIR) await page.screenshot({ path: `${process.env.DASHBOARD_CAPTURE_DIR}/planner-current-time-390.png` });
});

test('chosen calendar, queue, client work view and theme survive reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url);
  await page.getByRole('combobox', { name: 'Calendar view', exact: true }).selectOption('7');
  await page.getByRole('button', { name: 'Show task queue', exact: true }).click();
  await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('combobox', { name: 'Client work view', exact: true }).selectOption('outreach');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Clients', exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Client work view', exact: true })).toHaveValue('outreach');
  await expect(page.getByRole('button', { name: 'Switch to light mode', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Planner', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Calendar view', exact: true })).toHaveValue('7');
  await expect(page.getByRole('button', { name: 'Hide task queue', exact: true })).toHaveAttribute('aria-expanded', 'true');
});

test('the full midnight current-time label fits inside the phone gutter', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T00:22:00-04:00'));
  await page.goto(url);
  await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
  const label = page.getByText('12:22 AM', { exact: true });
  await expect(label).toBeInViewport();
  const bounds = await label.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(4);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(76);
});

test('Singleton accents separate branding, confirmations and selected work in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.clock.setFixedTime(new Date('2026-10-24T09:22:00-04:00'));
  await page.goto(url);
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: 'Switch to dark mode', exact: true }).click();
    await expect(page.getByTitle('Singleton Systems', { exact: true })).toHaveCSS('background-color', 'rgb(35, 131, 226)');
    await expect(page.getByText(/Singleton\s*YOUR WORKSPACE/)).toHaveCSS('color', theme === 'light' ? 'rgb(27, 118, 208)' : 'rgb(107, 179, 250)');
    await expect(page.getByText('24', { exact: true })).toHaveCSS('background-color', 'rgb(255, 98, 87)');
    await expect(page.getByText('9:22 AM', { exact: true })).toHaveCSS('background-color', 'rgb(255, 98, 87)');
    await expect(page.getByRole('group', { name: 'Task Weekly power rankings', exact: true })).toHaveCSS('border-color', 'rgb(255, 200, 61)');
    await expect(page.getByRole('button', { name: /^Weekly power rankings, / })).toHaveCSS('outline-color', 'rgb(255, 200, 61)');
    await expect(page.getByRole('button', { name: /^Weekly power rankings, / })).not.toHaveCSS('background-color', 'rgb(255, 200, 61)');
    await page.getByRole('button', { name: 'Open Weekly power rankings', exact: true }).click();
    await page.getByRole('textbox', { name: 'Task name', exact: true }).fill('Accent proof');
    await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toHaveCSS('color', 'rgb(255, 98, 87)');
    await page.keyboard.press('Escape');
  }
});
