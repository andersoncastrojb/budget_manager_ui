# Budget Manager UI - Development Guidelines

## Project Overview
Budget Manager is a professional, secure frontend application for personal financial management built with:
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript (Strict Mode enabled)
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Validation**: Zod
- **Security**: HttpOnly cookies, CSRF protection, input validation

## Architecture

### Clean Architecture Layers
```
src/
├── domain/              # Enterprise logic and types (no dependencies)
│   ├── entities/        # Core domain interfaces (User, Account, Income, etc.)
│   └── repositories/    # Repository contracts (data access interfaces)
├── application/         # Business logic and orchestration
│   ├── hooks/          # Custom React hooks for data fetching
│   ├── schemas/        # Zod validation schemas
│   └── context/        # Context providers and state management
├── infrastructure/      # External services and implementations
│   ├── api/            # HTTP client with interceptors
│   └── mappers/        # Error mapping and data transformation
├── presentation/        # UI components and pages
│   ├── components/     # React components (common, layout, dashboard)
│   └── [routes]/       # App Router pages
└── shared/             # Utilities and constants
    ├── utils/          # Helper functions
    └── constants/      # Application constants
```

## Security Best Practices (Implemented)

### Authentication & Session Management
- ✅ JWT tokens stored in HttpOnly, Secure, SameSite cookies (backend-managed)
- ✅ Automatic cookie inclusion via `withCredentials: true`
- ✅ 401/403 responses trigger automatic redirect to login
- ✅ No sensitive data in localStorage or sessionStorage

### Input Validation
- ✅ Zod schemas validate all form inputs before API submission
- ✅ Type-safe validation with automatic error messages
- ✅ Prevents injection attacks at the client level

### XSS Prevention
- ✅ React's default HTML escaping maintained
- ✅ No `dangerouslySetInnerHTML` usage
- ✅ Content Security Policy headers configured

### CSRF Protection
- ✅ Automatic CSRF token inclusion from cookies
- ✅ SameSite cookie configuration enforced
- ✅ Secure same-site token validation

### Error Handling
- ✅ Global error boundary catches component errors
- ✅ API errors mapped to generic user-friendly messages
- ✅ No stack traces or sensitive data exposed to UI
- ✅ Development mode shows detailed errors for debugging

### Environment Variables
- ✅ `NEXT_PUBLIC_*` prefix used only for public variables
- ✅ API base URL configurable via `NEXT_PUBLIC_API_BASE_URL`
- ✅ `.env.local` never committed to version control

## Development Workflow

### Setup
```bash
npm install
# Create .env.local from .env.example
# Update NEXT_PUBLIC_API_BASE_URL to match your backend
```

### Development Server
```bash
npm run dev
# Application runs on http://localhost:3000
```

### Building
```bash
npm run build
npm run start
```

### Type Checking
```bash
npm run check-types  # or tsc --noEmit
```

### Linting
```bash
npm run lint
```

## Key Files & Their Purposes

### Infrastructure Layer
- `infrastructure/api/apiClient.ts` - Axios client with security interceptors
- `infrastructure/mappers/errorMapper.ts` - Error standardization

### Application Layer
- `application/hooks/useUserData.ts` - React Query hooks for data fetching
- `application/schemas/index.ts` - Zod validation schemas
- `application/context/QueryClientProvider.tsx` - React Query setup

### Presentation Layer
- `presentation/components/layout/Layout.tsx` - Main application layout with sidebar
- `presentation/components/dashboard/Dashboard.tsx` - Main dashboard page
- `presentation/components/common/` - Reusable UI components

### Domain Layer
- `domain/entities/index.ts` - Core business models
- `domain/repositories/index.ts` - Data access contracts

## Code Standards

### TypeScript
- Strict mode enabled: no implicit `any`
- Proper type annotations on all functions
- Use discriminated unions for type safety
- Avoid `as` keyword; use type guards instead

### Components
- Functional components only (no class components)
- Custom hooks extracted to `application/hooks/`
- Props interface defined explicitly
- React.forwardRef for ref support when needed

### Styling
- Tailwind utility classes only (no custom CSS)
- Mobile-first responsive design
- Consistent spacing (4px grid)
- Color palette: blues for primary, grays for neutral

### Error Handling
- Always catch Promise rejections
- Use try/catch in async functions
- Log errors in development mode only
- Display generic messages to users

### No Cross-Layer Imports
- ❌ Presentation cannot import from domain/application directly for UI
- ✅ Presentation uses hooks from application layer
- ✅ Application imports from domain layer
- ✅ Infrastructure never imported at layer boundaries, only through application

## Adding New Features

### Adding an API Endpoint
1. Define entity in `domain/entities/`
2. Define repository interface in `domain/repositories/`
3. Create Zod schema in `application/schemas/`
4. Create React Query hook in `application/hooks/`
5. Build UI components in `presentation/components/`
6. Wire up to page route in `src/app/`

### Adding a Page
1. Create page directory in `src/app/[feature]/`
2. Create `page.tsx` with metadata
3. Wrap with Layout component
4. Build feature components in `presentation/components/[feature]/`
5. Use custom hooks for data fetching

## Testing Considerations

When testing components:
- Mock React Query using `@testing-library/react`
- Mock API responses in test setup
- Test error states and loading states
- Verify form validation with Zod schemas
- Test accessibility (ARIA labels, keyboard navigation)

## Performance

- React Query caches are configured with appropriate stale times
- Components use `React.memo()` for expensive renders if needed
- Images optimized with Next.js Image component
- Code splitting happens automatically with App Router

## Deployment

### Environment Variables for Production
- Set `NEXT_PUBLIC_API_BASE_URL` to production backend URL
- Enable security headers in `next.config.js`
- Set `NEXT_PUBLIC_APP_ENV=production`
- Disable development error details

### Security Checklist
- [ ] All environment variables configured
- [ ] API base URL points to production backend
- [ ] CORS properly configured on backend
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] No console logs in production code
- [ ] Error tracking service configured (Sentry, etc.)

## Troubleshooting

### API calls always 401
- Check backend is running on configured URL
- Verify CORS settings on backend
- Ensure cookies are being sent (check browser DevTools Network tab)
- Clear cookies and re-login

### TypeScript errors
- Run `npm run type-check` to see all errors
- Never use `any` - use proper types
- Use `unknown` as fallback, then type guard

### Build fails
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for circular imports

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zod Validation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

