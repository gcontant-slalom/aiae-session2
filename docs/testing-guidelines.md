# Testing Guidelines

This document defines the testing principles and conventions for the TODO application.

## Testing Principles

1. All new features must include appropriate automated tests.
2. Tests must be maintainable, readable, and aligned with the behavior they verify.
3. Tests must be isolated and independent. Each test must set up its own data and must not rely on state created by another test.
4. Setup and teardown hooks are required where appropriate so tests can succeed across repeated local and CI runs.
5. Focus on high-value coverage for user-facing behavior, core business logic, and integration boundaries.

## Unit Tests

1. Use Jest to test individual functions and React components in isolation.
2. Unit tests must use the naming convention `*.test.js` or `*.test.ts`.
3. Backend unit tests must be placed in `packages/backend/__tests__/`.
4. Frontend unit tests must be placed in `packages/frontend/src/__tests__/`.
5. Unit test files should be named to match what they are testing, such as `app.test.js` for `app.js`.
6. Unit tests should avoid unnecessary network, filesystem, or database dependencies unless they are explicitly mocked.

## Integration Tests

1. Use Jest + Supertest to test backend API endpoints with real HTTP requests.
2. Integration tests must be placed in `packages/backend/__tests__/integration/`.
3. Integration tests must use the naming convention `*.test.js` or `*.test.ts`.
4. Integration test files should be named based on the behavior or API surface they cover, such as `todos-api.test.js`.
5. Integration tests should validate status codes, response bodies, error behavior, and important persistence or validation rules.

## End-To-End Tests

1. Use Playwright to test complete UI workflows through browser automation.
2. E2E tests must be placed in `tests/e2e/`.
3. E2E tests must use the naming convention `*.spec.js` or `*.spec.ts`.
4. E2E test files should be named based on the user journey they cover, such as `todo-workflow.spec.js`.
5. Playwright tests must use one browser only.
6. Playwright tests must use the Page Object Model (POM) pattern for maintainability.
7. Limit E2E coverage to 5-8 critical user journeys, with emphasis on happy paths and key edge cases rather than exhaustive UI coverage.
8. E2E tests must remain independent and must not assume execution order.

## Port Configuration

1. Always use environment variables with sensible defaults for port configuration.
2. The backend must use the following pattern:

```js
const PORT = process.env.PORT || 3030;
```

3. The frontend defaults to port `3000`, but the port must remain overridable through the `PORT` environment variable.
4. Port configuration must support CI/CD workflows that dynamically assign ports at runtime.

## Quality Expectations

1. Tests should cover both expected behavior and meaningful failure cases.
2. Assertions should be specific enough to catch regressions without being brittle.
3. Test setup should be minimal and easy to understand.
4. Mocks and fixtures should be reused when they improve clarity, but they should not hide important behavior.
5. Avoid redundant tests that exercise the same behavior at multiple layers unless the coverage serves a clear purpose.

## TODO App Coverage Expectations

1. Unit tests should cover task creation validation, task editing behavior, sorting rules, filtering rules, and search behavior.
2. Integration tests should cover the main TODO API endpoints and the expected success and error responses.
3. E2E tests should cover the most important user workflows, including creating a task, editing a task, completing a task, filtering tasks, and clearing completed tasks.