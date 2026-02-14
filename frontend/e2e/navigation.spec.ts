import { test, expect } from '@playwright/test';
import { seedAuth } from './helpers/auth';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await page.goto('/dashboard');
  });

  test('should display grouped navigation sections', async ({ page }) => {
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Core')).toBeVisible();
    await expect(sidebar.getByText('Sales & CRM')).toBeVisible();
    await expect(sidebar.getByText('Finance')).toBeVisible();
    await expect(sidebar.getByText('Operations')).toBeVisible();
    await expect(sidebar.getByText('HR')).toBeVisible();
    await expect(sidebar.getByText('System')).toBeVisible();
  });

  const navTests = [
    { label: 'Projects', url: '/projects' },
    { label: 'Units', url: '/units' },
    { label: 'Leads', url: '/leads' },
    { label: 'Customers', url: '/customers' },
    { label: 'Bookings', url: '/bookings' },
    { label: 'Contracts', url: '/contracts' },
    { label: 'Receipts', url: '/receipts' },
    { label: 'Employees', url: '/hr/employees' },
    { label: 'Settings', url: '/settings' },
  ];

  for (const { label, url } of navTests) {
    test(`should navigate to ${label} page`, async ({ page }) => {
      await page.getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(url));
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
  }

  test('should collapse sidebar when toggle is clicked', async ({ page }) => {
    // Sidebar should be open by default on desktop — nav group labels visible
    await expect(page.getByText('Core')).toBeVisible();

    // Click the menu toggle (first button in sidebar header)
    await page.locator('aside button').first().click();

    // Group titles should be hidden when collapsed
    await expect(page.getByText('Core')).not.toBeVisible();
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });
});
