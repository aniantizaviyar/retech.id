import "server-only";

export function getSupabaseAdminConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase admin environment is not configured");
  return { url, key };
}

export async function supabaseAdminFetch(path: string, init: RequestInit = {}) {
  const { url, key } = getSupabaseAdminConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${url}${path}`, { ...init, headers, cache: "no-store" });
}

export function cmsMediaPublicUrl(path: string) {
  const { url } = getSupabaseAdminConfig();
  return `${url}/storage/v1/object/public/cms-media/${path.split("/").map(encodeURIComponent).join("/")}`;
}
