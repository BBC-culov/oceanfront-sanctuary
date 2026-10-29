# Architecture rules

- Route-level pages must be loaded with `React.lazy` so public mobile visits do not download booking, admin, and owner interfaces upfront.
- The startup loader may preload only the hero asset needed by the current route so it does not compete with the visible page for mobile bandwidth.- Admin page data/actions live in `src/hooks/useAdmin*.ts` and wizard step checks are pure functions in `src/lib/*Validation.ts`, so pages stay small and rules stay unit-testable.
- All on-screen notifications use `sonner` (errors via `toast.error`, styled red in `ui/sonner.tsx`); the legacy shadcn toaster is no longer mounted.
- Derive data-access contracts from generated table types; shared JSON/error adapters live in `src/lib/dataTypes.ts` and booking view contracts in `src/lib/bookingTypes.ts`, preserving runtime values and existing validation rules.
- Public apartment views and booking use only active database apartments; wait for the apartment query before redirecting so valid booking links survive cold loads.
