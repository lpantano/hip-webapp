# Claude Code Rules for Evidence Decoded

This document contains guidelines and rules for Claude Code when working on the Evidence Decoded project.

## Project Overview

Evidence Decoded is a React-based web application built with:
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: shadcn/ui components + Tailwind CSS
- **Backend**: Supabase (authentication, database, storage)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation

you SHOULD use gh installed here: /Users/lop354/.local/bin/gh
you SHOULD use npm installed here: /Users/lop354/.local/bin/npm
you SHOULD use node installed here: /Users/lop354/.nvm/versions/node/v22.11.0/bin/node

## Code Style and Conventions

### TypeScript

- Don't use `any` ever
- Use TypeScript for all new files (`.tsx` for components, `.ts` for utilities)
- The project has relaxed TypeScript settings:
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedLocals: false`
  - `noUnusedParameters: false`
- While strict typing is not enforced, still prefer explicit types where it improves code clarity
- Use the `@/*` path alias for imports (e.g., `import { Button } from "@/components/ui/button"`)

### React Components

- Prefer functional components with hooks
- Use named exports for page components
- Keep components focused and single-purpose
- Place UI components in `src/components/ui/`
- Place feature-specific components in appropriate subdirectories (e.g., `src/components/auth/`, `src/components/forms/`)

### File Organization

```
src/
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── forms/          # Form components
│   ├── landing/        # Landing page sections
│   ├── layout/         # Layout components (Header, Footer)
│   └── ...             # Other feature-specific components
├── pages/              # Page components (routes)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # Type definitions
├── constants/          # Constants and configuration
└── integrations/       # Third-party integrations (Supabase)
    └── supabase/
```

### Styling

- Use Tailwind CSS utility classes for styling
- Use modern styles
- Keep seamless UI designs
- Follow shadcn/ui patterns for component styling
- Use the `cn()` utility from `@/lib/utils` for conditional classes
- Responsive design is important - ensure mobile-friendly implementations
- The project uses a dark mode theme system via `next-themes`

### Forms

- Use React Hook Form for form management
- Use Zod for schema validation
- Leverage shadcn/ui form components from `src/components/ui/form.tsx`
- Example pattern:
  ```typescript
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {...}
  })
  ```

### State Management

- Use TanStack Query for server state (API calls, data fetching)
- Use React hooks (useState, useReducer) for local component state
- Avoid prop drilling - use context when needed

## Supabase Integration

### Authentication

- The project uses Supabase Auth with:
  - Email/password authentication
  - Google OAuth integration
  - Role-based access control
- Authentication utilities are in `src/integrations/supabase/`
- Always handle authentication errors gracefully

### Database

- Use Supabase client from `src/integrations/supabase/client.ts`
- Types are auto-generated in `src/integrations/supabase/types.ts`
- Follow existing query patterns using TanStack Query

### Migrations

- Database migrations are in `supabase/migrations/`
- Always create migrations for schema changes
- See README.md "Managing Database Migrations" section for workflow
- Use descriptive migration names: `npx supabase migration new "description"`

## Development Workflow

### Making Changes

1. Read existing code before modifying
2. Maintain consistency with existing patterns
3. Don't over-engineer - keep solutions simple
4. Avoid adding unnecessary features or refactoring beyond the requested change
5. Use best practices rules
6. Have security as priority
7. Modularize code into functions when needed

### Testing Changes

- Tell user to run `npm run dev` to test locally
- Verify linting with `npm run lint`
- Test on mobile viewports (the app should be mobile-friendly)

### Git Workflow

- Main branch: `main`
- Development branch: `devel`
- Create feature branches from `devel`
- Make sure there is an issue associated to this change
  - read docs/NEW_ISSUES.md for examples
  - issues are always tag to milestones
  - be concise
- Follow conventional commit messages and be concise
- When creating commits, include:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

## Component Guidelines

### shadcn/ui Components

- Never modify components in `src/components/ui/` directly unless specifically requested
- These are managed components - additions should use `npx shadcn@latest add <component>`
- For customizations, create wrapper components or use composition

### Custom Components

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types for props
- Handle loading and error states appropriately

### Accessibility

- Ensure proper ARIA labels
- Support keyboard navigation
- Use semantic HTML
- Test with screen readers when possible

## Security Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Validate all user input with Zod schemas
- Sanitize data before rendering
- Follow OWASP top 10 guidelines:
  - Prevent XSS attacks
  - Prevent SQL injection (use Supabase's parameterized queries)
  - Prevent command injection
  - Implement proper authentication/authorization

## Performance Considerations

- Use React.lazy() for code splitting on routes
- Optimize images (the project includes optimized avatar components)
- Minimize bundle size - avoid unnecessary dependencies
- Use TanStack Query caching effectively
- Implement proper loading states to improve perceived performance

## Common Patterns in This Project

### Data Fetching

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .eq('id', id)
    if (error) throw error
    return data
  }
})
```

### Toast Notifications

```typescript
import { toast } from "sonner"

toast.success("Success message")
toast.error("Error message")
```

### Protected Routes

- Check user authentication status using Supabase auth hooks
- Redirect to `/auth` for unauthenticated users
- Check user roles for protected admin/expert routes

## Things to Avoid

- Don't add comments to code you didn't change
- Don't add type annotations where type inference works
- Don't add error handling for scenarios that can't happen
- Don't create abstractions for one-time operations
- Don't add backwards-compatibility hacks
- Don't add feature flags unless explicitly requested
- Don't modify `.env` files or commit them
- Don't push to main/master without confirmation
- Don't skip git hooks unless explicitly requested

## Project-Specific Features

### Progressive Web App (PWA)

- The project supports PWA installation
- PWA components are in `src/components/ui/PWA*`
- Handle offline states appropriately

### Role-Based Access

- The app has role-based features (admin, expert, researcher, user)
- Use `useUserRole` hook for role checks
- Respect role permissions in UI and API calls

## Resources

- [Project URL](https://lovable.dev/projects/ce017a26-619d-424c-9f9d-57352e8d9493)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Router Documentation](https://reactrouter.com/)

## Questions or Issues?

- Check the README.md for detailed setup and deployment instructions
- Review existing code patterns before implementing new features
- When in doubt, ask the user for clarification rather than making assumptions
