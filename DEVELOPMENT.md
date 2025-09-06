# Development Workflow Guide

## Getting Started

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd personal_web
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Commands

### Core Development
```bash
npm run dev          # Start development server with turbopack
npm run build        # Build for production
npm start            # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted correctly
```

### Testing
```bash
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ci      # Run tests for CI (no watch)
```

### Database
```bash
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev # Run migrations
npx prisma generate  # Generate Prisma client
npx prisma db seed   # Seed database
```

## Git Workflow

### Branch Naming Convention
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

### Commit Process
1. Make your changes
2. Stage files: `git add .`
3. Commit will automatically:
   - Run `lint-staged` (ESLint + Prettier on staged files)
   - Run tests with `npm run test:ci`
   - Only commit if all checks pass

### Pull Request Workflow
1. Create feature branch from `main`
2. Make changes and test locally
3. Push branch and create PR
4. CI pipeline will run:
   - Tests on Node 18.x and 20.x
   - Linting and formatting checks
   - Security audit
   - Build verification

## Pre-commit Hooks

The project uses Husky for git hooks:
- **pre-commit**: Runs `lint-staged` and tests
- **pre-push**: Runs full test suite

To skip hooks (emergency only):
```bash
git commit --no-verify -m "emergency commit"
```

## Code Style Guidelines

### TypeScript
- Use strict TypeScript configuration
- Avoid `any` types - use proper typing
- Use interfaces for object shapes
- Prefer `const` over `let` where possible

### React
- Use functional components with hooks
- Prefer composition over inheritance
- Use proper TypeScript types for props
- Follow Next.js conventions for file organization

### Testing
- Write tests for all new features
- Aim for 70%+ code coverage
- Use descriptive test names
- Mock external dependencies

## Project Structure

```
├── src/
│   ├── app/                 # Next.js 14 app directory
│   │   ├── api/            # API routes
│   │   ├── admin/          # Admin pages
│   │   └── (auth)/         # Auth pages
│   ├── components/         # React components
│   ├── lib/               # Utility functions
│   ├── types/             # TypeScript definitions
│   └── __tests__/         # Global tests
├── prisma/                # Database schema & migrations
├── public/               # Static assets
├── .github/              # GitHub Actions workflows
└── docs/                 # Documentation
```

## Environment Variables

### Required for Development
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### AWS Integration (Optional)
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket
```

### OpenAI (For Chatbot)
```env
OPENAI_API_KEY=your-openai-key
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   npx prisma migrate reset
   npx prisma generate
   ```

2. **Node Modules Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Test Failures**
   ```bash
   npm run test:coverage
   # Check coverage report in coverage/lcov-report/index.html
   ```

4. **Build Failures**
   ```bash
   npm run lint:fix
   npm run format
   npm run build
   ```

## Production Deployment

### AWS Infrastructure
- **Database**: PostgreSQL RDS with pgvector extension
- **Storage**: S3 bucket for media files
- **Hosting**: EC2 or Vercel for Next.js app
- **CDN**: CloudFront for static assets

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates configured
- [ ] Security headers implemented
- [ ] Performance monitoring set up
- [ ] Backup strategy implemented

## Support

For questions or issues:
1. Check existing documentation
2. Search GitHub issues
3. Create new issue with detailed description
4. Tag appropriate team members