import type { SupabaseClient } from "@supabase/supabase-js";

export async function writeAuditLog(
  supabase: SupabaseClient,
  params: {
    adminUserId: string;
    action: string;
    targetTable?: string;
    targetId?: string;
    metadata?: Record<string, unknown>;
  }
) {
  await supabase.from("admin_audit_logs").insert({
    admin_id: params.adminUserId,
    action: params.action,
    target_table: params.targetTable ?? null,
    target_id: params.targetId ?? null,
    metadata: params.metadata ?? {}
  });
}
