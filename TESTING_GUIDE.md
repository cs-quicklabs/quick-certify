# Quick Certify Automation Testing Guide

This guide provides instructions on how to run the automated end-to-end (E2E) tests for Quick Certify, specifically focusing on executing tests in a visible browser for debugging and demonstration purposes.

## Prerequisites

Ensure the following servers are running in separate terminal windows:

1.  **Backend Server**:
    ```bash
    npx nx serve backend
    ```
    (Runs on `http://localhost:3001`)

2.  **Frontend Server**:
    ```bash
    npx nx run frontend:dev
    ```
    (Runs on `http://localhost:3000`)

---

## Running Frontend E2E Tests (Visible Browser)

To watch the tests execution in a browser window:

### Option 1: Headed Mode (Fast & Visible)
Runs tests in a Playwright browser window.

```bash
cd apps/frontend-e2e
npx playwright test --headed
```

### Option 2: UI Mode (Interactive Debugging)
Opens the Playwright UI runner, allowing you to explore tests, view traces, and time-travel debug.

```bash
cd apps/frontend-e2e
npx playwright test --ui
```

### Running Specific Tests
To run only the Onboarding tests (Login/Signup):

```bash
cd apps/frontend-e2e
npx playwright test src/onboarding.spec.ts --headed
```

---

## Running Backend E2E Tests (API)

Backend tests are API-only and do not open a browser, but you can see the detailed output.

```bash
npx nx e2e backend-e2e
```

To run with full visible trace in UI mode (for debugging API calls):

```bash
cd apps/backend-e2e
npx playwright test --ui
```

## Troubleshooting

-   **"Terminal too small" / TTY errors**: If running via `nx` commands fails with TTY errors, run the `playwright` command directly from the project directory as shown above (`cd apps/frontend-e2e && npx playwright test ...`).
-   **Timeout**: If tests timeout, ensure both Backend and Frontend servers are fully running before starting tests.
