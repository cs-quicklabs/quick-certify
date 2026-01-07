# Contributing to CrownStack Boilerplate

Thank you for your interest in contributing to CrownStack's Full-Stack Boilerplate! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Screenshots if applicable

### Suggesting Features

We love feature suggestions! Please create an issue with:

- A clear description of the feature
- Use cases and examples
- Why this feature would be useful

### Submitting Pull Requests

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Run tests and linting**

   ```bash
   npm run format:check
   npx nx lint backend
   npx nx lint frontend
   npx nx test backend
   npx nx test frontend
   ```

5. **Commit your changes**

   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commits:

   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code refactoring
   - `test:` for tests
   - `chore:` for maintenance

6. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Create a Pull Request**
   - Fill out the PR template
   - Link any related issues
   - Request review from maintainers

## 📋 Code Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Define interfaces for all data structures
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Formatting

- Use Prettier (configured in `.prettierrc`)
- Run `npm run format` before committing
- Follow EditorConfig settings

### NestJS (Backend)

- Follow SOLID principles
- Use dependency injection
- Keep services focused (Single Responsibility)
- Use DTOs for data validation
- Add Swagger decorators for API docs

### Next.js (Frontend)

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript for type safety
- Follow React best practices

## 🧪 Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

### Running Tests

```bash
# Backend tests
npx nx test backend

# Frontend tests
npx nx test frontend

# E2E tests
npx nx e2e backend-e2e
npx nx e2e frontend-e2e
```

## 📚 Documentation

- Update README.md if adding new features
- Add JSDoc comments for public APIs
- Update API documentation (Swagger)
- Keep examples up to date

## 🐛 Bug Fixes

When fixing bugs:

1. Add a test that reproduces the bug
2. Fix the bug
3. Ensure the test passes
4. Update documentation if needed

## ✨ New Features

When adding features:

1. Discuss in an issue first (for major features)
2. Follow existing patterns
3. Add comprehensive tests
4. Update documentation
5. Add examples if applicable

## 🔍 Code Review Process

1. All PRs require review
2. Address review comments promptly
3. Keep PRs focused and small when possible
4. Respond to feedback constructively

## 📝 Commit Messages

Use conventional commits:

```
feat: add user authentication endpoint
fix: resolve session expiration issue
docs: update API documentation
style: format code with Prettier
refactor: extract password service
test: add unit tests for auth service
chore: update dependencies
```

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/crownstack/boilerplate-nest-next.git
   cd boilerplate-nest-next
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment**

   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit .env with your configuration
   ```

4. **Run migrations**

   ```bash
   cd apps/backend
   npm run migration:run
   ```

5. **Start development**
   ```bash
   npx nx serve backend
   npx nx dev frontend
   ```

## 📞 Questions?

- Open an issue for questions
- Check existing issues and PRs
- Review the documentation

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Built with ❤️ by CrownStack**
