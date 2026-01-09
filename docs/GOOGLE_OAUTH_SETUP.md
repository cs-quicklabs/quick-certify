# Google OAuth Setup & Testing Guide

This guide covers the complete Google OAuth implementation in Quick Certify, supporting both **ID Token Flow** (for SPAs) and **Authorization Code Flow** (server-side).

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Google OAuth Flows                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FLOW 1: ID Token (Recommended for SPAs)                                    │
│  ────────────────────────────────────────                                   │
│  1. Frontend shows Google Sign-In button                                    │
│  2. User authenticates with Google                                          │
│  3. Frontend receives ID token                                              │
│  4. Frontend sends ID token to: POST /api/v1/auth/google/login              │
│  5. Backend verifies token using google-auth-library                        │
│  6. Backend returns JWT tokens                                              │
│                                                                              │
│  FLOW 2: Authorization Code (Server-side)                                   │
│  ─────────────────────────────────────────                                  │
│  1. Frontend redirects to: GET /api/v1/auth/google/redirect                 │
│  2. Backend redirects to Google with state parameter (CSRF protection)      │
│  3. User authenticates with Google                                          │
│  4. Google redirects to: GET /api/v1/auth/google/callback                   │
│  5. Backend exchanges code for tokens                                       │
│  6. Backend redirects to frontend with JWT tokens                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Prerequisites

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Library**
4. Enable **Google Identity Services API**

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure OAuth consent screen if prompted:
   - User Type: **External**
   - App name: **Quick Certify**
   - Scopes: `email`, `profile`, `openid`
   - Test users: Add your test emails

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Quick Certify**
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     http://localhost:3001
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3001/api/v1/auth/google/callback
     ```
5. Copy **Client ID** and **Client Secret**

### 3. Backend Environment Variables

Add to `apps/backend/.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/v1/auth/google/callback
```

---

## API Endpoints

### Check Google OAuth Status

```http
GET /api/v1/auth/google/status
```

**Response:**
```json
{
  "success": true,
  "message": "Google OAuth status",
  "data": {
    "configured": true
  }
}
```

---

### Flow 1: ID Token Flow (SPA/Mobile)

#### Login with Google ID Token

```http
POST /api/v1/auth/google/login
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "accessTokenExpiresAt": "2024-01-01T12:15:00.000Z",
    "refreshTokenExpiresAt": "2024-01-08T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Invalid token, account not found, or account deactivated

#### Complete Google Signup

```http
POST /api/v1/auth/google/signup/complete
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "companyName": "Acme Corporation",
  "websiteUrl": "https://acme.com"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Google signup completed successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "accessTokenExpiresAt": "...",
    "refreshTokenExpiresAt": "..."
  }
}
```

---

### Flow 2: Authorization Code Flow (Server-side)

#### Initiate OAuth Flow (JSON Response)

```http
POST /api/v1/auth/google/init
Content-Type: application/json

{
  "action": "login",
  "redirectUrl": "https://app.example.com/dashboard"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Google OAuth URL generated",
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "state": "abc123xyz"
  }
}
```

#### Direct Redirect to Google

```http
GET /api/v1/auth/google/redirect?action=login&redirectUrl=https://app.example.com/dashboard
```

**Response:** 302 Redirect to Google

#### OAuth Callback (GET - Browser Redirect)

```http
GET /api/v1/auth/google/callback?code=4/0AY0e-g...&state=abc123xyz
```

**Response:** 302 Redirect to frontend with tokens or error

Redirect patterns:
- Success: `{frontendDomain}?accessToken=...&refreshToken=...&expiresAt=...`
- Signup needed: `{frontendDomain}/signup/complete?tempToken=...`
- Error: `{frontendDomain}/auth/error?error=...`

#### OAuth Callback (POST - API Clients)

```http
POST /api/v1/auth/google/callback
Content-Type: application/json

{
  "code": "4/0AY0e-g...",
  "state": "abc123xyz"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "action": "login",
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

Or for new users needing signup:
```json
{
  "success": true,
  "message": "Additional information required",
  "data": {
    "action": "signup",
    "tempToken": "temp_abc123xyz",
    "requiresSignup": true
  }
}
```

#### Complete Signup with Temp Token

```http
POST /api/v1/auth/google/signup/complete
Content-Type: application/json

{
  "tempToken": "temp_abc123xyz",
  "companyName": "Acme Corporation",
  "websiteUrl": "https://acme.com"
}
```

---

## Frontend Integration

### React with @react-oauth/google (ID Token Flow)

```bash
npm install @react-oauth/google
```

```tsx
// App.tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <YourApp />
    </GoogleOAuthProvider>
  );
}
```

```tsx
// GoogleLoginButton.tsx
import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      setLoading(true);
      try {
        // Exchange Google access token for ID token
        // Or use credential response from oneTap
        const res = await fetch('/api/v1/auth/google/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: response.access_token }),
        });

        const data = await res.json();
        if (data.success) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Login failed:', error);
      } finally {
        setLoading(false);
      }
    },
    flow: 'implicit',
  });

  return (
    <button onClick={() => login()} disabled={loading}>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
```

### React with Authorization Code Flow

```tsx
// GoogleLoginButton.tsx
export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    // Redirect to backend which will redirect to Google
    window.location.href = '/api/v1/auth/google/redirect?action=login';
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
}

// AuthCallback.tsx - Handle callback redirect
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function AuthCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const tempToken = searchParams.get('tempToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      window.location.href = '/dashboard';
    } else if (tempToken) {
      // Redirect to complete signup
      window.location.href = `/signup/complete?tempToken=${tempToken}`;
    }
  }, [searchParams]);

  return <div>Processing authentication...</div>;
}
```

---

## Testing

### cURL Examples

#### Check OAuth Status
```bash
curl http://localhost:3001/api/v1/auth/google/status
```

#### Get Auth URL
```bash
curl -X POST http://localhost:3001/api/v1/auth/google/init \
  -H "Content-Type: application/json" \
  -d '{"action": "login"}'
```

#### Login with ID Token
```bash
curl -X POST http://localhost:3001/api/v1/auth/google/login \
  -H "Content-Type: application/json" \
  -d '{"idToken": "YOUR_GOOGLE_ID_TOKEN"}'
```

#### Complete Signup
```bash
curl -X POST http://localhost:3001/api/v1/auth/google/signup/complete \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_GOOGLE_ID_TOKEN",
    "companyName": "Test Company",
    "websiteUrl": "https://test.com"
  }'
```

### Getting Google ID Token for Testing

1. **Google OAuth Playground:**
   - Go to [OAuth Playground](https://developers.google.com/oauthplayground/)
   - Select scopes: `email`, `profile`, `openid`
   - Click "Authorize APIs"
   - Exchange for tokens
   - Copy the `id_token`

2. **Browser Console (after Google Sign-In):**
   ```javascript
   // Using Google Sign-In JavaScript library
   const idToken = google.accounts.id.getAuthResponse().credential;
   console.log(idToken);
   ```

---

## Security Features

### 1. CSRF Protection (State Parameter)

The Authorization Code flow uses state parameter:
- Generated using nanoid for randomness
- Stored server-side with timestamp
- Expires after 10 minutes
- One-time use (deleted after validation)

### 2. Token Verification

Using `google-auth-library` for proper ID token verification:
- Verifies signature
- Validates audience (client ID)
- Checks token expiry
- Ensures email is verified

### 3. Account Linking

Handles mixed auth providers:
- Email user → Google login: Links accounts, sets `auth_provider: 'both'`
- Google user → Email login: Blocked with appropriate error
- Stores `google_id` for identity verification

---

## Error Handling

| Error | HTTP Code | Cause |
|-------|-----------|-------|
| Google OAuth is not configured | 401 | Missing `GOOGLE_CLIENT_ID` |
| Invalid Google ID token | 401 | Token expired, malformed, or wrong audience |
| No account found | 401 | User doesn't exist (for login) |
| Account deactivated | 401 | User status is `archived` |
| Account not active | 401 | User status is `inactive` or `invited` |
| Invalid state parameter | 401 | CSRF protection triggered |
| Organization exists | 409 | Duplicate organization name |

---

## Production Checklist

- [ ] Use HTTPS for all URLs
- [ ] Update authorized origins/redirects in Google Console
- [ ] Move state storage to Redis for scalability
- [ ] Move temp token storage to Redis
- [ ] Set appropriate token expiry times
- [ ] Enable logging for OAuth events
- [ ] Set up monitoring for auth failures
- [ ] Review and restrict OAuth scopes
- [ ] Implement rate limiting on auth endpoints

