import { test, expect } from '@playwright/test';
import { seedAuth } from './helpers/auth';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await page.goto('/dashboard');
  });

  test('should display KPI stat cards', async ({ page }) => {
    await expect(page.getByText('Total Units')).toBeVisible();
    await expect(page.getByText('Available Units')).toBeVisible();
    await expect(page.getByText('Total Revenue')).toBeVisible();
    await expect(page.getByText('Overdue Amount')).toBeVisible();
  });

  test('should display recent bookings section', async ({ page }) => {
    await expect(page.getByText('Recent Bookings')).toBeVisible();
    await expect(page.getByText('BK-2026-0012').first()).toBeVisible();
  });

  test('should display collections summary with progress bars', async ({ page }) => {
    await expect(page.getByText('Collections This Month')).toBeVisible();
    await expect(page.getByText('Total Collected')).toBeVisible();
  });

  test('should display unit status distribution', async ({ page }) => {
    await expect(page.getByText('Unit Status')).toBeVisible();
  });

  test('should display top agents section', async ({ page }) => {
    await expect(page.getByText('Top Agents')).toBeVisible();
    await expect(page.getByText('Sarah Mitchell').first()).toBeVisible();
  });

  test('should display quick actions with working links', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible();
    const bookingLink = page.getByRole('link', { name: /New Booking/i });
    await expect(bookingLink).toBeVisible();
    await bookingLink.click();
    await expect(page).toHaveURL(/\/bookings/);
  });

  test('should display recent activity feed', async ({ page }) => {
    await expect(page.getByText('Recent Activity')).toBeVisible();
    await expect(page.getByText('Last 48 hours')).toBeVisible();
  });
});
