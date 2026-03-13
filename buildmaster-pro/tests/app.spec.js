import { test, expect } from '@playwright/test';

test.describe('BuildMaster Pro - Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page without errors', async ({ page }) => {
    await expect(page).toHaveTitle(/BuildMaster/);
  });

  test('should display welcome message', async ({ page }) => {
    await expect(page.locator('text=مرحباً')).toBeVisible();
  });
});

test.describe('BuildMaster Pro - Navigation', () => {
  test('should navigate to projects page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=المشاريع');
    await expect(page).toHaveURL(/projects/);
  });

  test('should navigate to expenses page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=المصاريف');
    await expect(page).toHaveURL(/expenses/);
  });
});
