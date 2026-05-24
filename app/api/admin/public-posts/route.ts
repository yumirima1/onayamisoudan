import { NextRequest, NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth";

const publicPostSelect =
  "id, source_post_id, published_at, public_title, public_body, public_reply, category, archive_status, is_stream_used, stream_url";

export async function GET(request: NextRequest) {
  const auth = requireAdminFromRequest(request);

  if (!auth.ok) {
    return NextResponse.json({ error: auth.message, code: auth.code }, { status: auth.status });
  }

  const archiveStatus = request.nextUrl.searchParams.get("archive_status");
  let query = auth.serviceClient.from("public_posts").select(publicPostSelect).order("published_at", { ascending: false });

  if (archiveStatus) {
    query = query.eq("archive_status", archiveStatus);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "公開用データを取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({ posts: data ?? [] });
}
