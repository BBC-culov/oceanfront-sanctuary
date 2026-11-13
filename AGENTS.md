# Architecture rules

- Route-level pages must be loaded with `React.lazy` so public mobile visits do not download booking, admin, and owner interfaces upfront.
- The startup loader may preload only the hero asset needed by the current route so it does not compete with the visible page for mobile bandwidth.- Admin page data/actions live in `src/hooks/useAdmin*.ts` and wizard step checks are pure functions in `src/lib/*Validation.ts`, so pages stay small and rules stay unit-testable.
- All on-screen notifications use `sonner` (errors via `toast.error`, styled red in `ui/sonner.tsx`); the legacy shadcn toaster is no longer mounted.
- Derive data-access contracts from generated table types; shared JSON/error adapters live in `src/lib/dataTypes.ts` and booking view contracts in `src/lib/bookingTypes.ts`, preserving runtime values and existing validation rules.
- Public apartment views and booking use only active database apartments; wait for the apartment query before redirecting so valid booking links survive cold loads.
- Admin manual-booking pricing rules (flat price, custom link amount) live in `src/lib/manualBookingPricing.ts`, mirrored verbatim in `supabase/functions/_shared/manual-booking-pricing.ts`; a test enforces both copies match so client preview and server charge never diverge.
- The Tax ID / VAT rule (`isValidFiscalCode` in `src/lib/bookingValidation.ts`) is mirrored in `supabase/functions/_shared/fiscal-code.ts`; a parity test keeps them equal so the admin wizard never passes a code the server rejects.
- The public showcase site is disabled via `PUBLIC_SITE_ENABLED` in `src/lib/siteMode.ts` (pages kept, not deleted); only paths in its allowlist stay reachable, so this project serves just the management dashboard.
