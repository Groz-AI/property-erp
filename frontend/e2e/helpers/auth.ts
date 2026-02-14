import { Page } from '@playwright/test';

const MOCK_USER = {
  id: 'usr-001',
  email: 'ahmad@groz.ae',
  firstName: 'Ahmad',
  lastName: 'Al-Rashid',
  tenantId: 'tenant-001',
  isSystemAdmin: true,
};

const MOCK_LOGIN_RESPONSE = {
  data: {
    accessToken: 'mock-access-token-e2e',
    refreshToken: 'mock-refresh-token-e2e',
    expiresIn: 900,
    user: MOCK_USER,
  },
};

const AUTH_STORE_STATE = {
  state: {
    user: MOCK_USER,
    accessToken: 'mock-access-token-e2e',
    refreshToken: 'mock-refresh-token-e2e',
    isAuthenticated: true,
  },
  version: 0,
};

/**
 * Intercept the login API call and return mock data so tests
 * don't depend on a running backend.
 */
export async function mockLoginApi(page: Page) {
  await page.route('**/api/v1/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_LOGIN_RESPONSE),
    }),
  );
  await page.route('**/api/v1/auth/logout', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
  );
}

/**
 * Seed the auth store directly into localStorage so the app
 * considers the user already logged in — skipping the login flow.
 */
export async function seedAuth(page: Page) {
  await mockLoginApi(page);
  await page.addInitScript((storeState: typeof AUTH_STORE_STATE) => {
    window.localStorage.setItem('erp-auth', JSON.stringify(storeState));
  }, AUTH_STORE_STATE);
}

/**
 * Login via UI with mocked API (for auth-specific tests).
 */
export async function loginViaUi(page: Page) {
  await mockLoginApi(page);
  await page.goto('/login');
  await page.getByRole('button', { name: /Sign In/i }).click();
}
