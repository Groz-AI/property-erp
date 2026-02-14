import { test, expect } from '@playwright/test';
import { mockLoginApi, loginViaUi, seedAuth } from './helpers/auth';

test.describe('Authentication', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show login form with demo credentials', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Real Estate ERP/i })).toBeVisible();
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
    await expect(page.getByPlaceholder('Enter password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByText('ahmad@groz.ae')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.getByPlaceholder('Enter password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click the eye toggle (last svg button in the form)
    await page.locator('button').filter({ has: page.locator('svg') }).last().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('should show error toast on failed login', async ({ page }) => {
    // Mock API to return 400 (not 401 — the 401 interceptor redirects)
    await page.route('**/api/v1/auth/login', (route) =>
      route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'Invalid credentials' }) }),
    );
    await page.goto('/login');
    await page.getByPlaceholder('you@company.com').fill('wrong@email.com');
    await page.getByPlaceholder('Enter password').fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In/i }).click();

    await expect(page.locator('[data-sonner-toast]').first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to dashboard on successful login', async ({ page }) => {
    await loginViaUi(page);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/Dashboard/i).first()).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    await loginViaUi(page);
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    await page.getByText('Logout').click();
    await expect(page).toHaveURL(/\/login/);
  });
});
