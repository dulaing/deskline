import { expect, test } from '@playwright/test';
import { expectFact, loginAs, logout, openRequest } from './helpers';

test('request is handled from open to closed', async ({ page }) => {
  const title = `Printer jam ${Date.now()}`;
  const techComment = 'Replacing the roller, will update soon.';
  const reply = 'Thanks, I will use the 2nd floor printer meanwhile.';
  const activity = page.getByRole('region', { name: 'Activity' });

  // Step 1: requester double-clicks Create; only one request is created
  let createCalls = 0;
  page.on('request', (r) => {
    if (r.method() === 'POST' && new URL(r.url()).pathname === '/requests') createCalls++;
  });

  await page.goto('/login');
  await loginAs(page, 'requester@deskline.test');
  await page.getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'New request', exact: true }).click();
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Description').fill('The printer jams on every second page.');

  const submit = page.locator('form.request-form button[type="submit"]');
  await submit.dblclick();
  await expect(submit).toHaveText('Creating...');
  await expect(submit).toBeDisabled();

  await expect(page).toHaveURL(/\/requests\/request-/);
  expect(createCalls).toBe(1);

  await page.getByRole('link', { name: 'Back to requests' }).click();
  await expect(page.getByRole('main').getByRole('link', { name: title, exact: true })).toHaveCount(1);

  // Step 2: technician assigns it, sets it to pending, and comments
  await logout(page);
  await loginAs(page, 'technician@deskline.test');
  await openRequest(page, title);

  await page.getByRole('button', { name: 'Assign to me' }).click();
  await expectFact(page, 'Assignee', 'Tina Technician');

  await page.getByRole('button', { name: 'Set pending' }).click();
  await expectFact(page, 'Status', 'pending');
  await expect(activity).toContainText('Status changed from open to pending.');

  await page.getByLabel('Add a comment').fill(techComment);
  await page.getByRole('button', { name: 'Post comment' }).click();
  await expect(activity).toContainText(techComment);

  // Step 3: requester sees the progress and replies
  await logout(page);
  await loginAs(page, 'requester@deskline.test');
  await openRequest(page, title);

  await expectFact(page, 'Status', 'pending');
  await expectFact(page, 'Assignee', 'Tina Technician');
  await expect(activity).toContainText(techComment);

  await page.getByLabel('Add a comment').fill(reply);
  await page.getByRole('button', { name: 'Post comment' }).click();
  await expect(activity).toContainText(reply);

  // Step 4: admin closes it through the confirm dialog
  await logout(page);
  await loginAs(page, 'admin@deskline.test');
  await openRequest(page, title);

  await page.getByRole('button', { name: 'Close request' }).click();
  const dialog = page.getByRole('dialog').filter({ hasText: 'Close this request?' });
  await dialog.getByRole('button', { name: 'Close request' }).click();
  await expectFact(page, 'Status', 'closed');

  // Step 5: requester sees it closed and read-only
  await logout(page);
  await loginAs(page, 'requester@deskline.test');
  await openRequest(page, title);

  await expectFact(page, 'Status', 'closed');
  await expect(activity).toContainText('This request is closed');
  await expect(activity).toContainText(reply);
  await expect(page.getByLabel('Add a comment')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel request' })).toHaveCount(0);
});