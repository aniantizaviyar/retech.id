import { providerReady } from "@/lib/assistant/provider";
export const runtime = "nodejs";
export function GET() {
  return Response.json(
    {
      aiAvailable: providerReady(),
      mode: "guided-with-optional-ai",
      skills: [
        "search_information",
        "estimate_price",
        "request_consultation",
        "create_support_request",
        "check_service_status",
      ],
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
