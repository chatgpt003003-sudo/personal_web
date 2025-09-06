# Testing Guide

This project uses Jest and React Testing Library for testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI (no watch, with coverage)
npm run test:ci
```

## Test Structure

- **Unit Tests**: Located in `src/**/__tests__/` directories
- **Component Tests**: Test React components with user interactions
- **API Tests**: Test API endpoints with mock data
- **Utility Tests**: Test helper functions and utilities

## Test Files

- `src/components/__tests__/ProjectCard.test.tsx` - ProjectCard component tests
- `src/components/__tests__/VideoPlayer.test.tsx` - VideoPlayer component tests
- `src/lib/__tests__/prisma.test.ts` - Prisma client tests
- `src/lib/__tests__/s3.test.ts` - S3 utilities tests
- `src/app/api/__tests__/projects.test.ts` - Projects API endpoint tests

## Writing Tests

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### API Tests

```typescript
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

describe('/api/example', () => {
  it('handles GET requests', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });
});
```

## Coverage Requirements

- **Minimum Coverage**: 70% for all metrics
- **Lines**: 70%
- **Functions**: 70%
- **Branches**: 70%
- **Statements**: 70%

## Mocking

The project includes mocks for:
- Next.js components (`next/image`, `next/navigation`)
- NextAuth (`next-auth/react`)
- Framer Motion (`framer-motion`)
- AWS SDK (`@aws-sdk/client-s3`)
- Prisma Client (`@prisma/client`)

## CI/CD Integration

Tests run automatically on:
- Every pull request
- Pushes to `main` and `develop` branches
- Node.js versions 18.x and 20.x

## Debugging Tests

```bash
# Run a specific test file
npm test ProjectCard.test.tsx

# Run tests matching a pattern
npm test --testNamePattern="renders"

# Debug with verbose output
npm test --verbose
```