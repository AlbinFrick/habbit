# CLAUDE.md - Habbit Project Guidelines

## Commands

- `pnpm dev` - Start development server
- `pnpm dev:https` - Start development server with HTTPS
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm check` - Run both lint and typecheck
- `pnpm format:check` - Check formatting
- `pnpm format:write` - Fix formatting issues
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:push` - Push DB schema changes

## Code Style

- **Imports**: Use type imports (`import type { X } from 'y'`). Path aliases with `@/`.
- **Formatting**: 2-space indent, no semicolons, single quotes, trailing commas.
- **Types**: Strong typing with Zod for validation. Export types from schema files.
- **Components**: React functional components with explicit Props interfaces.
- **State Management**: Use Zustand for global state, React hooks for local state.
- **DB Queries**: Always use `where` clause with updates/deletes (enforced by eslint).
- **Error Handling**: Use proper error boundaries and try/catch where appropriate.
- **File Structure**: Group by feature in `/components`, API routes in `/server/api/routers`.
- **Naming**: PascalCase for components, camelCase for functions/variables/files.

