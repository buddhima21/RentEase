import { expect, test } from '@playwright/test';

test('tenant creates maintenance request and lands on dashboard', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ id: 'tenant-1', role: 'TENANT', token: 'tenant-token' }));
  });

  await page.route('**/api/v1/maintenance', async (route, request) => {
    if (request.method() === 'POST') {
      const body = request.postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 'req-1', ...body } }),
      });
      return;
    }
    await route.fallback();
  });

  await page.route('**/api/v1/maintenance/tenant/tenant-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [] }),
    });
  });

  await page.goto('/login');
  await page.goto('/tenant/maintenance/request');

  await page.selectOption('select:has(option[value="UNIT-3B"])', 'UNIT-3B');
  await page.fill('input[placeholder="Issue title"]', 'Leaking sink');
  await page.selectOption('select:has(option[value="Plumbing"])', 'Plumbing');
  await page.fill('textarea[placeholder="Describe the issue"]', 'Water leaking under sink cabinet.');

  await page.getByRole('button', { name: 'Submit Request' }).click();

  await expect(page).toHaveURL(/\/tenant\/maintenance\/dashboard$/);
  await expect(page.getByText('Tenant Maintenance Dashboard')).toBeVisible();
});
