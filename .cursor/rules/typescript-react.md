# TypeScript and React Guidelines

## File Patterns
- `*.tsx`
- `*.ts`

## Rules

1. Always use functional components with Hooks
2. Use TypeScript for enhanced type safety
3. Follow these naming conventions:
   - Components: PascalCase (e.g., `HabitList`, `AddHabitForm`)
   - Functions/Variables: camelCase (e.g., `fetchHabits`, `habitCount`)
4. Use explicit TypeScript interfaces for component props
5. Destructure props in function signatures
6. Use type imports (`import type { MyType } from './types'`) for type-only imports
7. Organize imports in this order:
   - Standard library imports
   - Third-party libraries
   - Internal modules/components using path aliases
8. Use absolute path aliases (`@/components/Button`)
9. Use Client Components (`'use client'`) only when necessary (hooks, event handlers) 