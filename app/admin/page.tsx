import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getAdminSession, isAllowedAdminHost } from "@/lib/admin-auth";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";
import "./admin.css";

export const metadata: Metadata = {
  title: { absolute: "RETECH Admin CMS" },
  description: "Secure RETECH content management system.",
  robots: { index: false, follow: false, noarchive: true, nocache: true },
};

export default async function AdminPage() {
  const requestHeaders = await headers();
  if (!isAllowedAdminHost(requestHeaders.get("x-forwarded-host") || requestHeaders.get("host"))) notFound();
  const session = await getAdminSession();
  return session ? <AdminDashboard email={session.email} /> : <AdminLogin />;
}
