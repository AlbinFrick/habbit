# Project Coding Guidelines: Habit Tracker

This document outlines the coding standards, best practices, and common commands for the Next.js Habit Tracker application. Adhering to these guidelines will help maintain code quality, consistency, and maintainability.

## 0. Project Commands

*   `pnpm dev`: Start the development server.
*   `pnpm dev:https`: Start the development server with HTTPS.
*   `pnpm build`: Build the application for production.
*   `pnpm start`: Start the production server (requires a prior build).
*   `pnpm lint`: Run ESLint to check for code style and potential errors.
*   `pnpm lint:fix`: Run ESLint and automatically fix fixable issues.
*   `pnpm typecheck`: Run TypeScript type checking.
*   `pnpm check`: Run both linting and type checking.
*   `pnpm format:check`: Check code formatting using Prettier.
*   `pnpm format:write`: Automatically fix formatting issues using Prettier.
*   `pnpm db:generate`: Generate Drizzle migrations based on schema changes.
*   `pnpm db:push`: Push database schema changes (useful for development, use migrations for production).

## 1. General Principles

*   **Clean Code:** Strive for code that is readable, simple, and easy to understand. Follow principles like DRY (Don't Repeat Yourself), KISS (Keep It Simple, Stupid), and YAGNI (You Ain't Gonna Need It).
*   **Consistency:** Maintain consistency in naming, formatting, and architectural patterns throughout the codebase.
*   **Comments:** Write comments primarily to explain *why* something is done, not *what* it does (the code should be self-explanatory for the *what*). Complex logic or workarounds deserve clear comments.
*   **Modularity:** Break down complex logic into smaller, reusable functions or components.

## 2. Language, Formatting & Naming

*   **Language:** Use TypeScript for enhanced type safety and developer experience.
*   **Formatting:**
    *   Use Prettier for automatic code formatting, configured via `.prettierrc`.
    *   **Specifics:** 2-space indentation, no semicolons, single quotes, trailing commas.
    *   Use ESLint for code linting to catch potential errors and enforce style rules. Integrate ESLint with Prettier (`eslint-config-prettier`).
*   **Imports:**
    *   Organize imports: Standard library imports first, then third-party libraries, then internal modules/components using path aliases.
    *   Use absolute path aliases (`@/components/Button`) configured via `tsconfig.json`.
    *   **Use type imports** (`import type { MyType } from './types'`) whenever importing only types to improve build performance and clarity.
*   **Naming Conventions:**
    *   **Components:** PascalCase (e.g., `HabitList`, `AddHabitForm`).
    *   **Functions, Variables, Files:** camelCase (e.g., `fetchHabits`, `habitCount`, `useHabitStore.ts`).
*   **Types:**
    *   Employ strong typing throughout the application.
    *   Use **Zod** for runtime data validation (e.g., API inputs, form data) and infer TypeScript types from Zod schemas where possible.
    *   Export types directly from schema definition files when appropriate.

## 3. React & Next.js

*   **Functional Components:** **Always** use functional components with Hooks. Avoid class components.
*   **Component Naming:** Use PascalCase for component names (e.g., `HabitList`). File names should match the component name (e.g., `HabitList.tsx`).
*   **Props:**
    *   Use explicit TypeScript `interface` definitions for component props (e.g., `interface HabitListProps { ... }`).
    *   Destructure props in the function signature.
*   **Hooks:**
    *   Follow the Rules of Hooks.
    *   Create custom hooks (`use...`) to encapsulate reusable stateful logic or side effects.
*   **State Management:**
    *   Use standard React hooks (`useState`, `useReducer`, `useContext`) for local and moderately shared state.
    *   Use **Zustand** for managing global application state.
*   **File Structure:**
    *   Group files by feature within the `/src` directory (e.g., `src/features/habits/`).
    *   Place reusable components under `src/components/`.
    *   Place API routes (Route Handlers) under `src/app/api/`.
    *   Organize server-specific logic (like database interactions) potentially under `src/server/` or `src/lib/server/`.
*   **Next.js:**
    *   Leverage Server Components, Route Handlers, and built-in optimizations.
    *   Use Client Components (`'use client'`) only when necessary (hooks, event handlers).
    *   Use Route Handlers (`app/api/.../route.ts`) for backend API logic.

## 4. Styling (Tailwind CSS)

*   **Utility-First:** Embrace Tailwind's utility-first approach.
*   **Readability:** Group related utilities. Use `prettier-plugin-tailwindcss` to automatically sort classes.
*   **Component Abstraction:** Encapsulate Tailwind classes within reusable UI components.
*   **Theme Configuration:** Customize `tailwind.config.js` for project-specific design tokens.
*   **Avoid `@apply`:** Prefer component composition or direct utility usage. Use `@apply` sparingly.

## 5. Database (SQLite / Turso with Drizzle ORM)

*   **ORM:** Use Drizzle ORM for type-safe database interactions.
*   **Schema Management:** Define your schema using Drizzle schema files. Use Drizzle Kit (`pnpm db:generate`) to create SQL migration files. Apply migrations appropriately for development and production environments.
*   **Database Logic:** Keep database interaction logic separate from UI components, preferably in server-side code (Route Handlers, Server Actions, dedicated server modules).
*   **Query Safety:** **Always use a `where` clause** when performing database `update` or `delete` operations. This should be enforced by ESLint rules if possible (e.g., `eslint-plugin-drizzle`).
*   **Environment Variables:** Store database connection strings (especially for Turso) and secrets in environment variables (`.env.*`). Ensure sensitive files are in `.gitignore`.
*   **Connection Management:** Rely on the Drizzle client and underlying driver (e.g., `@libsql/client`) for connection management/pooling.

## 6. API Design

*   **RESTful Principles:** Follow RESTful principles for Route Handlers.
*   **Data Validation:** Use **Zod** to validate incoming data in API endpoints.
*   **Consistent Responses:** Return consistent JSON response structures and HTTP status codes.

## 7. Error Handling

*   **User Feedback:** Provide clear error feedback to the user.
*   **Logging:** Implement server-side logging, especially in production.
*   **Error Boundaries:** Use Next.js `error.tsx` files and React Error Boundaries where appropriate.
*   **Try/Catch:** Use `try...catch` blocks for operations that might fail (e.g., API calls, database queries), especially in server-side code.

## 8. Testing

*   **Unit Tests:** Use Vitest/Jest and React Testing Library for utility functions, hooks, and components.
*   **Integration Tests:** Test interactions between different parts of the application.
*   **E2E Tests:** Consider Playwright or Cypress for critical user flows.
*   **Focus:** Prioritize testing critical paths and complex logic.

---

Remember to configure linters (ESLint) and formatters (Prettier) to automatically enforce many of these rules. Regularly review and update these guidelines as the project evolves.
