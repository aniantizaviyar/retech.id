export const runtime = "nodejs";
export function GET() {
  return Response.json(
    {
      aiAvailable: false,
      mode: "internal-knowledge-agent",
      profileRequired: true,
      retentionDays: 7,
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
