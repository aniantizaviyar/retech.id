# Attendance control-plane integration

Server-to-server integration only. No employee, identity, contact, biometric, photo, or attendance records are transferred. Existing website UI, authentication, POS routes, and build configuration are unchanged.

## Deployment boundary

This patch is based on the previously deployed main revision. The live baseline does not provision POS memberships from generic tenant CRUD; that behavior is preserved. A product-aware POS helper and synthetic tests are included for future POS development, but generic production tenant routes do not call that helper. Attendance membership creation remains exclusively in the verified Laravel onboarding flow.

The separate local POS/UI development work is intentionally excluded from this deployment.

## Configuration

Set `RETENDANCE_CONTROL_HMAC_KEY` to the same dedicated random server-only secret on both services (at least 64 characters), and set `RETENDANCE_CONTROL_KEY_ID` consistently. Keep `RETENDANCE_CONTROL_ENABLED=false` until coordinated activation. Never expose these values with `NEXT_PUBLIC_*`, commit them, or reuse a Supabase/Vercel account credential as the connector key.

Apply `supabase/migrations/20261015_attendance_single_open_subscription.sql` before activation. It prevents concurrent creation of multiple non-cancelled attendance subscriptions; duplicate existing data must be reconciled manually instead of deleted automatically.

Bind registry UUID to an existing Laravel tenant UUID through the admin-session-protected `/api/admin/saas/attendance/bind` endpoint. The connector never creates accounts or memberships from contact email and never remaps an already-bound tenant to a different UUID.

The Laravel backend pulls `/api/integrations/attendance/snapshot`. Request and response HMACs include raw-body SHA-256, timestamp, and nonce; callers must reject unsigned responses and redirects. Two registry reads detect edits during snapshot construction. Laravel applies generation-checked snapshots under its tenant row lock. This is reconciliation, not a cross-database transaction.

## Product contract

Free: 10 employees, one location, one configurable shift, one manager, no leave feature. Pro: IDR 12,500 per purchased employee slot per month. Business: IDR 20,000 per slot per month. Operational feature limits are enforced by Laravel's canonical catalog. Browser entitlement overrides are discarded.

Only monthly contracts are accepted. Trial remains an isolated seven-day dummy company, not a paid subscription on real customer data. Payment provider settlement, automatic charges, and purchases are not implemented here. Legacy tenants are protected from billing/plan/status changes and must not be recreated.

Suspension/cancellation preserves records. Package reductions must fit active usage and pending invitations; pending multi-level leave approvals can prevent downgrade. Runtime freshness/status enforcement is performed by Laravel; connectivity loss does not silently grant paid access.

## Tests

```sh
node --loader ./tests/helpers/server-only-loader.mjs --import tsx --test tests/attendance-control.test.ts tests/attendance-provisioning.test.ts tests/attendance-snapshot-api.test.ts
npx tsc --noEmit
npm run vercel-build
```

The server-only loader is a test-only alias for Next.js's empty compiler marker; it is not an authentication bypass or production setting. Tests use synthetic credentials and mocked network responses.
