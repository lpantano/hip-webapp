<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- Initial constitution creation for Evidence Decoded project
- Principles extracted from CLAUDE.md
- Templates status:
  ✅ plan-template.md - reviewed, aligned with constitution check concept
  ✅ spec-template.md - reviewed, aligned with requirements structure
  ✅ tasks-template.md - reviewed, aligned with testing and implementation discipline
  ⚠ commands/*.md - deferred (located in .claude/commands/, not .specify/templates/commands/)
- No outstanding TODOs
-->

# Evidence Decoded Constitution

## Core Principles

### I. Code Quality & Type Safety

All code MUST use TypeScript with strict type discipline. The `any` type is explicitly forbidden in all new code and modifications. While the project's TypeScript configuration has relaxed settings (`noImplicitAny: false`, `strictNullChecks: false`), developers MUST still provide explicit types where it improves code clarity and maintainability.

**Rationale**: Type safety prevents runtime errors, improves IDE support, enables confident refactoring, and serves as living documentation. Avoiding `any` ensures the type system actually protects the codebase.

### II. Simplicity First

Keep solutions simple and focused. Do NOT over-engineer, add unnecessary features, refactor beyond the requested change, or create abstractions for one-time operations. Components MUST be small, focused, and single-purpose. Follow YAGNI (You Aren't Gonna Need It) principles strictly.

**Rationale**: Simple code is maintainable code. Premature optimization and abstraction create technical debt. Every line of code is a liability. Features and complexity must be justified by actual requirements, not hypothetical future needs.

### III. Security as Priority

Security MUST be treated as a first-class concern, not an afterthought. All implementations MUST follow OWASP top 10 guidelines:
- Prevent XSS attacks through proper sanitization
- Prevent SQL injection using Supabase's parameterized queries
- Prevent command injection through input validation
- Implement proper authentication/authorization checks
- Never commit secrets, API keys, or sensitive data
- Validate all user input with Zod schemas
- Sanitize data before rendering

**Rationale**: Security vulnerabilities can compromise user data, application integrity, and business reputation. Proactive security practices are far less costly than reactive incident response.

### IV. Component Architecture

React components MUST be functional components using hooks. Use named exports for page components. Components MUST be placed in the correct directories:
- `src/components/ui/` for shadcn/ui components (NEVER modify directly unless explicitly requested)
- `src/components/auth/` for authentication components
- `src/components/forms/` for form components
- `src/components/layout/` for layout components (Header, Footer)
- Feature-specific subdirectories for other components

**Rationale**: Consistent structure enables developers to quickly locate code, understand component responsibilities, and maintain separation of concerns. The shadcn/ui pattern ensures UI consistency and upgrade safety.

### V. Modern Styling Standards

Use Tailwind CSS utility classes for all styling. Follow shadcn/ui patterns for component styling. Responsive design is mandatory - all implementations MUST be mobile-friendly. Use the `cn()` utility from `@/lib/utils` for conditional classes. Support dark mode via `next-themes`.

**Rationale**: Utility-first CSS eliminates style conflicts, reduces bundle size, and accelerates development. Mobile-first design ensures accessibility across devices. Consistent patterns through shadcn/ui maintain visual cohesion.

### VI. State Management Discipline

Use the right tool for each state type:
- **Server State**: TanStack Query (React Query) for API calls and data fetching
- **Local State**: React hooks (useState, useReducer) for component state
- **Shared State**: React Context when prop drilling becomes problematic

Do NOT introduce additional state management libraries without explicit justification.

**Rationale**: Different state types have different concerns. Server state needs caching and synchronization. Local state needs simplicity. Over-centralized state creates coupling and complexity.

### VII. Form Validation Pattern

Forms MUST use React Hook Form for form management and Zod for schema validation. Leverage shadcn/ui form components from `src/components/ui/form.tsx`. Follow the established pattern:

```typescript
const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema),
  defaultValues: {...}
})
```

**Rationale**: Declarative validation schemas are readable and reusable. React Hook Form provides excellent performance and developer experience. Zod's type inference creates a single source of truth for validation and types.

## Supabase Integration Requirements

### Authentication Standards

Authentication MUST use Supabase Auth with the configured providers (email/password, Google OAuth). Authentication utilities in `src/integrations/supabase/` MUST be used consistently. All authentication errors MUST be handled gracefully. Role-based access control MUST be respected in both UI and API calls using the `useUserRole` hook.

**Rationale**: Centralized authentication utilities ensure consistent behavior and error handling across the application. Role-based access prevents unauthorized actions.

### Database Access Patterns

All database operations MUST use the Supabase client from `src/integrations/supabase/client.ts`. Auto-generated types in `src/integrations/supabase/types.ts` MUST be used for type safety. Follow existing query patterns using TanStack Query for consistency.

**Rationale**: Centralized database access ensures consistent error handling, logging, and type safety. Auto-generated types prevent type drift between database schema and application code.

### Migration Discipline

All database schema changes MUST be created as migrations in `supabase/migrations/`. Use descriptive migration names following the pattern: `npx supabase migration new "description"`. Refer to README.md "Managing Database Migrations" section for the complete workflow.

**Rationale**: Migrations provide version control for database schema, enable rollbacks, and ensure consistency across environments. Descriptive names make migration history readable.

## Development Workflow Standards

### Code Reading Before Modification

Developers MUST read existing code before making any modifications. This is non-negotiable. Changes MUST maintain consistency with existing patterns.

**Rationale**: Understanding before modifying prevents breaking existing functionality, maintains architectural consistency, and respects previous engineering decisions.

### Testing Requirements

Changes MUST be tested locally using `npm run dev` and verified for lint compliance using `npm run lint`. All changes MUST be tested on mobile viewports to ensure mobile-friendliness.

**Rationale**: Local testing catches issues before deployment. Lint compliance maintains code quality. Mobile testing ensures feature parity across devices.

### Git Workflow Standards

- **Main branch**: `main` (production-ready code)
- **Development branch**: `devel` (integration branch)
- **Feature branches**: Created from `devel`
- **Issue tracking**: Every change MUST have an associated issue (see `docs/NEW_ISSUES.md`)
- **Commit messages**: Follow conventional commit format, be concise
- **Attribution**: Include Claude Code attribution in commits:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

**Rationale**: Structured branching enables safe parallel development. Issue tracking maintains traceability. Conventional commits enable automated changelog generation. Attribution provides transparency about AI-assisted development.

## Accessibility Requirements

All implementations MUST include:
- Proper ARIA labels for screen readers
- Full keyboard navigation support
- Semantic HTML elements
- Color contrast compliance
- Focus management

**Rationale**: Accessibility is not optional. Applications must be usable by people with diverse abilities. Semantic HTML improves SEO and maintainability.

## Performance Standards

Implementations MUST follow these performance practices:
- Use `React.lazy()` for code splitting on routes
- Optimize images (use optimized avatar components)
- Minimize bundle size by avoiding unnecessary dependencies
- Use TanStack Query caching effectively
- Implement proper loading states to improve perceived performance

**Rationale**: Performance directly impacts user experience, conversion rates, and SEO. Perceived performance (through loading states) is as important as actual performance.

## Forbidden Practices

The following practices are EXPLICITLY FORBIDDEN:
- Adding comments to code you didn't change
- Adding type annotations where type inference works
- Adding error handling for scenarios that can't happen
- Creating abstractions for one-time operations
- Adding backwards-compatibility hacks
- Adding feature flags unless explicitly requested
- Modifying or committing `.env` files
- Pushing to main/master without confirmation
- Skipping git hooks unless explicitly requested
- Using emojis in code unless explicitly requested
- Modifying `src/components/ui/` components directly (use `npx shadcn@latest add <component>` instead)

**Rationale**: These practices add noise, complexity, or risk without corresponding value. Code should be clean, focused, and safe.

## Governance

This constitution supersedes all other development practices and conventions. All code reviews, pull requests, and implementation plans MUST verify compliance with these principles.

When complexity violates simplicity principles, explicit justification MUST be provided demonstrating why simpler alternatives are insufficient for the specific requirements.

Amendments to this constitution require:
1. Documentation of the rationale for the amendment
2. Approval from project maintainers
3. Migration plan for existing code affected by the change
4. Update of all dependent templates and guidance documents

The project-specific guidance in `CLAUDE.md` provides additional context and examples but does not supersede this constitution. In cases of conflict, this constitution takes precedence.

**Version**: 1.0.0 | **Ratified**: 2026-02-04 | **Last Amended**: 2026-02-04
