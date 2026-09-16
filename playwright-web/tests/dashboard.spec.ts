import { test, expect } from '@playwright/test';

test('dashboards loads successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle("SKOR Testing Dashboard");
});