import { z } from "zod";

const cleanText = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .transform((v) => v.normalize("NFKC").trim())
    .refine(
      (v) =>
        v.length > 0 &&
        v.length <= max &&
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(v),
    );
export const chatInput = z
  .object({
    message: cleanText(1200),
    locale: z.enum(["id", "en"]),
    history: z
      .array(
        z.object({ role: z.literal("user"), text: cleanText(600) }).strict(),
      )
      .max(6)
      .default([]),
    turnstileToken: z.string().max(2048).optional(),
    aiConsent: z.boolean().default(false),
  })
  .strict();
export const toolCall = z.discriminatedUnion("name", [
  z
    .object({
      name: z.literal("search_information"),
      arguments: z.object({ query: cleanText(500) }).strict(),
    })
    .strict(),
  z
    .object({
      name: z.literal("estimate_price"),
      arguments: z
        .object({
          product: z.enum(["attendance", "qr-order-pos", "development", "vps"]),
          plan: z.string().max(50).optional(),
          quantity: z.number().int().min(1).max(10000).optional(),
          months: z.number().int().min(1).max(12).default(1),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      name: z.literal("request_consultation"),
      arguments: z.object({ topic: cleanText(500) }).strict(),
    })
    .strict(),
  z
    .object({
      name: z.literal("create_support_request"),
      arguments: z.object({ summary: cleanText(500) }).strict(),
    })
    .strict(),
  z
    .object({
      name: z.literal("check_service_status"),
      arguments: z
        .object({ service: z.enum(["website", "attendance"]) })
        .strict(),
    })
    .strict(),
]);
export type ToolCall = z.infer<typeof toolCall>;
export type ChatInput = z.infer<typeof chatInput>;
export type Source = { title: string; href: string };
export type Document = Source & {
  id: string;
  text: string;
  keywords: string[];
};
export type CatalogItem = {
  product: "attendance" | "qr-order-pos" | "development";
  key: string;
  name: string;
  unitPrice: number | null;
  unit: "employee" | "outlet" | "project" | "company";
  maximum?: number;
  starting: boolean;
  source: Source;
};
export type Knowledge = {
  documents: Document[];
  catalog: CatalogItem[];
  loadedAt: string;
};
export type ActionDraft = {
  kind: "consultation" | "support";
  summary: string;
  token: string;
};
export type Answer = {
  text: string;
  skill: string;
  sources: Source[];
  calculation?: {
    unitPrice: number;
    quantity: number;
    months: number;
    total: number;
    unit: string;
    starting: boolean;
  };
  action?: ActionDraft;
  provider?: "guided" | "cloudflare";
};
export const actionInput = z
  .object({
    token: z.string().min(20).max(3000),
    name: cleanText(80),
    phone: cleanText(30),
    preferredAt: z.string().max(40).optional(),
    note: z.string().max(700).default(""),
    consent: z.literal(true),
    turnstileToken: z.string().min(1).max(2048),
    locale: z.enum(["id", "en"]),
  })
  .strict();

// These schemas are sent to the model; code revalidates independently using the union above.
export const functionTools = [
  {
    name: "search_information",
    description: "Search published RETECH service/product information.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", maxLength: 500 } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "estimate_price",
    description:
      "Ask deterministic code for a catalog estimate; never invent price or discount.",
    parameters: {
      type: "object",
      properties: {
        product: {
          type: "string",
          enum: ["attendance", "qr-order-pos", "development", "vps"],
        },
        plan: { type: "string", maxLength: 50 },
        quantity: { type: "integer", minimum: 1, maximum: 10000 },
        months: { type: "integer", minimum: 1, maximum: 12 },
      },
      required: ["product"],
      additionalProperties: false,
    },
  },
  {
    name: "request_consultation",
    description:
      "Prepare a consultation request form, NOT a confirmed appointment. Requires human confirmation to submit.",
    parameters: {
      type: "object",
      properties: { topic: { type: "string", maxLength: 500 } },
      required: ["topic"],
      additionalProperties: false,
    },
  },
  {
    name: "create_support_request",
    description:
      "Prepare a support request form. No account access, no submission or email until human confirmation.",
    parameters: {
      type: "object",
      properties: { summary: { type: "string", maxLength: 500 } },
      required: ["summary"],
      additionalProperties: false,
    },
  },
  {
    name: "check_service_status",
    description:
      "Check reachability of an allowlisted public page, not a customer account or private server.",
    parameters: {
      type: "object",
      properties: {
        service: { type: "string", enum: ["website", "attendance"] },
      },
      required: ["service"],
      additionalProperties: false,
    },
  },
].map((fn) => ({ type: "function" as const, function: fn }));
