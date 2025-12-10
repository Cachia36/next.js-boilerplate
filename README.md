 Next.js Auth Boilerplate

Next.js Auth Boilerplate
========================

A production-leaning **Next.js authentication boilerplate** built with:

*   Next.js (App Router)
*   TypeScript
*   JWT-based auth (access + refresh tokens)
*   Tailwind CSS (v4)
*   Vitest for testing
*   GitHub Actions for CI

This project is designed as a **portfolio piece** and a solid starting point for real-world apps that need authentication, clean architecture, and good developer experience.

* * *

✨ Features
----------

### Core stack

*   **Framework:** Next.js (App Router, app/ directory)
*   **Language:** TypeScript (strict mode)
*   **Styling:** Tailwind CSS v4 with a small design system
*   **Icons:** lucide-react / react-icons

### Authentication

*   Email + password authentication
*   JWT access tokens (short-lived) and refresh tokens (longer-lived)
*   HttpOnly cookies for better security
*   Central authService with clear separation of concerns
*   In-memory UserRepository behind a repository interface, easy to swap to a real DB
*   Rate limiting on login / forgot password endpoints
*   Password reset flow with reset token + expiry

### API & backend

*   API routes under src/app/api
*   Centralised error handling via withApiRoute
*   Health check endpoint (/api/health)
*   Zod-based request validation (authSchemas)

### Frontend & UX

*   Public landing page with feature overview
*   Auth pages: /login, /register, /forgot-password, /reset-password
*   Protected dashboard (/dashboard) and admin section (/admin)
*   Layout components: PageShell, Section, PageHeader
*   Light/dark mode toggle stored in localStorage
*   Reusable UI primitives like Button

### DX & Quality

*   ESLint with Next.js + TypeScript presets
*   Prettier with Tailwind plugin
*   Vitest for services and API route tests
*   Env validation with Zod (env.ts)
*   GitHub Actions workflow for CI

* * *

🗂 Project Structure
--------------------

src/
  app/
    (auth)/
    admin/
    api/
    dashboard/
    about/
    layout.tsx
    page.tsx
    error.tsx
    not-found.tsx
    globals.css

  components/
  hooks/
  lib/
    auth/
    email/
    validation/
  types/

middleware.ts

* * *

🔐 Authentication Flow (High-Level)
-----------------------------------

1.  **Register**
    *   POST /api/auth/register
    *   Validates with Zod
    *   Creates user via UserRepository
    *   Issues and sets JWT cookies
2.  **Login**
    *   POST /api/auth/login
    *   Rate limited
    *   Rotates tokens on success
3.  **Protected pages**
    *   middleware.ts checks access token
    *   Redirects based on auth state
4.  **Refresh token**
    *   POST /api/auth/refresh
    *   Issues new access token
5.  **Forgot / reset password**
    *   POST /api/auth/forgot-password creates token
    *   POST /api/auth/reset-password updates password

* * *

🚀 Getting Started
------------------

### Prerequisites

*   Node.js 20+
*   npm or equivalent

### 1\. Clone the repo

git clone <your-repo-url> next-auth-boilerplate
cd next-auth-boilerplate

### 2\. Install dependencies

npm install

### 3\. Configure environment variables

Create a `.env.local` file:

NODE\_ENV=development
JWT\_SECRET=your-super-secret-key
JWT\_REFRESH\_SECRET=your-refresh-secret-key
NEXT\_PUBLIC\_APP\_URL=http://localhost:3000
EMAIL\_API\_KEY=your-email-api-key

### 4\. Run the dev server

npm run dev

### 5\. Run tests

npm test

### 6\. Lint & format

npm run lint
npm run format

* * *

🧱 Swapping the In-Memory Repo for a Real DB
--------------------------------------------

The active repository is wired in `src/lib/auth/currentRepo.ts`. Replace it with your real database implementation by:

1.  Creating a new repository that implements UserRepository.
2.  Swapping the import in currentRepo.ts.

* * *

🧪 Testing
----------

Tests cover:

*   Auth services
*   JWT + password helpers
*   Env parsing
*   Rate limiter
*   API routes

npm test

* * *

🧰 Tooling
----------

*   ESLint with Next.js + TS
*   Prettier with Tailwind plugin
*   Vitest
*   GitHub Actions CI

* * *

📝 Notes & Next Steps
---------------------

*   Plug in a real DB
*   Add a real email provider
*   Implement full RBAC
*   Add full integration tests

* * *

📄 License
----------

This project is intended as a portfolio / boilerplate project. Choose the license that best fits your needs (MIT is recommended).