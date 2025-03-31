# Project Structure Guidelines

## File Patterns
- All project files

## Rules

1. Group files by feature within `/src` directory
2. Place reusable components under `src/components/`
3. Place API routes under `src/app/api/`
4. Organize server-specific logic under `src/server/` or `src/lib/server/`
5. Keep related files close together (e.g., components, hooks, and types for a feature)
6. Use consistent file naming:
   - Component files: PascalCase (e.g., `HabitCard.tsx`)
   - Utility files: camelCase (e.g., `useHabitStore.ts`)
7. Maintain a clear separation between client and server code
8. Keep configuration files in the root directory
9. Use appropriate file extensions:
   - `.tsx` for React components
   - `.ts` for TypeScript files
   - `.md` for documentation 