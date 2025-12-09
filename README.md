<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Next.js Auth Boilerplate - README</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
          sans-serif;
        line-height: 1.6;
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem;
        color: #111;
      }
      h1,
      h2,
      h3 {
        line-height: 1.25;
      }
      pre {
        background: #f4f4f4;
        padding: 1rem;
        overflow-x: auto;
      }
      code {
        background: #f4f4f4;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
      }
      ul {
        margin-left: 1.5rem;
      }
      hr {
        margin: 3rem 0;
      }
    </style>
  </head>

  <body>
    <h1>Next.js Auth Boilerplate</h1>

    <p>
      A production-leaning Next.js boilerplate focused on
      <strong>authentication</strong>, <strong>API design</strong>,
      <strong>testing</strong>, and <strong>developer experience</strong>.
    </p>

    <p>
      This project is designed as a <strong>portfolio piece</strong> and a solid
      starting point for real-world apps. It demonstrates how to structure a
      modern frontend application with:
    </p>

    <ul>
      <li>Next.js App Router</li>
      <li>JWT-based authentication (access + refresh tokens)</li>
      <li>Protected routes & middleware</li>
      <li>Zod-validated environment variables & request payloads</li>
      <li>Vitest unit tests</li>
      <li>CI with GitHub Actions</li>
      <li>Tailwind CSS v4 theming and reusable UI components</li>
    </ul>

    <hr />

    <h2>Features</h2>

    <h3>Core Stack</h3>
    <ul>
      <li><strong>Framework:</strong> Next.js (App Router)</li>
      <li><strong>Language:</strong> TypeScript</li>
      <li><strong>Styling:</strong> Tailwind CSS v4</li>
      <li>
        <strong>UI helpers:</strong> CSS variables, utility <code>cn</code>
        helper, reusable components
      </li>
      <li><strong>Icons:</strong> lucide-react</li>
      <li><strong>Fonts:</strong> next/font (e.g. Geist)</li>
    </ul>

    <p>
      <em
        >This project uses <strong>Tailwind CSS v4</strong> with the modern
        <code>@tailwindcss/postcss</code> plugin. The configuration is kept
        simple and fully compatible with the current Next.js + Turbopack
        ecosystem.</em
      >
    </p>

    <h3>Authentication</h3>
    <ul>
      <li>Email + password authentication with <code>bcryptjs</code></li>
      <li>
        Access & refresh tokens using JSON Web Tokens
        (<code>jsonwebtoken</code>):
        <ul>
          <li>
            <code>access_token</code> and <code>refresh_token</code> stored in
            <strong>HttpOnly cookies</strong>
          </li>
          <li>
            Secure cookies in production
            (<code>secure: true</code> when <code>NODE_ENV=production</code>)
          </li>
        </ul>
      </li>
      <li>
        Route handlers under <code>src/app/api/auth/...</code>:
        <ul>
          <li><code>POST /api/auth/register</code></li>
          <li><code>POST /api/auth/login</code></li>
          <li><code>POST /api/auth/logout</code></li>
          <li><code>GET /api/auth/me</code></li>
          <li><code>POST /api/auth/forgot-password</code></li>
          <li><code>POST /api/auth/reset-password</code></li>
        </ul>
      </li>
      <li>
        Reusable <code>authService</code> with a
        <code>UserRepository</code> abstraction so storage can be swapped
        (in-memory → real DB)
      </li>
    </ul>

    <h3>Security & Robustness</h3>
    <ul>
      <li>
        <strong>Environment validation</strong> with Zod
        (<code>src/lib/env.ts</code>):
        <ul>
          <li><code>JWT_SECRET</code> and <code>JWT_REFRESH_SECRET</code></li>
          <li><code>NEXT_PUBLIC_APP_URL</code></li>
        </ul>
      </li>
      <li>
        Centralised <strong>error handling</strong>:
        <ul>
          <li><code>HttpError</code> and <code>toApiError</code></li>
          <li>
            <code>handleApiError</code> and <code>withApiRoute</code> to wrap
            Next.js route handlers consistently
          </li>
        </ul>
      </li>
      <li>
        Basic <strong>rate limiting</strong>:
        <ul>
          <li>
            <code>checkRateLimit</code> in
            <code>src/lib/rateLimiter.ts</code>
          </li>
          <li>Used on auth endpoints</li>
        </ul>
      </li>
    </ul>

    <p>
      <strong>Important:</strong> The rate limiter and
      <code>UserRepository</code> in this boilerplate are
      <strong>in-memory</strong> implementations. They are perfect for demos and
      local development, but not suitable for multi-instance production
      deployments without replacing them with a persistent store.
    </p>

    <h3>UI & Theming</h3>
    <ul>
      <li>Global layout with Navbar and Footer</li>
      <li>
        App-wide <strong>theme system</strong>:
        <ul>
          <li><code>useTheme</code> hook with Light/Dark/System modes</li>
          <li>Theme preference persisted in <code>localStorage</code></li>
          <li>
            Initial theme set <strong>before hydration</strong> to prevent
            flashes
          </li>
        </ul>
      </li>
      <li>Auth pages under <code>src/app/(auth)</code></li>
      <li>Protected <strong>dashboard</strong> route</li>
    </ul>

    <h3>Middleware & Route Protection</h3>
    <ul>
      <li>Auth redirects for logged-in and logged-out users</li>
      <li>
        Supports tokens via cookies or
        <code>Authorization: Bearer</code> header
      </li>
    </ul>

    <h3>Testing & CI</h3>
    <ul>
      <li>Vitest for unit testing</li>
      <li>GitHub Actions CI pipeline</li>
      <li>Node.js 20 on ubuntu-latest</li>
    </ul>

    <hr />

    <h2>Tech Stack</h2>
    <ul>
      <li>Node.js 20+</li>
      <li>Next.js (App Router)</li>
      <li>TypeScript</li>
      <li>Tailwind CSS v4</li>
      <li>Zod</li>
      <li>JWT + bcryptjs</li>
      <li>Vitest</li>
      <li>ESLint, Prettier</li>
    </ul>

    <hr />

    <h2>Getting Started</h2>

    <h3>1. Install Dependencies</h3>
    <pre><code>npm install</code></pre>

    <h3>2. Environment Variables</h3>
    <pre><code>NODE_ENV=development
JWT_SECRET=your-dev-jwt-secret
JWT_REFRESH_SECRET=your-dev-refresh-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
EMAIL_API_KEY=</code></pre>

    <h3>3. Run the Dev Server</h3>
    <pre><code>npm run dev</code></pre>

    <hr />

    <h2>Production Notes</h2>
    <ul>
      <li>Swap in a real database</li>
      <li>Replace email provider</li>
      <li>Replace in-memory rate limiter</li>
      <li>Add RBAC and admin routes</li>
    </ul>

    <hr />

    <h2>License</h2>
    <p>Free for personal and commercial use.</p>
  </body>
</html>