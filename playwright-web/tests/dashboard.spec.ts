import { test, expect } from '@playwright/test';

test('Dashboard loads successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Skorr/i);
});