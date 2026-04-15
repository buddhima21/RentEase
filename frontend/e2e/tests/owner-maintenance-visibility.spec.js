import { expect, test } from '@playwright/test';

test('owner sees maintenance requests for owned properties', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ id: 'owner-1', role: 'OWNER', token: 'owner-token' }));
  });

  await page.route('**/api/v1/maintenance/owner/owner-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 'req-1', title: 'Pipe leak', priority: 'HIGH', status: 'IN_PROGRESS', assignedTechnicianId: 'tech-1' },
        ],
      }),
    });
  });

  await page.goto('/login');
  await page.goto('/owner/maintenance');

  await expect(page.getByText('Owner Maintenance Overview')).toBeVisible();
  await expect(page.getByText('Pipe leak')).toBeVisible();
  await expect(page.getByText('tech-1')).toBeVisible();
});
