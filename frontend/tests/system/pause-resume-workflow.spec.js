import { expect, test } from '@playwright/test';

test('technician can pause and resume maintenance workflow', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ id: 'tech-1', role: 'TECHNICIAN', token: 'tech-token' }));
  });

  let currentStatus = 'IN_PROGRESS';

  await page.route('**/api/v1/maintenance/req-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'req-1',
          title: 'Electrical issue',
          priority: 'MEDIUM',
          status: currentStatus,
          serviceType: 'Electrical',
          description: 'Socket failure',
          tenantId: 'tenant-1',
          propertyId: 'UNIT-5A',
        },
      }),
    });
  });

  await page.route('**/api/v1/maintenance/req-1/pause', async (route) => {
    currentStatus = 'PAUSED';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { status: 'PAUSED' } }) });
  });

  await page.route('**/api/v1/maintenance/req-1/resume', async (route) => {
    currentStatus = 'IN_PROGRESS';
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { status: 'IN_PROGRESS' } }) });
  });

  await page.goto('/login');
  await page.goto('/technician/job/req-1');

  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause' }).click();

  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();

  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
});
