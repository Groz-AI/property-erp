import { test, expect } from '@playwright/test';
import { seedAuth } from './helpers/auth';

test.describe('Bookings Page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAuth(page);
    await page.goto('/bookings');
  });

  test('should display bookings page with header', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Bookings/i })).toBeVisible();
    await expect(page.getByText('Manage unit bookings with status tracking')).toBeVisible();
  });

  test('should display data table with booking records', async ({ page }) => {
    await expect(page.getByText('BK-2026-0012')).toBeVisible();
    await expect(page.getByText('Khalid Al-Mansour')).toBeVisible();
    await expect(page.getByText('SG-PH1-A-G02')).toBeVisible();
  });

  test('should search bookings by booking number', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search bookings...');
    await searchInput.fill('BK-2026-0012');
    await expect(page.getByText('BK-2026-0012')).toBeVisible();
    await expect(page.getByText('BK-2026-0009')).not.toBeVisible();
  });

  test('should open create booking dialog', async ({ page }) => {
    await page.getByRole('button', { name: /New Booking/i }).click();
    // Dialog should show form labels
    await expect(page.getByText('Project').first()).toBeVisible();
    await expect(page.getByText('Unit').first()).toBeVisible();
    await expect(page.getByText('Customer').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Booking/i })).toBeVisible();
  });

  test('should close dialog on cancel', async ({ page }) => {
    await page.getByRole('button', { name: /New Booking/i }).click();
    await expect(page.getByRole('button', { name: /Create Booking/i })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    // Dialog should be closed
    await expect(page.getByRole('button', { name: /Create Booking/i })).not.toBeVisible();
  });

  test('should show status badges for bookings', async ({ page }) => {
    await expect(page.getByText('Active').first()).toBeVisible();
    await expect(page.getByText('Converted')).toBeVisible();
    await expect(page.getByText('Expired')).toBeVisible();
    await expect(page.getByText('Cancelled')).toBeVisible();
  });

  test('should show view and cancel action buttons for active bookings', async ({ page }) => {
    // Active bookings should have cancel buttons
    const cancelButtons = page.locator('[title="Cancel booking"]');
    await expect(cancelButtons.first()).toBeVisible();
  });
});
