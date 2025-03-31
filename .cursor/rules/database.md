# Database and Drizzle ORM Guidelines

## File Patterns
- `src/server/db/*`
- `src/lib/server/db/*`
- `drizzle.config.ts`
- `*.sql`

## Rules

1. Use Drizzle ORM for type-safe database interactions
2. Define schema using Drizzle schema files
3. Use Drizzle Kit for migration management
4. Always include `where` clauses in update/delete operations
5. Keep database interaction logic separate from UI components
6. Use environment variables for database connection strings
7. Implement proper error handling for database operations
8. Use transactions for operations that require multiple queries
9. Follow SQLite/Turso best practices for performance 