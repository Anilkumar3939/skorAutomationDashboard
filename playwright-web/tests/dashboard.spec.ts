import { test, expect } from '@playwright/test';

test('dashboard loads successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("SKOR Testing Dashboard");
});