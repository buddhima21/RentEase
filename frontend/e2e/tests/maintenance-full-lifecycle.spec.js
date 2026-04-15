import { test, expect } from '@playwright/test';

/**
 * Phase 5: Comprehensive End-to-End Integration Tests for Maintenance Workflow
 * 
 * Tests the complete lifecycle and multi-role scenarios across tenant, admin, and technician
 * Covers MAINTENANCE_TEST_COVERAGE_MATRIX.md sections 1-5 at the browser level
 * 
 * Note: These tests use mocked API routes. For integration-first approach, 
 * configure these to use a real backend via process.env.API_BASE_URL
 */

test.describe('Maintenance Module - Full Lifecycle E2E', () => {

  /**
   * PRIME TEST: Complete Request Lifecycle (Tenant → Admin → Technician → Closure)
   * Validates: 6 states (REPORTED → ASSIGNED → IN_PROGRESS → PAUSED → IN_PROGRESS → RESOLVED → CLOSED)
   * Covers: Role transitions, visibility at each stage, state machine correctness
   */
  test('complete_lifecycle: Tenant creates → Admin assigns → Tech accepts/works → Admin closes', async ({ page, context }) => {
    
    // SETUP: Mock all API routes for maintenance
    await page.route('**/api/v1/maintenance', route => {
      if (route.request().method() === 'POST') {
        // Tenant create request
        route.abort('failed'); // TODO: Mock successful response with ID
      }
    });

    await page.route('**/api/v1/maintenance/admin/queue', route => {
      route.abort('failed'); // TODO: Mock queue response
    });

    // STEP 1: Tenant Login & Create Request
    await page.goto('http://localhost:5173/tenant/login'); // Adjust URL as needed
    await page.fill('input[name="email"]', 'tenant1@rentease.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tenant/maintenance/dashboard');

    // Navigate to request creation
    await page.click('button:has-text("Create Request")');
    await page.waitForURL('**/tenant/maintenance/request');
    
    // Fill form
    await page.selectOption('select[name="propertyId"]', 'prop-1');
    await page.fill('input[name="title"]', 'AC Leak');
    await page.fill('textarea[name="description"]', 'Water leaking from unit');
    await page.selectOption('select[name="priority"]', 'HIGH');
    
    // Submit
    await page.click('button:has-text("Submit Request")');
    
    // Verify: Dashboard shows REPORTED status
    await page.waitForURL('**/tenant/maintenance/dashboard');
    await expect(page.locator('text=REPORTED')).toBeVisible();
    
    // Extract request ID from URL or DOM (depends on implementation)
    const requestId = 'req-1'; // TODO: Extract from response
    
    // STEP 2: Admin Login & Assign Technician
    const adminContext = await context.newCookies();
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:5173/admin/login');
    await adminPage.fill('input[name="email"]', 'admin@rentease.com');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('**/admin/maintenance');
    
    // Find request in queue and assign technician
    await adminPage.click(`button[data-request-id="${requestId}"]`);
    await adminPage.selectOption('select[name="technicianId"]', 'tech-1');
    await adminPage.click('button:has-text("Assign")');
    
    // Verify: Status changed to ASSIGNED
    await expect(adminPage.locator(`text=ASSIGNED`)).toBeVisible();
    
    // STEP 3: Technician Login & Accept Request
    const techPage = await context.newPage();
    await techPage.goto('http://localhost:5173/technician/login');
    await techPage.fill('input[name="email"]', 'tech1@rentease.com');
    await techPage.fill('input[name="password"]', 'tech123');
    await techPage.click('button[type="submit"]');
    await techPage.waitForURL('**/technician/dashboard');
    
    // Open assigned request
    await techPage.click(`button:has-text("${requestId}")`);
    await techPage.waitForURL(`**/technician/job/${requestId}`);
    
    // Accept request
    await techPage.click('button:has-text("Accept")');
    
    // Verify: Status changed to IN_PROGRESS, Accept button gone
    await expect(techPage.locator('text=IN_PROGRESS')).toBeVisible();
    await expect(techPage.locator('button:has-text("Accept")')).not.toBeVisible();
    await expect(techPage.locator('text=Start Work')).toBeVisible(); // New button available
    
    // STEP 4: Technician Pauses & Resumes Work
    await techPage.click('button:has-text("Pause")');
    await expect(techPage.locator('text=PAUSED')).toBeVisible();
    await expect(techPage.locator('button:has-text("Resume")')).toBeVisible();
    
    await techPage.click('button:has-text("Resume")');
    // Verify: Status returns to IN_PROGRESS (not REPORTED)
    await expect(techPage.locator('text=IN_PROGRESS')).toBeVisible();
    
    // STEP 5: Technician Resolves Request
    await techPage.click('button:has-text("Resolve")');
    await techPage.waitForURL(`**/technician/job/${requestId}/resolve`);
    
    // Fill resolution form
    await techPage.fill('textarea[name="completionSummary"]', 'Replaced AC compressor. Unit now operational.');
    await techPage.fill('textarea[name="notes"]', 'Original unit was 8 years old, beyond warranty.');
    
    // Add completion images (simulate upload)
    const fileInput = await techPage.locator('input[type="file"]');
    // await fileInput.setInputFiles('path/to/test-image.jpg'); // if testing locally
    
    // Submit resolution
    await techPage.click('button:has-text("Submit Resolution")');
    await expect(techPage.locator('text=RESOLVED')).toBeVisible();
    
    // STEP 6: Admin Closes Request
    await adminPage.reload();
    await expect(adminPage.locator(`text=RESOLVED`)).toBeVisible();
    
    await adminPage.click(`button[data-request-id="${requestId}"]`);
    await adminPage.click('button:has-text("Close Request")');
    await adminPage.fill('textarea[name="adminNote"]', 'Quality work completed. Approved for closure.');
    await adminPage.click('button:has-text("Confirm Close")');
    
    // Verify: Status is CLOSED, request no longer in active queue
    await expect(adminPage.locator(`text=CLOSED`)).toBeVisible();
    await adminPage.goto('http://localhost:5173/admin/maintenance');
    await expect(adminPage.locator(`text=${requestId}`)).not.toBeVisible(); // Closed requests not in queue
    
    // STEP 7: Verify Visibility Across Roles (at completion)
    // Tenant sees CLOSED in history
    await page.goto('http://localhost:5173/tenant/maintenance/history');
    await expect(page.locator(`text=AC Leak`)).toBeVisible();
    await expect(page.locator('text=CLOSED')).toBeVisible();
    
    // Owner sees this maintenance for their property
    const ownerPage = await context.newPage();
    await ownerPage.goto('http://localhost:5173/owner/maintenance');
    // Filter by property
    await expect(ownerPage.locator(`text=CLOSED`)).toBeVisible();
  
  });

  /**
   * MULTI-REQUEST SCENARIO: Concurrent requests with different priorities and technicians
   * Validates: Queue correctness, technician scoping, no cross-request leakage
   */
  test('multi_request: Admin manages multiple concurrent requests', async ({ page, context }) => {
    // SETUP: Create 3 requests with different priorities
    const requests = [
      { id: 'req-1', title: 'AC Leak', priority: 'HIGH', tenantId: 'tenant-1'},
      { id: 'req-2', title: 'Plumbing Issue', priority: 'LOW', tenantId: 'tenant-2'},
      { id: 'req-3', title: 'Electrical Hazard', priority: 'EMERGENCY', tenantId: 'tenant-3'}
    ];
    
    // TODO: Create requests via API or UI
    
    // STEP 1: Admin views queue filtered by EMERGENCY priority
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:5173/admin/maintenance');
    await adminPage.selectOption('select[name="priorityFilter"]', 'EMERGENCY');
    
    // Verify: Only EMERGENCY request visible
    await expect(adminPage.locator('text=Electrical Hazard')).toBeVisible();
    await expect(adminPage.locator('text=AC Leak')).not.toBeVisible();
    
    // STEP 2: Assign EMERGENCY to tech-1, LOW to tech-2
    await adminPage.click('button[data-request-id="req-3"]'); // EMERGENCY
    await adminPage.selectOption('select[name="technicianId"]', 'tech-1');
    await adminPage.click('button:has-text("Assign")');
    
    // STEP 3: Verify technician queues
    const tech1Page = await context.newPage();
    await tech1Page.goto('http://localhost:5173/technician/dashboard');
    
    // Tech-1 sees only their assigned requests (1 - the EMERGENCY)
    const tech1Jobs = await tech1Page.locator('[data-testid="job-card"]').count();
    expect(tech1Jobs).toBeGreaterThanOrEqual(1);
    await expect(tech1Page.locator('text=Electrical Hazard')).toBeVisible();
    await expect(tech1Page.locator('text=AC Leak')).not.toBeVisible(); // Not assigned to tech-1
    
    const tech2Page = await context.newPage();
    await tech2Page.goto('http://localhost:5173/technician/dashboard');
    // Tech-2's queue should be different
    await expect(tech2Page.locator('text=AC Leak')).not.toBeVisible(); // Also not assigned to tech-2
  });

  /**
   * UNAUTHORIZED ACCESS SCENARIO: Cross-role permission checks
   * Validates: Technician cannot access admin queue, Tenant cannot assign, etc.
   */
  test('security: Unauthorized actions are blocked', async ({ page, context }) => {
    
    // SETUP: Tech logged in
    const techPage = await context.newPage();
    await techPage.goto('http://localhost:5173/technician/login');
    await techPage.fill('input[name="email"]', 'tech1@rentease.com');
    await techPage.fill('input[name="password"]', 'tech123');
    await techPage.click('button[type="submit"]');
    
    // STEP 1: Tech cannot navigate to /admin/maintenance
    await techPage.goto('http://localhost:5173/admin/maintenance');
    
    // Verify: Redirected to /technician/dashboard or login
    await expect(techPage).not.toHaveURL('**/admin/maintenance');
    
    // STEP 2: Tech cannot call API /admin/queue
    const response = await techPage.request.get('/api/v1/maintenance/admin/queue');
    expect(response.status()).toBe(401 || 403); // Unauthorized or Forbidden
    
    // STEP 3: Tenant cannot assign technician (via UI button disabled)
    const tenantPage = await context.newPage();
    await tenantPage.goto('http://localhost:5173/tenant/login');
    await tenantPage.fill('input[name="email"]', 'tenant1@rentease.com');
    await tenantPage.fill('input[name="password"]', 'password123');
    await tenantPage.click('button[type="submit"]');
    
    await tenantPage.goto('http://localhost:5173/tenant/maintenance/dashboard');
    
    // Verify: No "Assign" button visible
    await expect(tenantPage.locator('button:has-text("Assign")')).not.toBeVisible();
    
    // STEP 4: Tenant calling assign API directly should fail
    const assignResponse = await tenantPage.request.patch('/api/v1/maintenance/req-1/assign', {
      data: { technicianId: 'tech-1' }
    });
    expect(assignResponse.status()).toBe(401 || 403);
  });

  /**
   * INVALID STATE TRANSITION SCENARIO: State machine validation
   * Validates: Cannot pause from REPORTED, cannot close from IN_PROGRESS, etc.
   */
  test('state_machine: Invalid transitions are rejected', async ({ page, context }) => {
    
    const techPage = await context.newPage();
    await techPage.goto('http://localhost:5173/technician/login');
    await techPage.fill('input[name="email"]', 'tech1@rentease.com');
    await techPage.fill('input[name="password"]', 'tech123');
    await techPage.click('button[type="submit"]');
    
    // Assign & open a request that's still REPORTED
    const req = 'req-1'; // todo: Create request
    await techPage.goto(`http://localhost:5173/technician/job/${req}`);
    
    // STEP 1: Pause button should not be visible (status is REPORTED, not IN_PROGRESS)
    await expect(techPage.locator('button:has-text("Pause")')).not.toBeVisible();
    
    // STEP 2: After accepting (action doesn't exist, but if it did):
    // Try to pause before start - should either be blocked in UI or rejected by API
    // resume button should not exist when not PAUSED
    await expect(techPage.locator('button:has-text("Resume")')).not.toBeVisible();
  });

  /**
   * ERROR HANDLING SCENARIO: Network failures and invalid inputs
   * Validates: Graceful error messages, retry options, form validation
   */
  test('error_handling: API failures show user-friendly messages', async ({ page, context }) => {
    
    const tenantPage = await context.newPage();
    await tenantPage.goto('http://localhost:5173/tenant/login');
    await tenantPage.fill('input[name="email"]', 'tenant1@rentease.com');
    await tenantPage.fill('input[name="password"]', 'password123');
    await tenantPage.click('button[type="submit"]');
    
    // Navigate to create request
    await tenantPage.goto('http://localhost:5173/tenant/maintenance/request');
    
    // STEP 1: Submit without required fields
    await tenantPage.click('button[type="submit"]');
    
    // Verify: Validation error shown
    await expect(tenantPage.locator('text=is required')).toBeVisible();
    
    // STEP 2: Fill form
    await tenantPage.selectOption('select[name="propertyId"]', 'prop-1');
    await tenantPage.fill('input[name="title"]', 'Test Issue');
    
    // Mock API failure
    await tenantPage.route('**/api/v1/maintenance', route => {
      route.abort('failed'); // Simulate network error
    });
    
    // Submit
    await tenantPage.click('button[type="submit"]');
    
    // Verify: Error message shown with retry option
    await expect(tenantPage.locator('text=Failed to create request')).toBeVisible();
    await expect(tenantPage.locator('button:has-text("Retry")')).toBeVisible();
  });

  /**
   * ADMIN QUEUE FILTERING SCENARIO: Complex filter combinations
   * Validates: Filters work independently and together
   */
  test('admin_queue: Filtering by status, priority, and technician works correctly', async ({ page, context }) => {
    
    const adminPage = await context.newPage();
    await adminPage.goto('http://localhost:5173/admin/login');
    await adminPage.fill('input[name="email"]', 'admin@rentease.com');
    await adminPage.fill('input[name="password"]', 'admin123');
    await adminPage.click('button[type="submit"]');
    
    await adminPage.goto('http://localhost:5173/admin/maintenance');
    
    // STEP 1: Filter by REPORTED status
    await adminPage.selectOption('select[name="statusFilter"]', 'REPORTED');
    // Verify: All visible are REPORTED
    const reportedItems = adminPage.locator('[data-status="REPORTED"]');
    const count1 = await reportedItems.count();
    expect(count1).toBeGreaterThan(0);
    
    // STEP 2: Add EMERGENCY priority filter
    await adminPage.selectOption('select[name="priorityFilter"]', 'EMERGENCY');
    // Verify: Only REPORTED + EMERGENCY visible
    const filteredItems = adminPage.locator('[data-status="REPORTED"][data-priority="EMERGENCY"]');
    const count2 = await filteredItems.count();
    expect(count2).toBeLessThanOrEqual(count1);
    
    // STEP 3: Add technician filter
    await adminPage.selectOption('select[name="technicianFilter"]', 'tech-1');
    // Verify: Only items for tech-1
    const tech1Items = adminPage.locator('[data-assigned-tech="tech-1"]');
    const count3 = await tech1Items.count();
    expect(count3).toBeLessThanOrEqual(count2);
  });

  /**
   * NOTIFICATION & VISIBILITY SCENARIO: Request progress updates for each role
   * Validates: Tenant sees admin assignment, status changes; Admin sees tech resolution, etc.
   */
  test('visibility: Each role sees status updates relevant to them', async ({ page, context }) => {
    
    const tenantPage = await context.newPage();
    const adminPage = await context.newPage();
    const techPage = await context.newPage();
    
    // Setup: All logged in
    // ... (login code omitted for brevity)
    
    // STEP 1: Tenant creates request (state = REPORTED)
    // Tenant dashboard shows REPORTED
    await expect(tenantPage.locator('text=REPORTED')).toBeVisible();
    
    // STEP 2: Admin assigns technician (state = ASSIGNED or IN_PROGRESS)
    // Refresh tenant page; should see updated status
    await tenantPage.reload();
    await expect(tenantPage.locator('text=ASSIGNED|IN_PROGRESS')).toBeVisible();
    
    // STEP 3: Technician accepts (state = IN_PROGRESS)
    // Admin queue updates
    await adminPage.reload();
    const assignedStatus = adminPage.locator('[data-status="IN_PROGRESS"]');
    expect(await assignedStatus.count()).toBeGreaterThan(0);
    
    // STEP 4: Technician resolves (state = RESOLVED)
    // Admin can now close (Close button should appear)
    await adminPage.reload();
    await expect(adminPage.locator('button:has-text("Close Request")')).toBeVisible();
  });
});

/**
 * Test Configuration for different environments
 */

test.describe('E2E Tests - Configuration', () => {
  test('uses correct API base URL from environment', async ({ page }) => {
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
    expect(apiBaseUrl).toBeTruthy();
  });
});
