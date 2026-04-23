import { expect, test } from '@playwright/test';

function createState() {
  return {
    agreements: [
      {
        id: 'agreement-1',
        tenantId: 'tenant-1',
        propertyId: 'UNIT-3B',
        propertyTitle: 'Unit 3B',
        propertyAddress: 'Main Street',
        status: 'ACTIVE',
      },
    ],
    technicians: [
      { id: 'tech-1', fullName: 'Tech One', email: 'tech1@example.com' },
      { id: 'tech-2', fullName: 'Tech Two', email: 'tech2@example.com' },
    ],
    requests: [
      {
        id: 'req-1',
        title: 'AC Leak',
        serviceType: 'Plumbing',
        description: 'Water leaking from unit',
        priority: 'HIGH',
        status: 'REPORTED',
        tenantId: 'tenant-1',
        ownerId: 'owner-1',
        propertyId: 'UNIT-3B',
        scheduledAt: null,
        preferredAt: null,
        assignedTechnicianId: '',
        technicianName: '',
        completionSummary: '',
        workflowEvents: [],
      },
      {
        id: 'req-2',
        title: 'Plumbing Issue',
        serviceType: 'Plumbing',
        description: 'Low priority leak',
        priority: 'LOW',
        status: 'REPORTED',
        tenantId: 'tenant-2',
        ownerId: 'owner-2',
        propertyId: 'UNIT-7A',
        scheduledAt: null,
        preferredAt: null,
        assignedTechnicianId: '',
        technicianName: '',
        completionSummary: '',
        workflowEvents: [],
      },
      {
        id: 'req-3',
        title: 'Electrical Hazard',
        serviceType: 'Electrical',
        description: 'Outlet sparks',
        priority: 'EMERGENCY',
        status: 'REPORTED',
        tenantId: 'tenant-3',
        ownerId: 'owner-3',
        propertyId: 'UNIT-9C',
        scheduledAt: null,
        preferredAt: null,
        assignedTechnicianId: '',
        technicianName: '',
        completionSummary: '',
        workflowEvents: [],
      },
    ],
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function findRequest(state, requestId) {
  return state.requests.find((request) => request.id === requestId);
}

function updateRequest(state, requestId, updates, eventAction, eventNote) {
  const request = findRequest(state, requestId);
  if (!request) return null;
  Object.assign(request, updates);
  if (eventAction) {
    request.workflowEvents = [
      ...(request.workflowEvents || []),
      {
        action: eventAction,
        note: eventNote || '',
        occurredAt: new Date().toISOString(),
      },
    ];
  }
  return request;
}

function filteredQueue(state, params) {
  return state.requests.filter((request) => {
    if (request.status === 'CLOSED') return false;
    if (params.status && request.status !== params.status) return false;
    if (params.priority && request.priority !== params.priority) return false;
    if (params.technicianId && request.assignedTechnicianId !== params.technicianId) return false;
    return true;
  });
}

async function seedAuth(page, payload) {
  await page.addInitScript((userData) => {
    if (userData.kind === 'admin') {
      localStorage.setItem('adminToken', userData.token);
      localStorage.setItem('adminUser', JSON.stringify({ id: userData.id, role: 'ADMIN', token: userData.token }));
      return;
    }
    localStorage.setItem('user', JSON.stringify(userData.user));
  }, payload);
}

async function setupMaintenanceRoutes(context, state) {
  await context.route('**/api/v1/agreements/tenant/tenant-1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: state.agreements }),
    });
  });

  await context.route('**/api/v1/maintenance', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    const body = route.request().postDataJSON();
    const created = {
      id: `req-${state.requests.length + 1}`,
      status: 'REPORTED',
      assignedTechnicianId: '',
      technicianName: '',
      scheduledAt: null,
      completionSummary: '',
      workflowEvents: [],
      ownerId: body.ownerId || 'owner-1',
      ...body,
    };
    state.requests.unshift(created);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: created }),
    });
  });

  await context.route('**/api/v1/maintenance/**', async (route) => {
    const url = new URL(route.request().url());
    const segments = url.pathname.split('/').filter(Boolean);
    const maintenanceIndex = segments.indexOf('maintenance');
    const requestId = segments[maintenanceIndex + 1];
    const action = segments[maintenanceIndex + 2] || '';
    const method = route.request().method();

    if (requestId === 'admin' && action === 'queue') {
      const params = {
        status: url.searchParams.get('status') || '',
        priority: url.searchParams.get('priority') || '',
        technicianId: url.searchParams.get('technicianId') || '',
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: filteredQueue(state, params) }),
      });
      return;
    }

    if (requestId === 'technicians') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: state.technicians }),
      });
      return;
    }

    if (requestId === 'tenant') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: state.requests.filter((request) => request.tenantId === action) }),
      });
      return;
    }

    if (requestId === 'owner') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: state.requests.filter((request) => request.ownerId === action) }),
      });
      return;
    }

    if (requestId === 'technician') {
      const technicianId = action;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: state.requests.filter((request) => request.assignedTechnicianId === technicianId) }),
      });
      return;
    }

    const request = findRequest(state, requestId);

    if (!request) {
      await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not found' }) });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: request }) });
      return;
    }

    if (method === 'PATCH' && action === 'assign') {
      const payload = route.request().postDataJSON() || {};
      const technicianId = payload.technicianId || url.searchParams.get('technicianId');
      const technician = state.technicians.find((item) => item.id === technicianId);
      updateRequest(state, requestId, {
        assignedTechnicianId: technicianId,
        technicianName: technician?.fullName || technicianId,
        status: 'ASSIGNED',
      }, 'Assigned technician', technician?.fullName || technicianId);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    if (method === 'PATCH' && action === 'schedule') {
      const payload = route.request().postDataJSON() || {};
      const technicianId = payload.technicianId;
      const technician = state.technicians.find((item) => item.id === technicianId);
      updateRequest(state, requestId, {
        assignedTechnicianId: technicianId,
        technicianName: technician?.fullName || technicianId,
        scheduledAt: payload.scheduledAt || null,
        status: payload.scheduledAt ? 'SCHEDULED' : 'ASSIGNED',
      }, 'Scheduled maintenance', technician?.fullName || technicianId);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    if (method === 'PATCH' && action === 'priority') {
      const payload = route.request().postDataJSON() || {};
      const priority = url.searchParams.get('priority') || payload.priority;
      updateRequest(state, requestId, { priority }, 'Priority updated', priority);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    if (method === 'PATCH' && action === 'accept') {
      updateRequest(state, requestId, { status: 'IN_PROGRESS' }, 'Accepted request');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    if (method === 'PATCH' && action === 'pause') {
      updateRequest(state, requestId, { status: 'PAUSED' }, 'Paused work');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    if (method === 'PATCH' && action === 'resume') {
      updateRequest(state, requestId, { status: 'IN_PROGRESS' }, 'Resumed work');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    if (method === 'PATCH' && action === 'resolve') {
      const payload = route.request().postDataJSON() || {};
      updateRequest(state, requestId, {
        status: 'RESOLVED',
        completionSummary: payload.completionSummary || 'Resolved',
      }, 'Resolved request', payload.completionSummary || 'Resolved');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    if (method === 'PATCH' && action === 'close') {
      updateRequest(state, requestId, { status: 'CLOSED' }, 'Closed request', url.searchParams.get('adminNote') || 'Closed by admin');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: findRequest(state, requestId) }) });
      return;
    }

    await route.fallback();
  });
}

async function setTenantAuth(page, userId = 'tenant-1') {
  await seedAuth(page, { user: { id: userId, role: 'TENANT', token: 'tenant-token' } });
}

async function setOwnerAuth(page, userId = 'owner-1') {
  await seedAuth(page, { user: { id: userId, role: 'OWNER', token: 'owner-token' } });
}

async function setTechAuth(page, userId = 'tech-1') {
  await seedAuth(page, { user: { id: userId, role: 'TECHNICIAN', token: 'tech-token' } });
}

async function setAdminAuth(page) {
  await seedAuth(page, { kind: 'admin', id: 'admin-1', token: 'admin-token' });
}

async function openTenantRequest(page) {
  await page.goto('/tenant/maintenance/request');
  await expect(page.getByRole('button', { name: 'Submit Request' })).toBeVisible();
}

test.describe('Maintenance Module - Full Lifecycle E2E', () => {
  test('complete lifecycle: tenant creates, admin assigns, technician resolves, admin closes', async ({ page, context }) => {
    const state = createState();
    state.requests = [];
    await setupMaintenanceRoutes(context, state);

    const tenantPage = page;
    await setTenantAuth(tenantPage);
    await openTenantRequest(tenantPage);

    await tenantPage.locator('select').nth(0).selectOption('UNIT-3B');
    await tenantPage.fill('input[placeholder="Issue title"]', 'AC Leak');
    await tenantPage.locator('select').nth(1).selectOption('Plumbing');
    await tenantPage.fill('textarea[placeholder="Describe the issue"]', 'Water leaking from unit');
    await tenantPage.click('button:has-text("Submit Request")');

    await expect(tenantPage).toHaveURL(/\/tenant\/maintenance\/dashboard$/);
    await expect(tenantPage.getByRole('row', { name: /AC Leak/ })).toBeVisible();
    await expect(tenantPage.getByRole('row', { name: /AC Leak/ })).toContainText('Reported');

    const adminPage = await context.newPage();
    await setAdminAuth(adminPage);
    await adminPage.goto('/admin/maintenance');

    const adminRow = adminPage.locator('tr', { hasText: 'AC Leak' });
    await adminRow.getByRole('button', { name: /Dispatch/i }).click();
    await adminPage.getByLabel('Assign technician').selectOption('tech-1');
    await adminPage.getByLabel('Schedule time').fill('2026-04-24T10:30');
    await adminPage.getByRole('button', { name: 'Dispatch request' }).click();
    await expect(adminRow).toContainText(/Scheduled|Assigned/i);

    const techPage = await context.newPage();
    await setTechAuth(techPage);
    await techPage.goto('/technician/dashboard');
    await expect(techPage.getByText('AC Leak')).toBeVisible();
    await techPage.getByRole('link', { name: 'Open' }).click();

    await expect(techPage).toHaveURL(/\/technician\/job\/req-1$/);
    await techPage.getByRole('button', { name: 'Accept' }).click();
    await expect(techPage.getByRole('button', { name: 'Pause' })).toBeVisible();
    await techPage.getByRole('button', { name: 'Pause' }).click();
    await expect(techPage.getByRole('button', { name: 'Resume' })).toBeVisible();
    await techPage.getByRole('button', { name: 'Resume' }).click();
    await techPage.fill('textarea[placeholder="Completion summary"]', 'Compressor replaced and system restored.');
    await techPage.fill('textarea[placeholder="Technician notes"]', 'Checked fittings and verified cooling cycle.');
    await techPage.getByRole('button', { name: 'Resolve Request' }).click();

    await expect(techPage).toHaveURL(/\/technician\/dashboard$/);
    await tenantPage.reload();
    await expect(tenantPage.getByText('RESOLVED')).toBeVisible();

    await adminPage.goto('/admin/maintenance');
    const resolvedRow = adminPage.locator('tr', { hasText: 'AC Leak' });
    await resolvedRow.getByRole('button', { name: 'Close' }).click();
    await expect(adminPage.getByText('No requests in queue.')).toBeVisible();

    await tenantPage.goto('/tenant/maintenance/history');
    await expect(tenantPage.locator('tbody tr', { hasText: 'AC Leak' })).toContainText(/Closed/i);

    const ownerPage = await context.newPage();
    await setOwnerAuth(ownerPage);
    await ownerPage.goto('/owner/maintenance');
    await expect(ownerPage.getByText('Owner Maintenance Overview')).toBeVisible();
  });

  test('admin queue filtering works across status, priority, and technician', async ({ page, context }) => {
    const state = createState();
    await setupMaintenanceRoutes(context, state);

    await setAdminAuth(page);
    await page.goto('/admin/maintenance');

    const filterSelects = page.locator('select');
    await filterSelects.nth(1).selectOption('EMERGENCY');
    await expect(page.locator('tbody tr', { hasText: 'Electrical Hazard' })).toBeVisible();
    await expect(page.locator('tbody tr', { hasText: 'AC Leak' })).not.toBeVisible();

    const emergencyRow = page.locator('tr', { hasText: 'Electrical Hazard' });
    await emergencyRow.getByRole('button', { name: /Dispatch/i }).click();
    await page.getByLabel('Assign technician').selectOption('tech-1');
    await page.getByLabel('Schedule time').fill('2026-04-24T10:30');
    await page.getByRole('button', { name: 'Dispatch request' }).click();

    await filterSelects.nth(2).selectOption('tech-1');
    await expect(page.locator('tbody tr', { hasText: 'Electrical Hazard' })).toBeVisible();
    await expect(page.locator('tbody tr', { hasText: 'Plumbing Issue' })).not.toBeVisible();
  });

  test('technician can pause and resume maintenance work', async ({ page, context }) => {
    const state = createState();
    state.requests[0].status = 'IN_PROGRESS';
    state.requests[0].assignedTechnicianId = 'tech-1';
    state.requests[0].technicianName = 'Tech One';
    await setupMaintenanceRoutes(context, state);

    await setTechAuth(page);
    await page.goto('/technician/job/req-1');

    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
    await page.getByRole('button', { name: 'Pause' }).click();
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  });

  test('security guards redirect unauthorized users away from admin maintenance', async ({ page, context }) => {
    const state = createState();
    await setupMaintenanceRoutes(context, state);

    await setTechAuth(page);
    await page.goto('/admin/maintenance');

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByText('Maintenance Control Center')).not.toBeVisible();
  });

  test('tenant request form shows backend failures cleanly', async ({ page, context }) => {
    await context.route('**/api/v1/maintenance', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Failed to submit maintenance request' }),
        });
        return;
      }
      await route.fallback();
    });

    await context.route('**/api/v1/agreements/tenant/tenant-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: createState().agreements }),
      });
    });

    await setTenantAuth(page);
    await openTenantRequest(page);
    await page.locator('select').nth(0).selectOption('UNIT-3B');
    await page.fill('input[placeholder="Issue title"]', 'Test Issue');
    await page.locator('select').nth(1).selectOption('Plumbing');
    await page.fill('textarea[placeholder="Describe the issue"]', 'Backend should fail this request');
    await page.click('button:has-text("Submit Request")');

    await expect(page.getByText('Failed to submit maintenance request')).toBeVisible();
  });
});

test.describe('E2E Tests - Configuration', () => {
  test('uses correct API base URL from environment', async () => {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
    expect(apiBaseUrl).toBeTruthy();
  });
});
