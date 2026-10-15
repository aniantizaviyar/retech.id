import {
  ATTENDANCE_SOURCE_PATH,
  signedResponse,
  UUID,
  verifySignature,
} from "@/lib/attendance-control-protocol";
import { controlConfig } from "@/lib/attendance-control";
import { attendanceRegistrySnapshot } from "@/lib/attendance-registry-snapshot";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let config;
  try {
    config = controlConfig();
  } catch {
    return Response.json({ error: "control_not_configured" }, { status: 503 });
  }
  if (
    new URL(request.url).pathname !== ATTENDANCE_SOURCE_PATH ||
    !(request.headers.get("content-type") ?? "").startsWith(
      "application/json",
    ) ||
    Number(request.headers.get("content-length") ?? 0) > 16384
  )
    return Response.json({ error: "invalid_request" }, { status: 400 });
  // Reject unknown credentials before consuming an untrusted stream.
  if (request.headers.get("X-Retendance-Key-ID") !== config.keyId)
    return Response.json({ error: "unauthorized" }, { status: 401 });
  let body = "";
  let nonce = "";
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error();
    let bytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.length;
      if (bytes > 16384) {
        await reader.cancel();
        throw new Error();
      }
      body += decoder.decode(part.value, { stream: true });
    }
    body += decoder.decode();
    nonce = verifySignature(
      "POST",
      ATTENDANCE_SOURCE_PATH,
      body,
      request.headers,
      config.key,
      config.keyId,
    );
  } catch {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const respond = (data: unknown, status = 200) => {
    const text = JSON.stringify(data);
    return new Response(text, {
      status,
      headers: signedResponse(text, nonce, status, config.key, config.keyId),
    });
  };
  try {
    const d = JSON.parse(body);
    if (
      d.schema !== 1 ||
      typeof d.registry_tenant_id !== "string" ||
      !UUID.test(d.registry_tenant_id) ||
      typeof d.backend_tenant_uuid !== "string" ||
      !UUID.test(d.backend_tenant_uuid)
    )
      return respond({ error: "invalid_selector" }, 422);
    return respond(
      await attendanceRegistrySnapshot(
        d.registry_tenant_id,
        d.backend_tenant_uuid,
      ),
    );
  } catch {
    return respond({ error: "snapshot_unavailable" }, 409);
  }
}
