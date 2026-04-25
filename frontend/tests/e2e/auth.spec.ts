import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow a user to register and login', async ({ page }) => {
    // Go to registration page
    await page.goto('/register');
    
    // Fill registration form
    const username = `testuser_${Date.now()}`;
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', `${username}@example.com`);
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to login or dashboard
    await expect(page).toHaveURL(/.*login|.*dashboard/);

    // If redirected to login, try logging in
    if (page.url().includes('login')) {
      await page.fill('input[name="email"]', `${username}@example.com`);
      await page.fill('input[name="password"]', 'Password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*dashboard/);
    }

    // Check if user is logged in
    await expect(page.locator('nav')).toContainText(username);
  });
});
