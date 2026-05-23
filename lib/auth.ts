import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";

export async function requireAdminFromBearer(authHeader: string | null) {
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { ok: false as const, status: 401, message: "Missing access token." };
  }

  const userClient = createServerSupabase(token);
  const {
    data: { user },
    error: userError
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return { ok: false as const, status: 401, message: "Invalid access token." };
  }

  const serviceClient = createServiceSupabase();
  const { data: profile, error: profileError } = await serviceClient
    .from("admin_profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || !profile.is_active) {
    return { ok: false as const, status: 403, message: "Admin profile required." };
  }

  return { ok: true as const, user, profile, serviceClient };
}
