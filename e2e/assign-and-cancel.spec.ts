import { expect, test } from '@playwright/test';
import { expectFact, loginAs, logout, openRequest } from './helpers';

test('admin assigns a request and the requester cancels it', async ({ page }) => {

  const title = `Badge not working ${Date.now()}`;
  const description = 'My access badge stopped opening the 3rd floor door.';
  const activity = page.getByRole('region', { name: 'Activity' });

  // Step 1a: requester sees field errors for short input
  await page.goto('/login');
  await loginAs(page, 'requester@deskline.test');
  await page.getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'New request', exact: true }).click();

  await page.getByLabel('Title').click();
  await page.getByLabel('Description').click();
  await page.keyboard.press('Tab');            // leaves both fields

  await expect(page.getByText('Enter at least 3 characters.')).toBeVisible();
  await expect(page.getByText('Enter at least 10 characters.')).toBeVisible();
  await expect(page.getByLabel('Title')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('button', { name: 'Create request' })).toBeDisabled();

  // Step 1b: login expires, Create fails, typed text is kept
  await page.getByLabel('Title').fill(title);
  await page.getByLabel('Description').fill(description);
  await page.getByLabel('Category').selectOption('access');

  const session = await page.evaluate(() => localStorage.getItem('deskline-session'));
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('deskline-session')!);
    s.token = 'deskline-token:expired';
    localStorage.setItem('deskline-session', JSON.stringify(s));
  });

  await page.getByRole('button', { name: 'Create request' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Authentication required.' })).toBeVisible();
  await expect(page.getByLabel('Title')).toHaveValue(title);
  await expect(page.getByLabel('Description')).toHaveValue(description);
  await expect(page.getByLabel('Category')).toHaveValue('access');

  // Step 1c: restore the login and retry; it's created once
  await page.evaluate((value) => localStorage.setItem('deskline-session', value), session!);
  await page.getByRole('button', { name: 'Create request' }).click();
  await expect(page).toHaveURL(/\/requests\/request-/);
  await expectFact(page, 'Assignee', 'Unassigned');

  await page.getByRole('link', { name: 'Back to requests' }).click();
  await expect(page.getByRole('main').getByRole('link', { name: title, exact: true })).toHaveCount(1);

  // Step 2: admin assigns it to the technician
  await logout(page);
  await loginAs(page, 'admin@deskline.test');
  await openRequest(page, title);

  await page.getByLabel('Assignee').selectOption({ label: 'Tina Technician (technician)' });
  await expectFact(page, 'Assignee', 'Tina Technician');

  // Step 3: technician finds it under "Me"
  await logout(page);
  await loginAs(page, 'technician@deskline.test');
  await page.getByLabel('Assignee').selectOption('me');
  await expect(page.getByRole('main').getByRole('link', { name: title, exact: true })).toHaveCount(1);

  // Step 4: requester cancels it
  await logout(page);
  await loginAs(page, 'requester@deskline.test');
  await openRequest(page, title);

  await page.getByRole('button', { name: 'Cancel request' }).click();
  const dialog = page.getByRole('dialog').filter({ hasText: 'Cancel this request?' });
  await dialog.getByRole('button', { name: 'Cancel request' }).click();

  await expectFact(page, 'Status', 'cancelled');
  await expect(activity).toContainText('Status changed from open to cancelled.');
  await expect(activity).toContainText('This request is cancelled');
  await expect(page.getByLabel('Add a comment')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel request' })).toHaveCount(0);

  // Step 5: admin can no longer change it
  await logout(page);
  await loginAs(page, 'admin@deskline.test');
  await openRequest(page, title);

  await expectFact(page, 'Status', 'cancelled');
  await expect(page.getByLabel('Assignee')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Assign to me' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Set pending' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Close request' })).toHaveCount(0);
  await expect(page.getByLabel('Add a comment')).toHaveCount(0);
});