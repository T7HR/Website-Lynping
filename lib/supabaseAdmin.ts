import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_TABLE } from "@/lib/env";

export type JsonValue = any;

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getMirrorPayload<T>(fileName: string, fallback: T): Promise<T> {
  const supabase = getClient();
  if (!supabase) return fallback;

  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .select("payload")
    .eq("key", fileName)
    .maybeSingle();

  if (error || !data || data.payload === null || data.payload === undefined) {
    return fallback;
  }

  return data.payload as T;
}

export async function upsertMirrorPayload<T>(fileName: string, payload: T) {
  const supabase = getClient();
  if (!supabase) {
    throw new Error("Supabase env is not configured");
  }

  const { error } = await supabase
    .from(SUPABASE_TABLE)
    .upsert({
      key: fileName,
      file_name: fileName,
      payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: "key" });

  if (error) throw error;
}

export async function listMirrorRows() {
  const supabase = getClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .select("key,file_name,updated_at")
    .order("updated_at", { ascending: false });

  if (error) return [];
  return data || [];
}
