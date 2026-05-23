"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { AiDraft, Post, PublicPost } from "@/lib/types";
import { SafetyNotice } from "@/components/SafetyNotice";

type DraftResponse = AiDraft;

export function AdminReplyEditor({ post, publicPost }: { post: Post; publicPost: PublicPost | null }) {
  const router = useRouter();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState(post.admin_reply ?? "");
  const [adminMemo, setAdminMemo] = useState(post.admin_memo ?? "");
  const [publicTitle, setPublicTitle] = useState(publicPost?.public_title ?? post.title);
  const [publicBody, setPublicBody] = useState(publicPost?.public_body ?? "");
  const [publicReply, setPublicReply] = useState(publicPost?.public_reply ?? "");
  const [archiveStatus, setArchiveStatus] = useState(publicPost?.archive_status ?? "draft");
  const [streamUsed, setStreamUsed] = useState(publicPost?.is_stream_used ?? false);
  const [streamUrl, setStreamUrl] = useState(publicPost?.stream_url ?? "");
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionToken(data.session?.access_token ?? null);
    });
    fetch("/api/ai/draft")
      .then((response) => response.json())
      .then((data: { enabled?: boolean }) => setAiEnabled(Boolean(data.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  async function audit(action: string, targetTable: string, targetId: string) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action,
      target_table: targetTable,
      target_id: targetId,
      metadata: {}
    });
  }

  async function saveReply() {
    setStatus("保存中...");
    const { error } = await supabase
      .from("posts")
      .update({
        admin_reply: adminReply || null,
        admin_memo: adminMemo || null,
        status: adminReply.trim() ? "replied" : post.status,
        replied_at: adminReply.trim() ? new Date().toISOString() : post.replied_at
      })
      .eq("id", post.id);

    if (error) {
      setStatus("返信を保存できませんでした。");
      return;
    }

    await audit("update_admin_reply", "posts", post.id);
    setStatus("返信と管理メモを保存しました。");
    router.refresh();
  }

  async function savePublicPost() {
    setStatus("公開用データを保存中...");
    const payload = {
      source_post_id: post.id,
      public_title: publicTitle,
      public_body: publicBody,
      public_reply: publicReply,
      category: post.category,
      archive_status: archiveStatus,
      is_stream_used: streamUsed,
      stream_url: streamUrl.trim() ? streamUrl.trim() : null,
      published_at: archiveStatus === "published" ? new Date().toISOString() : null
    };

    const query = publicPost
      ? supabase.from("public_posts").update(payload).eq("id", publicPost.id).select().single()
      : supabase.from("public_posts").insert(payload).select().single();

    const { data, error } = await query;

    if (error || !data) {
      setStatus("公開用データを保存できませんでした。公開許可と入力内容を確認してください。");
      return;
    }

    await supabase
      .from("posts")
      .update({
        public_draft_title: publicTitle,
        public_draft_body: publicBody,
        public_draft_reply: publicReply
      })
      .eq("id", post.id);

    await audit(publicPost ? "update_public_post" : "create_public_post", "public_posts", data.id);
    setStatus("公開用データを保存しました。");
    router.refresh();
  }

  async function generateDraft() {
    if (!sessionToken) {
      setStatus("ログイン状態を確認できません。再ログインしてください。");
      return;
    }

    setStatus("AI下書きを生成中...");
    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ postId: post.id })
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(error?.error ?? "AI下書きを生成できませんでした。");
      return;
    }

    const data = (await response.json()) as DraftResponse;
    setDraft(data);
    setStatus("AI下書きを生成しました。保存前に必ず管理者が確認してください。");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="space-y-5 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="text-xl font-semibold">管理者返信</h2>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>返信本文</span>
          <textarea value={adminReply} onChange={(event) => setAdminReply(event.target.value)} rows={9} className="w-full rounded-md border border-white/10 bg-black/20 p-3 leading-7 outline-none focus:border-night-accent" />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>管理メモ</span>
          <textarea value={adminMemo} onChange={(event) => setAdminMemo(event.target.value)} rows={5} className="w-full rounded-md border border-white/10 bg-black/20 p-3 leading-7 outline-none focus:border-night-accent" />
        </label>
        <div className="flex flex-wrap gap-3">
          <button onClick={saveReply} className="rounded-md bg-night-accent px-4 py-2 text-sm font-semibold text-white">
            返信を保存
          </button>
          <button onClick={generateDraft} disabled={!aiEnabled} className="rounded-md border border-white/15 px-4 py-2 text-sm text-night-text hover:bg-white/10 disabled:opacity-50">
            {aiEnabled ? "AI下書き生成" : "AI機能は未設定"}
          </button>
        </div>
        {status ? <p className="text-sm text-night-muted">{status}</p> : null}
      </section>

      <section className="space-y-5 rounded-lg border border-white/10 bg-night-card p-6">
        <h2 className="text-xl font-semibold">公開・配信用編集</h2>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>公開用タイトル</span>
          <input value={publicTitle} onChange={(event) => setPublicTitle(event.target.value)} maxLength={120} className="w-full rounded-md border border-white/10 bg-black/20 p-3 outline-none focus:border-night-accent" />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>公開用本文</span>
          <textarea value={publicBody} onChange={(event) => setPublicBody(event.target.value)} rows={7} className="w-full rounded-md border border-white/10 bg-black/20 p-3 leading-7 outline-none focus:border-night-accent" />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>公開用返信</span>
          <textarea value={publicReply} onChange={(event) => setPublicReply(event.target.value)} rows={7} className="w-full rounded-md border border-white/10 bg-black/20 p-3 leading-7 outline-none focus:border-night-accent" />
        </label>
        <div className="grid gap-3 text-sm text-night-muted sm:grid-cols-2">
          <label className="block space-y-2">
            <span>公開状態</span>
            <select value={archiveStatus} onChange={(event) => setArchiveStatus(event.target.value as "published" | "draft" | "hidden")} className="w-full rounded-md border border-white/10 bg-black/20 p-3 outline-none focus:border-night-accent">
              <option value="published">公開</option>
              <option value="draft">非公開下書き</option>
              <option value="hidden">非公開</option>
            </select>
          </label>
          <label className="flex gap-2">
            <input type="checkbox" checked={streamUsed} onChange={(event) => setStreamUsed(event.target.checked)} />
            配信使用済み
          </label>
        </div>
        <div className="rounded-md border border-white/10 bg-black/10 p-4 text-sm leading-7 text-night-muted">
          <p className="font-semibold text-night-text">個人情報マスク注意チェックリスト</p>
          <p>氏名、学校名、勤務先、住所、連絡先、具体的な日付や地名、第三者を特定できる表現を公開文から外してください。</p>
          <p>診断名や治療方針の断定に見える表現は避け、悩みの言語化と受け止めを中心にしてください。</p>
        </div>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>配信URL</span>
          <input value={streamUrl} onChange={(event) => setStreamUrl(event.target.value)} className="w-full rounded-md border border-white/10 bg-black/20 p-3 outline-none focus:border-night-accent" />
        </label>
        <button onClick={savePublicPost} className="rounded-md bg-night-accent px-4 py-2 text-sm font-semibold text-white">
          公開用データを保存
        </button>
      </section>

      {draft ? (
        <section className="space-y-4 rounded-lg border border-white/10 bg-night-card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold">AI下書き</h2>
          {(draft.riskLevel === "high" || draft.riskLevel === "critical") ? <SafetyNotice compact riskLevel={draft.riskLevel} /> : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <DraftBlock title="要約" body={draft.summary} />
            <DraftBlock title="配信用要約" body={draft.streamSummary} />
            <DraftBlock title="個人情報マスク候補" body={draft.piiMaskSuggestions.join("\n")} />
            <DraftBlock title="危険サイン" body={draft.riskSigns.join("\n")} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {draft.replyDrafts.map((reply, index) => (
              <DraftBlock key={reply} title={`返信案 ${index + 1}`} body={reply} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DraftBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/15 p-4">
      <h3 className="font-semibold text-night-text">{title}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-night-muted">{body || "なし"}</p>
    </div>
  );
}
