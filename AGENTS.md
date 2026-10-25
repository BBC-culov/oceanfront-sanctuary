# Architecture rules

- Route-level pages must be loaded with `React.lazy` so public mobile visits do not download booking, admin, and owner interfaces upfront.
- The startup loader may preload only the hero asset needed by the current route so it does not compete with the visible page for mobile bandwidth.- Admin page data/actions live in `src/hooks/useAdmin*.ts` and wizard step checks are pure functions in `src/lib/*Validation.ts`, so pages stay small and rules stay unit-testable.
- All on-screen notifications use `sonner` (errors via `toast.error`, styled red in `ui/sonner.tsx`); the legacy shadcn toaster is no longer mounted.
- Derive data-access contracts from generated table types and keep JSON array adapters and unknown-error narrowing in `src/lib/dataTypes.ts` to avoid untyped API boundaries without changing runtime rules.
