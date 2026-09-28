import { expect, type Page } from '@playwright/test';

export async function loginAs(page: Page, email: string) {
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
}

export async function expectFact(page: Page, label: string, value: string) {
  const row = page.locator('.request-facts > div')
    .filter({ has: page.locator('dt', { hasText: new RegExp(`^${label}$`) }) });
  await expect(row.locator('dd')).toHaveText(value);
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
}

export async function openRequest(page: Page, title: string) {
  await page.getByRole('main').getByRole('link', { name: title, exact: true }).click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
}