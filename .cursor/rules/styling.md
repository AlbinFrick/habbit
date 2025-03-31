# Tailwind CSS v4.0 Styling Guidelines

## File Patterns
- `*.tsx`
- `*.css`
- `tailwind.config.js`

## Rules

1. Embrace Tailwind's utility-first approach with v4.0's enhanced performance
2. Group related utilities for better readability
3. Use `prettier-plugin-tailwindcss` for automatic class sorting
4. Encapsulate Tailwind classes within reusable UI components
5. Avoid using `@apply` - prefer component composition or direct utility usage
6. Use consistent spacing and color values from the theme configuration
7. Follow responsive design best practices with Tailwind's breakpoint utilities
8. Use semantic class names when creating custom components
9. Leverage new v4.0 features:
   - Use container queries with `@container` and `@min-*`/`@max-*` variants
   - Take advantage of the new P3 color palette for more vivid colors
   - Use dynamic utility values for spacing and colors
   - Utilize new 3D transform utilities (`rotate-x-*`, `rotate-y-*`, etc.)
   - Implement gradient utilities with color interpolation modifiers
   - Use the new `@starting-style` for enter/exit transitions
   - Leverage the `not-*` variant for negative conditions
10. Follow modern CSS best practices:
    - Use cascade layers for better style organization
    - Implement logical properties for RTL support
    - Utilize `color-mix()` for opacity adjustments
    - Take advantage of registered custom properties 