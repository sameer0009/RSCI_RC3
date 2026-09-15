import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // UI contract tests; no live database, email delivery, or account creation.
  await page.route('**/api/auth/me', route => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false }) }));
  await page.route('**/api/auth/refresh', route => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false }) }));
});
test('public registration redirects to assigned-account login', async ({ page }) => {
  await page.goto('/register'); await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Email address')).toBeVisible();
});
test('invalid credentials remain visible on login', async ({ page }) => {
  await page.route('**/api/auth/login', route => route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, error: { message: 'Invalid credentials' } }) }));
  await page.goto('/login'); await page.getByLabel('Email address').fill('student@example.com'); await page.getByLabel('Password', { exact: true }).fill('BadPassword1');
  await page.getByRole('button', { name: /sign in/i }).click(); await expect(page.getByRole('alert').filter({ hasText: 'Invalid credentials' })).toHaveText('Invalid credentials'); await expect(page).toHaveURL(/\/login$/);
});
test('password recovery is reachable and announces delivery status', async ({ page }) => {
  await page.route('**/api/auth/forgot-password', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ success: true }) }));
  await page.goto('/login'); await page.getByRole('link', { name: 'Forgot your password?' }).click();
  await page.getByLabel('Email address').fill('student@example.com'); await page.getByRole('button', { name: 'Send reset link' }).click();
  await expect(page.getByRole('status')).toContainText('If an account exists');
});
test('missing reset token provides recovery link on mobile without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 }); await page.goto('/reset-password');
  await expect(page.getByRole('alert').filter({ hasText: 'missing its token' })).toContainText('missing its token'); await expect(page.getByRole('link', { name: 'Request a new reset link' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
