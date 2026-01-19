import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.describe.configure({ mode: 'serial' });
    const timestamp = Date.now();
    const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test.user.${timestamp}@example.com`,
        companyName: `Test Corp ${timestamp}`,
        websiteUrl: 'https://testcorp.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
    };

    test('should register a new user successfully', async ({ request }) => {
        const response = await request.post('/api/v1/auth/register', {
            data: userData,
        });

        if (response.status() !== 201) {
            console.log('Register failed:', await response.json());
        }

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.data).toHaveProperty('accessToken');
        expect(body.data).toHaveProperty('refreshToken');
    });

    test('should not register with duplicate email', async ({ request }) => {
        // Attempt duplicate registration
        const response = await request.post('/api/v1/auth/register', {
            data: userData,
        });

        if (response.status() !== 409) {
            console.log('Duplicate Register status:', response.status());
            try { console.log('Duplicate Register body:', await response.json()); } catch { }
        }
        expect(response.status()).toBe(409);
    });

    test('should login successfully', async ({ request }) => {
        const response = await request.post('/api/v1/auth/login', {
            data: {
                email: userData.email,
                password: userData.password,
            },
        });

        if (response.status() !== 200) {
            console.log('Login failed status:', response.status());
            try { console.log('Login failed body:', await response.json()); } catch { }
        }

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data).toHaveProperty('accessToken');
        expect(body.data).toHaveProperty('refreshToken');
    });

    test('should not login with invalid password', async ({ request }) => {
        const response = await request.post('/api/v1/auth/login', {
            data: {
                email: userData.email,
                password: 'WrongPassword123!',
            },
        });

        expect(response.status()).toBe(401);
    });

    test('should request password reset', async ({ request }) => {
        const response = await request.post('/api/v1/auth/forgot-password', {
            data: {
                email: userData.email,
            },
        });

        expect(response.status()).toBe(200);
    });
});
