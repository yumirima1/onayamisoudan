import { createServerSupabase, createServiceSupabase } from "@/lib/supabaseServer";

export async function requireAdminFromBearer(authHeader: string | null) {
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { ok: false as const, status: 401, code: "missing_token", message: "Missing access token." };
  }

  const userClient = createServerSupabase(token);
  const {
    data: { user },
    error: userError
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return { ok: false as const, status: 401, code: "invalid_token", message: "Invalid access token." };
  }

  const serviceClient = createServiceSupabase();
  const { data: profile, error: profileError } = await serviceClient
    .from("admin_profiles")
    .select("id, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false as const,
      status: 500,
      code: "admin_profile_lookup_failed",
      message: "Admin profile lookup failed."
    };
  }

  if (!profile) {
    return {
      ok: false as const,
      status: 403,
      code: "admin_profile_not_found",
      message: `Admin profile required for auth user id ${user.id}.`
    };
  }

  if (!profile.is_active) {
    return {
      ok: false as const,
      status: 403,
      code: "admin_profile_inactive",
      message: "Admin profile is inactive."
    };
  }

  return { ok: true as const, user, profile, serviceClient };
}
