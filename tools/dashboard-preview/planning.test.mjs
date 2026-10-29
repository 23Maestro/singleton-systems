import { test, expect } from '@playwright/test';

const url = process.env.DASHBOARD_OWNER_TEST_URL ?? 'http://127.0.0.1:4189';

test('a client task can be planned on another day without assigning a time', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const snapshot = {
    work: [{ id: 'proof-task', title: 'Plan proof', owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', projectId: '1218890014545436', sectionId: 'proof-client', dueDate: '2026-10-28' }],
    blocks: [], contacts: [], interactions: [], drafts: [], failures: [],
    asanaProjects: [{ id: '1218890014545436', name: 'Content Editor', lane: 'Content Editor', sections: [{ id: 'proof-client', name: 'Proof client' }] }],
  };
  await page.route('**/api/command-center', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: snapshot });
    const command = route.request().postDataJSON();
    if (command.action === 'taskPlanSave') {
      snapshot.plans = [{ owner: command.owner, owner_id: command.ownerId, period: command.period, planned_date: command.plannedDate, duration_minutes: command.durationMinutes }];
      return route.fulfill({ json: { result: snapshot.plans } });
    }
    if (command.action !== 'blockSave') return route.fulfill({ status: 400, json: { error: 'Unexpected owner write' } });
    snapshot.blocks = [{ id: 'proof-block', owner: command.owner, owner_id: command.ownerId, selected_date: command.selectedDate, starts_at: command.startsAt, ends_at: command.endsAt }];
    return route.fulfill({ json: { result: snapshot.blocks } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('button', { name: 'Open Plan proof', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await page.getByRole('button', { name: /Tuesday, October 27th, 2026|Tuesday, October 27, 2026/ }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Plan proof', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await expect(page.getByRole('gridcell', { selected: true })).toHaveText('27');
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('Time');
});

test('a five-minute timed task keeps its duration after save and reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const snapshot = {
    work: [{ id: 'short-task', title: 'Short task', owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', projectId: '1218890014545436', sectionId: 'proof-client', dueDate: '2026-10-28' }],
    blocks: [], contacts: [], interactions: [], drafts: [], failures: [],
    asanaProjects: [{ id: '1218890014545436', name: 'Content Editor', lane: 'Content Editor', sections: [{ id: 'proof-client', name: 'Proof client' }] }],
  };
  await page.route('**/api/command-center', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: snapshot });
    const command = route.request().postDataJSON();
    if (command.action === 'taskPlanSave') {
      snapshot.plans = [{ owner: command.owner, owner_id: command.ownerId, period: command.period, planned_date: command.plannedDate, duration_minutes: command.durationMinutes }];
      return route.fulfill({ json: { result: snapshot.plans } });
    }
    if (command.action !== 'blockSave') return route.fulfill({ status: 400, json: { error: 'Unexpected owner write' } });
    snapshot.blocks = [{ id: 'short-block', owner: command.owner, owner_id: command.ownerId, selected_date: command.selectedDate, starts_at: command.startsAt, ends_at: command.endsAt }];
    return route.fulfill({ json: { result: snapshot.blocks } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('button', { name: 'Open Short task', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Today', exact: true }).click();
  await page.getByRole('button', { name: 'Start time', exact: true }).click();
  await page.getByRole('textbox', { name: 'Start time', exact: true }).fill('14:00');
  await page.getByRole('button', { name: 'Duration', exact: true }).click();
  await page.getByRole('listbox', { name: 'Duration minutes', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Short task', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Duration', exact: true })).toHaveText('5m');
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('2:00 PM');
});

test('duration has hour and minute wheels with keyboard and short steps', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/command-center', (route) => route.fulfill({ json: {
    work: [], blocks: [], contacts: [], interactions: [], drafts: [], failures: [], asanaProjects: [],
  } }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByRole('button', { name: 'Duration', exact: true }).click();
  const hours = page.getByRole('listbox', { name: 'Duration hours', exact: true });
  const minutes = page.getByRole('listbox', { name: 'Duration minutes', exact: true });
  await hours.focus();
  await page.keyboard.press('Home');
  await minutes.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Duration', exact: true })).toHaveText('5m');
  await minutes.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Duration', exact: true })).toHaveText('10m');
  await page.getByRole('listbox', { name: 'Duration minutes', exact: true }).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Duration', exact: true })).toHaveText('5m');
});

test('Plan offers quick day choices and Someday clears the date and time', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T14:35:00-04:00'));
  await page.route('**/api/command-center', (route) => route.fulfill({ json: {
    work: [], blocks: [], contacts: [], interactions: [], drafts: [], failures: [], asanaProjects: [],
  } }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('button', { name: 'Tomorrow', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await expect(page.getByRole('gridcell', { selected: true })).toHaveText('25');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'Calendar date picker', exact: true })).toHaveCount(0);
  for (const choice of ['Today', 'Later today', 'Someday'])
    await expect(page.getByRole('dialog').getByRole('button', { name: choice, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Someday', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Scheduled date', exact: true })).toHaveText('Someday');
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('Time');
});

test('an untimed task keeps a five-minute duration after save and reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const snapshot = {
    work: [{ id: 'untimed-task', title: 'Untimed proof', owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', projectId: '1218890014545436', sectionId: 'proof-client', dueDate: '2026-10-28' }],
    blocks: [], plans: [], contacts: [], interactions: [], drafts: [], failures: [],
    asanaProjects: [{ id: '1218890014545436', name: 'Content Editor', lane: 'Content Editor', sections: [{ id: 'proof-client', name: 'Proof client' }] }],
  };
  await page.route('**/api/command-center', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: snapshot });
    const command = route.request().postDataJSON();
    if (command.action !== 'taskPlanSave') return route.fulfill({ status: 400, json: { error: 'Unexpected owner write' } });
    snapshot.plans = [{ owner: command.owner, owner_id: command.ownerId, period: command.period, planned_date: command.plannedDate, duration_minutes: command.durationMinutes }];
    return route.fulfill({ json: { result: snapshot.plans } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('button', { name: 'Open Untimed proof', exact: true }).click();
  await page.getByRole('button', { name: 'Duration', exact: true }).click();
  await page.getByRole('listbox', { name: 'Duration minutes', exact: true }).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Untimed proof', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Duration', exact: true })).toHaveText('5m');
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('Time');
  await expect(page.getByRole('button', { name: 'Scheduled date', exact: true })).toHaveText('Plan');
});

test('week and month planning horizons survive reload without a clock time', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T14:35:00-04:00'));
  const snapshot = {
    work: [{ id: 'horizon-task', title: 'Horizon proof', owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', projectId: '1218890014545436', sectionId: 'proof-client', dueDate: '2026-10-28' }],
    blocks: [], plans: [], contacts: [], interactions: [], drafts: [], failures: [],
    asanaProjects: [{ id: '1218890014545436', name: 'Content Editor', lane: 'Content Editor', sections: [{ id: 'proof-client', name: 'Proof client' }] }],
  };
  await page.route('**/api/command-center', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: snapshot });
    const command = route.request().postDataJSON();
    if (command.action !== 'taskPlanSave') return route.fulfill({ status: 400, json: { error: 'A horizon must not create a calendar block' } });
    snapshot.plans = [{ owner: command.owner, owner_id: command.ownerId, period: command.period, planned_date: command.plannedDate, duration_minutes: command.durationMinutes }];
    return route.fulfill({ json: { result: snapshot.plans } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('button', { name: 'Open Horizon proof', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'This week', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Horizon proof', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Scheduled date', exact: true })).toHaveText('This week');
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('Time');
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Next month', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Horizon proof', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Scheduled date', exact: true })).toHaveText('Next month');
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('Time');
});

test('Remove time keeps the planned day and five-minute duration after reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T14:35:00-04:00'));
  const snapshot = {
    work: [{ id: 'remove-time-task', title: 'Remove time proof', owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', projectId: '1218890014545436', sectionId: 'proof-client', dueDate: '2026-10-28' }],
    blocks: [{ id: 'remove-time-block', owner: 'asana', owner_id: 'remove-time-task', selected_date: '2026-10-25', starts_at: new Date('2026-10-25T14:00:00').toISOString(), ends_at: new Date('2026-10-25T14:05:00').toISOString() }],
    plans: [], contacts: [], interactions: [], drafts: [], failures: [],
    asanaProjects: [{ id: '1218890014545436', name: 'Content Editor', lane: 'Content Editor', sections: [{ id: 'proof-client', name: 'Proof client' }] }],
  };
  await page.route('**/api/command-center', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: snapshot });
    const command = route.request().postDataJSON();
    if (command.action === 'taskPlanSave') {
      snapshot.plans = [{ owner: command.owner, owner_id: command.ownerId, period: command.period, planned_date: command.plannedDate, duration_minutes: command.durationMinutes }];
      return route.fulfill({ json: { result: snapshot.plans } });
    }
    if (command.action !== 'blockSave') return route.fulfill({ status: 400, json: { error: 'Remove time must preserve the day' } });
    snapshot.blocks = [{ id: command.id, owner: command.owner, owner_id: command.ownerId, selected_date: command.selectedDate, starts_at: command.startsAt, ends_at: command.endsAt }];
    return route.fulfill({ json: { result: snapshot.blocks } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('button', { name: 'Open Remove time proof', exact: true }).click();
  await page.getByRole('button', { name: 'Start time', exact: true }).click();
  await page.getByRole('button', { name: 'Remove time', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Remove time proof', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Duration', exact: true })).toHaveText('5m');
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('Time');
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await expect(page.getByRole('gridcell', { selected: true })).toHaveText('25');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'Calendar date picker', exact: true })).toHaveCount(0);
});

test('the mobile Plan sheet spans the screen with a centered title and right-hand Done', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/command-center', (route) => route.fulfill({ json: {
    work: [], blocks: [], plans: [], contacts: [], interactions: [], drafts: [], failures: [], asanaProjects: [],
  } }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  const done = page.getByRole('dialog').getByRole('button', { name: 'Done', exact: true });
  const doneBox = await done.boundingBox();
  expect(doneBox.x + doneBox.width).toBeGreaterThanOrEqual(354);
  const heading = await page.getByRole('heading', { name: 'Plan', exact: true }).boundingBox();
  expect(Math.abs(heading.x + heading.width / 2 - 195)).toBeLessThan(6);
  await done.click();
  await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'New task', exact: true })).toBeVisible();
});

test('named task views use planning choices instead of deadlines and survive reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T14:35:00-04:00'));
  const tasks = [
    ['inbox', 'Capture inbox', null, null],
    ['today', 'Today plan', 'day', '2026-10-24'],
    ['week', 'Week plan', 'week', '2026-10-19'],
    ['month', 'Month plan', 'month', '2026-10-01'],
    ['someday', 'Someday plan', 'someday', null],
  ];
  await page.route('**/api/command-center', route => route.fulfill({ json: {
    work: tasks.map(([id, title]) => ({ id, title, owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', dueDate: '2026-10-24' })),
    plans: tasks.filter(([, , period]) => period).map(([id, , period, date]) => ({ owner: 'asana', owner_id: id, period, planned_date: date, duration_minutes: 5 })),
    blocks: [], contacts: [], interactions: [], drafts: [], failures: [], asanaProjects: [],
  } }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Show task queue', exact: true }).click();
  const view = page.getByRole('combobox', { name: 'Task view', exact: true });
  await view.selectOption('inbox');
  await expect(page.getByRole('button', { name: 'Open Capture inbox', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Today plan', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Open Capture inbox', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Edit task', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open Capture inbox', exact: true })).toBeFocused();
  await view.selectOption('today');
  await expect(page.getByRole('button', { name: 'Open Today plan', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Someday plan', exact: true })).toHaveCount(0);
  await view.selectOption('week');
  await expect(page.getByRole('button', { name: 'Open Week plan', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Today plan', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Month plan', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(view).toHaveValue('week');
  await view.selectOption('month');
  await expect(page.getByRole('button', { name: 'Open Month plan', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Week plan', exact: true })).toBeVisible();
  await view.selectOption('someday');
  await expect(page.getByRole('button', { name: 'Open Someday plan', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open Today plan', exact: true })).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('navigation', { name: 'Task views', exact: true }).getByRole('button', { name: 'All tasks', exact: true }).click();
  await expect(view).toHaveValue('all');
  await view.selectOption('inbox');
  await expect(view).toHaveValue('inbox');
  await expect(page.getByRole('button', { name: 'Open Capture inbox', exact: true })).toBeVisible();
});

test('Plan keeps keyboard focus inside and Escape returns to the task draft', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/command-center', route => route.fulfill({ json: {
    work: [], plans: [], blocks: [], contacts: [], interactions: [], drafts: [], failures: [], asanaProjects: [],
  } }));
  await page.goto(url);
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByRole('textbox', { name: 'Task name', exact: true }).fill('Keep this draft');
  const trigger = page.getByRole('button', { name: 'Scheduled date', exact: true });
  await trigger.click();
  await page.getByRole('button', { name: 'Plan duration', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Close plan', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'New task', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Task name', exact: true })).toHaveValue('Keep this draft');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('returning from Clients preserves the chosen calendar scroll position', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T14:35:00-04:00'));
  await page.route('**/api/command-center', route => route.fulfill({ json: {
    work: [], plans: [], blocks: [], contacts: [], interactions: [], drafts: [], failures: [], asanaProjects: [],
  } }));
  await page.goto(url);
  await expect(page.getByText('2:35 PM', { exact: true })).toBeInViewport();
  const marker = page.getByText('9 AM', { exact: true });
  await marker.scrollIntoViewIfNeeded();
  await expect(marker).toBeInViewport();
  const before = await marker.boundingBox();
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('button', { name: 'Planner', exact: true }).click();
  await expect(marker).toBeInViewport();
  const after = await marker.boundingBox();
  expect(Math.abs(after.y - before.y)).toBeLessThan(3);
});

test('desktop duration search cancels unchosen text and saves the confirmed duration', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const snapshot = {
    work: [{ id: 'duration-search', title: 'Duration search proof', owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', projectId: '1218890014545436', sectionId: 'proof-client', dueDate: '2026-10-28' }],
    plans: [{ owner: 'asana', owner_id: 'duration-search', period: 'inbox', planned_date: null, duration_minutes: 60 }],
    blocks: [], contacts: [], interactions: [], drafts: [], failures: [],
    asanaProjects: [{ id: '1218890014545436', name: 'Content Editor', lane: 'Content Editor', sections: [{ id: 'proof-client', name: 'Proof client' }] }],
  };
  await page.route('**/api/command-center', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: snapshot });
    const command = route.request().postDataJSON();
    if (command.action !== 'taskPlanSave') return route.fulfill({ status: 400, json: { error: 'Unexpected owner write' } });
    snapshot.plans = [{ owner: command.owner, owner_id: command.ownerId, period: command.period, planned_date: command.plannedDate, duration_minutes: command.durationMinutes }];
    return route.fulfill({ json: { result: snapshot.plans } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('button', { name: 'Open Duration search proof', exact: true }).click();
  const trigger = page.getByRole('button', { name: 'Duration', exact: true });
  await trigger.click();
  await page.getByRole('searchbox', { name: 'Search duration', exact: true }).fill('25 minutes');
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveText('1h');
  await expect(trigger).toBeFocused();
  await trigger.click();
  const search = page.getByRole('searchbox', { name: 'Search duration', exact: true });
  await expect(search).toHaveValue('');
  await search.fill('1h 30m');
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveText('1h 30m');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Duration search proof', exact: true }).click();
  await expect(trigger).toHaveText('1h 30m');
});

test('Plan accepts a typed exact time and returns from duration before save and reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date('2026-10-24T14:35:00-04:00'));
  const snapshot = {
    work: [{ id: 'typed-plan', title: 'Typed plan proof', owner: 'asana', lane: 'Content Editor', status: 'To Do', blocked: false, url: '#', projectId: '1218890014545436', sectionId: 'proof-client', dueDate: '2026-10-28' }],
    plans: [], blocks: [], contacts: [], interactions: [], drafts: [], failures: [],
    asanaProjects: [{ id: '1218890014545436', name: 'Content Editor', lane: 'Content Editor', sections: [{ id: 'proof-client', name: 'Proof client' }] }],
  };
  await page.route('**/api/command-center', async route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: snapshot });
    const command = route.request().postDataJSON();
    if (command.action === 'taskPlanSave') {
      snapshot.plans = [{ owner: command.owner, owner_id: command.ownerId, period: command.period, planned_date: command.plannedDate, duration_minutes: command.durationMinutes }];
      return route.fulfill({ json: { result: snapshot.plans } });
    }
    if (command.action !== 'blockSave') return route.fulfill({ status: 400, json: { error: 'Planning must not change the source deadline' } });
    snapshot.blocks = [{ id: 'typed-block', owner: command.owner, owner_id: command.ownerId, selected_date: command.selectedDate, starts_at: command.startsAt, ends_at: command.endsAt }];
    return route.fulfill({ json: { result: snapshot.blocks } });
  });
  await page.goto(url);
  await page.getByRole('button', { name: 'Clients', exact: true }).click();
  await page.getByRole('button', { name: 'Open Typed plan proof', exact: true }).click();
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Plan date and time', exact: true }).fill('tomorrow at 9:10 AM');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Plan time', exact: true })).toHaveText('9:10 AM');
  await page.getByRole('button', { name: 'Plan duration', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Plan', exact: true, includeHidden: true })).toBeVisible();
  await page.getByRole('listbox', { name: 'Duration minutes', exact: true }).focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Plan', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Plan duration', exact: true })).toHaveText('5m');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('9:10 AM');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Open Typed plan proof', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start time', exact: true })).toHaveText('9:10 AM');
  await expect(page.getByRole('button', { name: 'Duration', exact: true })).toHaveText('5m');
  await page.getByRole('button', { name: 'Scheduled date', exact: true }).click();
  await page.getByRole('button', { name: 'Choose date', exact: true }).click();
  await expect(page.getByRole('gridcell', { selected: true })).toHaveText('25');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'Calendar date picker', exact: true })).toHaveCount(0);
});
