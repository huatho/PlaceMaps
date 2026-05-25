import { createClient } from "@supabase/supabase-js";

function cleanEnvValue(value?: string) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

function getSupabaseUrl() {
  const supabaseUrl = cleanEnvValue(process.env.SUPABASE_URL)?.replace(/\/$/, "");

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL in environment variables.");
  }

  return supabaseUrl;
}

function getSupabaseKey() {
  const supabaseKey = cleanEnvValue(process.env.SUPABASE_API_KEY);

  if (!supabaseKey) {
    throw new Error(
      "Missing SUPABASE_API_KEY in environment variables."
    );
  }

  return supabaseKey;
}

export function createServerSupabaseClient() {
  return createClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
      persistSession: false
    }
  });
}
