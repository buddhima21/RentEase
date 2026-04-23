import { expect, test } from '@playwright/test';

test('admin assigns technician from maintenance queue', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('adminToken', 'admin-token');
    localStorage.setItem('adminUser', JSON.stringify({ id: 'admin-1', role: 'ADMIN' }));
  });

  await page.route('**/api/v1/maintenance/admin/queue**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: 'req-1', title: 'AC breakdown', priority: 'HIGH', status: 'REPORTED', assignedTechnicianId: '' },
        ],
      }),
    });
  });

  await page.route('**/api/v1/maintenance/technicians', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: [{ id: 'tech-1', fullName: 'Tech One', email: 'tech1@example.com' }] }),
    });
  });

  let scheduleCalled = false;
  await page.route('**/api/v1/maintenance/req-1/schedule', async (route) => {
    scheduleCalled = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: 'req-1', assignedTechnicianId: 'tech-1', status: 'SCHEDULED' } }),
    });
  });

  await page.goto('/admin/maintenance');

  await page.getByRole('button', { name: /Dispatch/i }).click();
  await page.getByLabel('Assign technician').selectOption('tech-1');
  await page.getByLabel('Schedule time').fill('2026-04-24T10:30');
  await page.getByRole('button', { name: 'Dispatch request' }).click();

  await expect.poll(() => scheduleCalled).toBe(true);
});

test('technician resolves assigned maintenance job', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ id: 'tech-1', role: 'TECHNICIAN', token: 'tech-token' }));
  });

  await page.route('**/api/v1/maintenance/req-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'req-1',
          title: 'AC breakdown',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          serviceType: 'HVAC',
          description: 'Not cooling',
          tenantId: 'tenant-1',
          propertyId: 'UNIT-3B',
        },
      }),
    });
  });

  await page.route('**/api/v1/maintenance/req-1/resolve', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { id: 'req-1', status: 'RESOLVED' } }),
    });
  });

  await page.goto('/login');
  await page.goto('/technician/job/req-1');

  await page.fill('textarea[placeholder="Completion summary"]', 'Issue fixed');
  await page.fill('textarea[placeholder="Technician notes"]', 'Compressor replaced');
  await page.getByRole('button', { name: 'Resolve Request' }).click();

  await expect(page).toHaveURL(/\/technician\/dashboard$/);
});
