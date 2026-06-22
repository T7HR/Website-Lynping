import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authGuard";
import { listMirrorRows } from "@/lib/supabaseAdmin";
import { SUPABASE_TABLE } from "@/lib/env";

export async function GET() {
  await requireUser("owner");
  return NextResponse.json({ table: SUPABASE_TABLE, rows: await listMirrorRows() });
}
