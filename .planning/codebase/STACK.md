# Technology Stack

**Analysis Date:** 2026-02-11

## Languages

**Primary:**
- TypeScript 5.x - All source files, configuration, and type definitions
- JSX/TSX - React component files

**Secondary:**
- JavaScript - Build and configuration scripts (ESM modules)
- CSS - Global styling and component styles

## Runtime

**Environment:**
- Node.js 22.14.0 (as of last check)

**Package Manager:**
- npm 10.x (inferred from package-lock.json v3)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with file-based routing and Server Components
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering for React

**Build/Dev:**
- TypeScript 5.x - Static type checking and transpilation
- ESLint 9.x - Code linting with Next.js and TypeScript support
- Prettier 3.8.1 - Code formatting
- Tailwind CSS 4.x - Utility-first CSS framework
- PostCSS 4 - CSS transformation tool (configured for Tailwind)

**Testing:**
- Vitest 4.0.18 - Fast unit test runner
- @vitest/ui 4.0.18 - Web UI for test results

## Key Dependencies

**Critical:**
- next 16.1.6 - Full-stack framework, handles routing, SSR, build optimization
- react 19.2.3 - Core UI rendering library
- react-dom 19.2.3 - DOM interaction for React

**Infrastructure:**
- @tailwindcss/postcss 4.x - Tailwind CSS PostCSS plugin
- tailwindcss 4.x - CSS utility framework
- @types/node 20.x - Node.js type definitions
- @types/react 19.x - React type definitions
- @types/react-dom 19.x - React DOM type definitions
- eslint-config-next 16.1.6 - ESLint configuration for Next.js projects

## Configuration

**Environment:**
- No .env files in use (can be added if needed)
- Configuration is managed via TypeScript files and package.json

**Build:**
- `tsconfig.json` - TypeScript compiler options with Next.js plugin
- `next.config.ts` - Next.js configuration (minimal, default settings)
- `vitest.config.ts` - Vitest test runner configuration
- `eslint.config.mjs` - ESLint flat config with Next.js core web vitals and TypeScript rules
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS

**Path Aliases:**
- `@/*` resolves to `./src/*` (defined in `tsconfig.json`)

## Platform Requirements

**Development:**
- Node.js 20.x or higher (package.json indicates support for ^20)
- npm 10.x or compatible package manager

**Production:**
- Deployment to Vercel (default Next.js platform) or Node.js-compatible hosting
- No specific environment variables required (can be optional if external services added)

---

*Stack analysis: 2026-02-11*
