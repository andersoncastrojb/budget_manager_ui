# Budget Manager - Frontend UI

Professional, secure frontend application for personal financial management built with Next.js, TypeScript, Tailwind CSS, and React Query.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (preferably v20 LTS)
- npm or yarn
- A running instance of the Budget Manager backend (Java Spring Boot)

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd budget_manager_ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your backend API URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:3000`

## 📋 Features

### ✨ Core Features
- 📊 **Dashboard** - Financial overview with key metrics
- 🏦 **Account Management** - Create and manage multiple accounts
- 💰 **Income Tracking** - Record and track income sources
- 💳 **Expense Management** - Fixed and variable expenses
- 📋 **Loan Tracking** - Monitor and manage loans
- 📈 **Monthly Balance** - View financial trends over time

### 🔒 Security Features
- ✅ **HttpOnly Cookies** - Secure token storage (managed by backend)
- ✅ **CSRF Protection** - Automatic token handling
- ✅ **Input Validation** - Zod-powered client-side validation
- ✅ **XSS Prevention** - React's built-in HTML escaping
- ✅ **Error Boundaries** - Graceful error handling
- ✅ **Generic Error Messages** - No sensitive data leakage

## 🏗️ Project Structure

```
src/
├── domain/                          # Enterprise business logic
│   ├── entities/                    # Core domain interfaces
│   │   └── index.ts                # User, Account, Income, etc.
│   └── repositories/                # Data access contracts
│       └── index.ts
├── application/                     # Business logic layer
│   ├── hooks/                       # React Query hooks
│   │   └── useUserData.ts
│   ├── schemas/                     # Zod validation schemas
│   │   └── index.ts
│   └── context/                     # Context providers
│       └── QueryClientProvider.tsx
├── infrastructure/                  # External services
│   ├── api/                         # HTTP client with interceptors
│   │   └── apiClient.ts
│   └── mappers/                     # Error mapping
│       └── errorMapper.ts
├── presentation/                    # UI components and pages
│   ├── components/
│   │   ├── common/                  # Reusable UI components
│   │   ├── layout/                  # Application layout
│   │   └── dashboard/               # Dashboard components
│   └── [routes]/                    # Next.js App Router pages
├── shared/                          # Shared utilities
│   ├── utils/
│   │   └── formatters.ts            # Formatting utilities
│   └── constants/
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # Root layout with providers
│   ├── page.tsx                     # Root page (redirects to dashboard)
│   ├── dashboard/
│   │   └── page.tsx
│   └── globals.css                  # Global styles
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)

# Building
npm run build        # Create production build
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types

# Utilities
npm run format       # Format code with Prettier
```

## 🔧 Configuration

### Environment Variables
Create `.env.local` file (copy from `.env.example`):

```env
# Required
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# Optional
NEXT_PUBLIC_APP_ENV=development
```

**Security Note**: Never commit `.env.local` to version control. Use `.env.example` as a template for team members.

### TypeScript Configuration
- **Strict Mode**: ✅ Enabled
- **JSX**: React 18
- **Module Resolution**: Bundler
- **Paths**: `@/*` resolves to `./src/*`

## 🧪 Testing

Test setup uses:
- Jest for unit testing
- React Testing Library for component testing
- Mock React Query for data fetching

```bash
npm test                # Run tests
npm test -- --watch     # Run tests in watch mode
npm test -- --coverage  # Generate coverage report
```

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full sidebar + content layout
- **Tablet**: Collapsible sidebar with hamburger menu
- **Mobile**: Mobile-optimized navigation

## 🔐 Security Best Practices

### Authentication
- JWT tokens stored in **HttpOnly, Secure, SameSite** cookies (backend-managed)
- No sensitive data stored in localStorage or sessionStorage
- Automatic 401/403 redirect to login
- Cookie-based authentication (withCredentials: true)

### Input Validation
- All form inputs validated with Zod before API submission
- Type-safe validation with automatic error messages
- Protection against injection attacks

### Error Handling
- Global error boundary catches component errors
- API errors mapped to user-friendly messages
- No stack traces or backend details exposed
- Development mode shows detailed errors for debugging

### API Client Security
- Request/response transformers
- Automatic retry logic for transient failures
- CSRF token inclusion from cookies
- Request timeout (30s)

## 🚢 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Environment Setup
1. Set production backend URL:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
   ```

2. Enable security headers in Next.js configuration

3. Configure CORS on backend to match frontend domain

4. Enable HTTPS for all connections

### Deployment Platforms
- **Vercel** (recommended for Next.js)
- **AWS Amplify**
- **AWS EC2**
- **Docker**
- **DigitalOcean**
- **Self-hosted VPS**

## 📚 Key Technologies

| Technology | Purpose |
|-----------|---------|
| **Next.js 15+** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript (strict mode) |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Query** | Server state management & caching |
| **Zod** | Runtime schema validation |
| **Axios** | HTTP client with interceptors |
| **React Context** | Lightweight global UI state |

## 🐛 Troubleshooting

### Application won't start
```bash
# Clear Next.js cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### TypeScript errors
```bash
npm run type-check   # See all type errors
```

### API connection issues
1. Verify backend is running on correct port
2. Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
3. Verify CORS settings on backend
4. Check browser DevTools Network tab for requests

### Cookies not being sent
1. Ensure backend sets proper CORS headers
2. Verify `Access-Control-Allow-Credentials: true`
3. Check SameSite cookie settings
4. Ensure HTTPS in production

## 📖 Documentation

### Clean Architecture
This project follows **Clean Architecture** principles:
- **Domain Layer**: Enterprise logic, entities, interfaces (no dependencies)
- **Application Layer**: Business logic, use cases, hooks, schemas
- **Infrastructure Layer**: External services, API clients, implementations
- **Presentation Layer**: UI components, pages, user interfaces

### API Integration
See `infrastructure/api/apiClient.ts` for HTTP client configuration and interceptor setup.

### Component Development
Components in `presentation/components/` follow these patterns:
- Functional components with TypeScript
- Props interface explicitly defined
- Use custom hooks from `application/hooks/`
- Avoid business logic in components (use hooks instead)

## 🤝 Contributing

1. Follow the Clean Architecture pattern
2. Maintain TypeScript strict mode compliance
3. Write descriptive commit messages
4. Update documentation for new features
5. Test responsive design on multiple screen sizes

## 📄 License

See LICENSE file for details.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review `.github/copilot-instructions.md`
3. Check backend API documentation
4. Create an issue with detailed reproduction steps

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
