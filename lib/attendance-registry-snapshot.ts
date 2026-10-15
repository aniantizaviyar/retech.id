import "server-only";
import { createHash } from "node:crypto";
import { registrySubscriptions, registryTenant } from "./attendance-control";
import { buildAttendanceSnapshot } from "./attendance-control-protocol";

// Two repeatable reads detect a tenant/subscription edit between separate REST calls.
// A transient conflict returns 409; Laravel retries without applying a mixed contract.
export async function attendanceRegistrySnapshot(
  id: string,
  backendUuid: string,
) {
  const tenant = await registryTenant(id);
  if (!tenant || tenant.product !== "attendance")
    throw new Error("tenant_not_found");
  const subscriptions = await registrySubscriptions(id);
  const secondTenant = await registryTenant(id);
  const secondSubscriptions = await registrySubscriptions(id);
  const fingerprint = (value: unknown) =>
    createHash("sha256").update(JSON.stringify(value)).digest("hex");
  if (
    fingerprint(tenant) !== fingerprint(secondTenant) ||
    fingerprint(subscriptions) !== fingerprint(secondSubscriptions)
  )
    throw new Error("registry_changed_during_snapshot");
  return buildAttendanceSnapshot(tenant, subscriptions, backendUuid);
}
