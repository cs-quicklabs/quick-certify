import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Feature Modules: Skills, Events, Files', () => {
  let accessToken: string;
  let eventTypeId: string;
  let eventLevelId: string;
  let eventFormatId: string;

  const timestamp = Date.now();
  const adminData = {
    firstName: 'Feature',
    lastName: 'Admin',
    email: `admin.features.${timestamp}@example.com`,
    companyName: `Feature Org ${timestamp}`,
    websiteUrl: 'https://feature-org.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/v1/auth/register', {
      data: adminData,
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    accessToken = body.data.accessToken;
  });

  test('Skills: Create and List', async ({ request }) => {
    const skillName = `Skill ${timestamp}`;
    const createResponse = await request.post('/api/v1/skills', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: skillName },
    });
    expect(createResponse.status()).toBe(201);
    const createBody = await createResponse.json();
    expect(createBody.data.name).toBe(skillName);

    const listResponse = await request.get('/api/v1/skills', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    // Pagination data check
    const skill = listBody.data.data.find((s: any) => s.name === skillName);
    expect(skill).toBeDefined();
  });

  test('Events: Create Dependencies (Type, Level, Format)', async ({ request }) => {
    // Create Event Type
    const typeResp = await request.post('/api/v1/event-types', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: `Type ${timestamp}` },
    });
    expect(typeResp.status()).toBe(201);
    eventTypeId = (await typeResp.json()).data.id;

    // Create Event Level
    const levelResp = await request.post('/api/v1/event-levels', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: `Level ${timestamp}` },
    });
    expect(levelResp.status()).toBe(201);
    eventLevelId = (await levelResp.json()).data.id;

    // Create Event Format
    const formatResp = await request.post('/api/v1/event-formats', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: `Format ${timestamp}` },
    });
    expect(formatResp.status()).toBe(201);
    eventFormatId = (await formatResp.json()).data.id;
  });

  test('Events: Create and List Event', async ({ request }) => {
    const eventName = `Event ${timestamp}`;
    const response = await request.post('/api/v1/events', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: eventName,
        eventTypeId,
        eventLevelId,
        eventFormatId,
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data.name).toBe(eventName);

    const listResponse = await request.get('/api/v1/events', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(listResponse.status()).toBe(200);
    const listBody = await listResponse.json();
    const event = listBody.data.data.find((e: any) => e.name === eventName);
    expect(event).toBeDefined();
  });

  test('Files: Upload Avatar', async ({ request }) => {
    // Create a dummy image buffer
    const buffer = Buffer.from('fake-image-content');

    const response = await request.post('/api/v1/files?category=avatar', {
      headers: { Authorization: `Bearer ${accessToken}` },
      multipart: {
        file: {
          name: 'avatar.png',
          mimeType: 'image/png',
          buffer: buffer,
        },
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.data).toHaveProperty('url');
    expect(body.data.url).toContain('avatar');
  });
});
