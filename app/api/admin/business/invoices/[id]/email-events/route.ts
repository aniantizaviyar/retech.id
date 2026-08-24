import { NextResponse } from "next/server";
import { readAdminSessionFromRequest } from "@/lib/admin-auth";
import { supabaseAdminFetch } from "@/lib/supabase-admin";
export const runtime="nodejs";
export async function GET(request:Request,context:{params:Promise<{id:string}>}){if(!readAdminSessionFromRequest(request))return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await context.params;const response=await supabaseAdminFetch(`/rest/v1/business_invoice_email_events?select=*&invoice_id=eq.${encodeURIComponent(id)}&order=event_at.desc&limit=50`);return response.ok?NextResponse.json({records:await response.json()}):NextResponse.json({error:"Riwayat email belum dapat dimuat."},{status:502});}
