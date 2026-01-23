import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Core Modules: Organization & Users', () => {
  let accessToken: string;
  let registeredUserEmail: string;

  const timestamp = Date.now();
  const adminData = {
    firstName: 'Super',
    lastName: 'Admin',
    email: `admin.core.${timestamp}@example.com`,
    companyName: `Core Org ${timestamp}`,
    websiteUrl: 'https://core-org.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  test.beforeAll(async ({ request }) => {
    // Register a new Super Admin to create an organization
    const response = await request.post('/api/v1/auth/register', {
      data: adminData,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    accessToken = body.data.accessToken;
    registeredUserEmail = adminData.email;
  });

  test('Organization: Get Current Settings', async ({ request }) => {
    const response = await request.get('/api/v1/organizations/current', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe(adminData.companyName);
  });

  test('Organization: Update General Info', async ({ request }) => {
    const newName = `${adminData.companyName} Updated`;
    const response = await request.patch('/api/v1/organizations/settings/general', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: newName,
        description: 'Updated description for testing',
        support_email: `support.${timestamp}@example.com`,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.name).toBe(newName);
  });

  test('Users: List All Users', async ({ request }) => {
    const response = await request.get('/api/v1/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: 10, page: 1 },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data.data)).toBeTruthy();

    // Should contain the registered admin
    const adminUser = body.data.data.find((u: any) => u.email === registeredUserEmail);
    expect(adminUser).toBeDefined();
  });

  test('Users: Create New User (Invitation)', async ({ request }) => {
    // First get Roles to find a role ID (e.g., Admin or generic)
    const rolesResponse = await request.get('/api/v1/roles', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const rolesBody = await rolesResponse.json();

    // Assuming rolesBody.data.data contains the roles array based on pagination structure
    const roleId = rolesBody.data.data[0].id;

    const newUser = {
      firstName: 'Invited',
      lastName: 'User',
      email: `invited.${timestamp}@example.com`,
      roleId: roleId,
      organizationId: 'ignored-backend-sets-this', // Backend overrides this usually
    };

    const response = await request.post('/api/v1/users', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: newUser,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data.email).toBe(newUser.email);
    expect(body.data.status).toBe('invited');
  });

  test('Profile: Get Current Profile', async ({ request }) => {
    const response = await request.get('/api/v1/profile/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.email).toBe(adminData.email);
    expect(body.data.firstName).toBe(adminData.firstName);
  });

  test('Profile: Update Profile', async ({ request }) => {
    const newFirstName = 'UpdatedName';
    const response = await request.patch('/api/v1/profile/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        firstName: newFirstName,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.firstName).toBe('Updatedname');
  });

  test('Profile: Update Email Preferences', async ({ request }) => {
    const response = await request.patch('/api/v1/profile/email-preferences', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        emailNotifications: false,
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.data.emailNotifications).toBe(false);
  });

  test('Roles: List All Roles', async ({ request }) => {
    const response = await request.get('/api/v1/roles', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.data.data)).toBeTruthy();
    expect(body.data.data.length).toBeGreaterThan(0);
  });
});
