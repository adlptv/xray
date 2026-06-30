import { test, expect } from '@playwright/test';

test.describe('XRay Landing Page', () => {
  test('should display hero with CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/XRay/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('Analyze an Extension')).toBeVisible();
  });

  test('should navigate to upload page', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Analyze an Extension').click();
    await expect(page).toHaveURL(/\/upload/);
    await expect(page.getByText('Analyze a Browser Extension')).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Deep Static Analysis')).toBeVisible();
    await expect(page.getByText('Permission Risk Scoring')).toBeVisible();
    await expect(page.getByText('Network Call Audit')).toBeVisible();
    await expect(page.getByText('Data Exfiltration Detection')).toBeVisible();
  });

  test('should navigate to history', async ({ page }) => {
    await page.goto('/');
    await page.getByText('History').click();
    await expect(page).toHaveURL(/\/history/);
  });
});

test.describe('XRay Upload Page', () => {
  test('should show file upload and URL toggle', async ({ page }) => {
    await page.goto('/upload');
    await expect(page.getByText('File Upload')).toBeVisible();
    await expect(page.getByText('Web Store URL')).toBeVisible();
  });

  test('should toggle to URL mode', async ({ page }) => {
    await page.goto('/upload');
    await page.getByText('Web Store URL').click();
    await expect(page.getByPlaceholder(/chromewebstore/)).toBeVisible();
  });
});

test.describe('XRay Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Settings').click();
    await expect(page).toHaveURL(/\/settings/);

    await page.getByText('Analyze').click();
    await expect(page).toHaveURL(/\/upload/);

    await page.getByText('Home').click();
    await expect(page).toHaveURL('/');
  });
});
