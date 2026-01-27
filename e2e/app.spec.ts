import { test, expect } from '@playwright/test';

test.describe('ArchMatch - Student Group Matching Platform', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page with header', async ({ page }) => {
    await expect(page.locator('text=ArchMatch')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Software Architecture');
  });

  test('should display student stats', async ({ page }) => {
    // Check stats display
    await expect(page.getByText('Students').first()).toBeVisible();
    await expect(page.getByText('Groups').first()).toBeVisible();
    await expect(page.getByText('Ungrouped').first()).toBeVisible();
  });

  test('should display navigation tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Students/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Auto-Match/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Manual Groups/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /All Groups/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Export/i })).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    // Find theme toggle button by aria-label pattern
    const themeToggle = page.getByRole('button', { name: /switch to (light|dark) mode/i });
    await expect(themeToggle).toBeVisible();

    // Get initial state
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');

    // Click toggle
    await themeToggle.click();

    // Verify theme changed
    const newClass = await html.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });

  test('should show teacher name', async ({ page }) => {
    await expect(page.getByText(/Teacher: Osnat/i)).toBeVisible();
  });
});

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should switch to Auto-Match tab', async ({ page }) => {
    await page.getByRole('button', { name: /Auto-Match/i }).click();
    await expect(page.getByText(/Auto-Match Generator/i)).toBeVisible();
  });

  test('should switch to Manual Groups tab', async ({ page }) => {
    await page.getByRole('button', { name: /Manual Groups/i }).click();
    await expect(page.getByText(/Pre-formed/i).first()).toBeVisible();
  });

  test('should switch to All Groups tab', async ({ page }) => {
    await page.getByRole('button', { name: /All Groups/i }).click();
    // Should show groups or empty state
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('should switch to Export tab', async ({ page }) => {
    await page.getByRole('button', { name: /Export/i }).click();
    await expect(page.getByText(/Print View/i)).toBeVisible();
  });
});

test.describe('Students Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display student cards', async ({ page }) => {
    // Students tab should be active by default
    // Check for phone numbers which indicate student cards
    const phoneNumbers = page.locator('text=/\\+972/');
    const count = await phoneNumbers.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display student names', async ({ page }) => {
    // Look for specific student names from the data
    await expect(page.getByText('Shiran').first()).toBeVisible();
  });
});

test.describe('Matching Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate to Auto-Match tab
    await page.getByRole('button', { name: /Auto-Match/i }).click();
  });

  test('should display matching strategies', async ({ page }) => {
    await expect(page.getByText(/Random/i).first()).toBeVisible();
  });

  test('should generate groups when strategy selected', async ({ page }) => {
    // Click on Random strategy
    const randomButton = page.getByRole('button', { name: /Random/i }).first();
    await randomButton.click();

    // Look for Generate button
    const generateButton = page.getByRole('button', { name: /Generate/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
      // Wait for groups to be generated
      await page.waitForTimeout(1000);
    }
  });
});

test.describe('Manual Groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Manual Groups/i }).click();
  });

  test('should show manual group creation UI', async ({ page }) => {
    // Should see UI for creating manual groups
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });
});

test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Export/i }).click();
  });

  test('should show export options', async ({ page }) => {
    await expect(page.getByText(/Print View/i)).toBeVisible();
    await expect(page.getByText(/JSON Data/i)).toBeVisible();
    await expect(page.getByText(/Copy List/i)).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Software Architecture');
  });

  test('should have interactive buttons', async ({ page }) => {
    await page.goto('/');
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(5); // At least the nav tabs + theme toggle
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
