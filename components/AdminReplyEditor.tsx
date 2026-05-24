"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminJsonFetch } from "@/lib/adminSessionClient";
import type { AiDraft, Post, PublicPost } from "@/lib/types";
import { SafetyNotice } from "@/components/SafetyNotice";

type DraftResponse = AiDraft;
const adminFieldClass =
  "w-full min-w-0 rounded-md border border-white/10 bg-black/20 p-3 text-base outline-none focus:border-night-accent md:text-sm";
const adminButtonClass =
  "w-full rounded-md border border-white/15 px-4 py-3 text-sm text-night-text hover:bg-white/10 disabled:opacity-50 sm:w-auto";

export function AdminReplyEditor({
  post,
  publicPost,
  onPostUpdated
}: {
  post: Post;
  publicPost: PublicPost | null;
  onPostUpdated?: (patch: Partial<Post>) => void;
}) {
  const router = useRouter();
  const [adminReply, setAdminReply] = useState(post.admin_reply ?? "");
  const [adminMemo, setAdminMemo] = useState(post.admin_memo ?? "");
  const [publicTitle, setPublicTitle] = useState(publicPost?.public_title ?? post.title);
  const [publicBody, setPublicBody] = useState(publicPost?.public_body ?? "");
  const [publicReply, setPublicReply] = useState(publicPost?.public_reply ?? "");
  const [archiveStatus, setArchiveStatus] = useState(publicPost?.archive_status ?? "draft");
  const [streamUsed, setStreamUsed] = useState(publicPost?.is_stream_used ?? false);
  const [streamUrl, setStreamUrl] = useState(publicPost?.stream_url ?? "");
  const [status, setStatus] = useState("");
  const [notifiedAt, setNotifiedAt] = useState(post.reply_url_sent_at ?? post.reply_notified_at ?? null);
  const [draft, setDraft] = useState<DraftResponse | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/ai/draft")
      .then((response) => response.json())
      .then((data: { enabled?: boolean }) => setAiEnabled(Boolean(data.enabled)))
      .catch(() => setAiEnabled(false));
  }, []);

  async function saveReply() {
    setStatus("保存中...");

    try {
      await adminJsonFetch<{ ok: boolean }>(`/api/admin/posts/${post.id}/reply`, {
        method: "PATCH",
        body: JSON.stringify({
          adminReply,
          adminMemo,
          currentStatus: post.status,
          repliedAt: post.replied_at
        })
      });
    } catch {
      setStatus("返信を保存できませんでした。");
      return;
    }

    setStatus("返信と管理メモを保存しました。");
    router.refresh();
  }

  async function savePublicPost() {
    setStatus("公開用データを保存中...");

    try {
      await adminJsonFetch<{ publicPost: PublicPost }>(`/api/admin/posts/${post.id}/public-post`, {
        method: "PUT",
        body: JSON.stringify({
          publicPostId: publicPost?.id ?? null,
          publicTitle,
          publicBody,
          publicReply,
          category: post.category,
          archiveStatus,
          streamUsed,
          streamUrl
        })
      });
    } catch {
      setStatus("公開用データを保存できませんでした。公開希望と入力内容を確認してください。");
      return;
    }

    setStatus("公開用データを保存しました。");
    router.refresh();
  }

  async function generateDraft() {
    setStatus("下書き補助を準備中...");
    const response = await fetch("/api/ai/draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "same-origin",
      body: JSON.stringify({ postId: post.id })
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus(error?.error ?? "下書き補助を使えませんでした。");
      return;
    }

    const data = (await response.json()) as DraftResponse;
    setDraft(data);
    setStatus("下書き補助を作成しました。保存前に必ず管理者が確認してください。");
  }

  async function notifyReply() {
    setStatus("通知メールを送信中...");

    try {
      const result = await adminJsonFetch<{ sent: boolean; mocked: boolean; message?: string; replyNotifiedAt?: string }>(`/api/admin/posts/${post.id}/notify`, {
        method: "POST"
      });

      if (result.replyNotifiedAt) {
        setNotifiedAt(result.replyNotifiedAt);
      }

      setStatus(result.mocked ? (result.message ?? "メール送信サービス未設定のため、実送信はしていません。") : "通知メールを送信しました。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "通知メールを送信できませんでした。");
    }
  }

  async function stopPublicVisibility() {
    const confirmed = window.confirm("この投稿を公開アーカイブから非公開にします。よろしいですか？");

    if (!confirmed) {
      return;
    }

    setStatus("公開停止中...");

    try {
      await adminJsonFetch<{ ok: boolean; allowPublic: boolean }>(`/api/admin/posts/${post.id}/visibility`, {
        method: "PATCH"
      });
      onPostUpdated?.({ allow_public: false });
      setStatus("公開アーカイブから非公開にしました。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "公開停止に失敗しました。");
    }
  }

  async function deletePost() {
    const firstConfirmed = window.confirm("この投稿を完全削除します。公開用データも削除され、元に戻せません。続けますか？");

    if (!firstConfirmed) {
      return;
    }

    const secondConfirmed = window.confirm("最終確認です。本当にこの投稿を完全削除しますか？");

    if (!secondConfirmed) {
      return;
    }

    setStatus("投稿を削除中...");

    try {
      await adminJsonFetch<{ ok: boolean }>(`/api/admin/posts/${post.id}/delete`, {
        method: "DELETE"
      });
      setStatus("投稿を削除しました。");
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "投稿を削除できませんでした。");
    }
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <section className="min-w-0 space-y-5 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-6">
        <h2 className="break-words text-xl font-semibold">管理者返信</h2>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>返信本文</span>
          <textarea value={adminReply} onChange={(event) => setAdminReply(event.target.value)} rows={9} className={`${adminFieldClass} leading-7`} />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>管理メモ</span>
          <textarea value={adminMemo} onChange={(event) => setAdminMemo(event.target.value)} rows={5} className={`${adminFieldClass} leading-7`} />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button onClick={saveReply} className="w-full rounded-md bg-night-accent px-4 py-3 text-sm font-semibold text-night-background sm:w-auto">
            返信を保存
          </button>
          <button onClick={generateDraft} disabled={!aiEnabled} className={adminButtonClass}>
            {aiEnabled ? "下書き補助を作る" : "下書き補助は未設定"}
          </button>
          <button
            onClick={notifyReply}
            disabled={!post.email || !adminReply.trim()}
            className={adminButtonClass}
          >
            返信確認URLをメールで送る
          </button>
        </div>
        <p className="break-words text-xs leading-6 text-night-muted">
          {post.email
            ? notifiedAt
              ? `通知済み: ${new Date(notifiedAt).toLocaleString("ja-JP")}`
              : "返信保存後、必要に応じて通知メールを送れます。"
            : "通知メールアドレスが未入力のため、メール通知はできません。"}
        </p>
        {status ? <p className="break-words text-sm leading-7 text-night-muted">{status}</p> : null}
      </section>

      <section className="min-w-0 space-y-5 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-6">
        <h2 className="break-words text-xl font-semibold">公開・配信用編集</h2>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>公開用タイトル</span>
          <input value={publicTitle} onChange={(event) => setPublicTitle(event.target.value)} maxLength={120} className={adminFieldClass} />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>公開用本文</span>
          <textarea value={publicBody} onChange={(event) => setPublicBody(event.target.value)} rows={7} className={`${adminFieldClass} leading-7`} />
        </label>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>公開用返信</span>
          <textarea value={publicReply} onChange={(event) => setPublicReply(event.target.value)} rows={7} className={`${adminFieldClass} leading-7`} />
        </label>
        <div className="grid gap-3 text-sm text-night-muted sm:grid-cols-2">
          <label className="block space-y-2">
            <span>公開状態</span>
            <select value={archiveStatus} onChange={(event) => setArchiveStatus(event.target.value as "published" | "draft" | "hidden")} className={adminFieldClass}>
              <option value="published">公開</option>
              <option value="draft">非公開下書き</option>
              <option value="hidden">非公開</option>
            </select>
          </label>
          <label className="flex min-w-0 gap-2 leading-7">
            <input type="checkbox" checked={streamUsed} onChange={(event) => setStreamUsed(event.target.checked)} />
            <span className="break-words">配信使用済み</span>
          </label>
        </div>
        <div className="break-words rounded-md border border-white/10 bg-black/10 p-4 text-sm leading-7 text-night-muted">
          <p className="font-semibold text-night-text">個人情報マスク注意チェックリスト</p>
          <p>氏名、学校名、勤務先、住所、連絡先、具体的な日付や地名、第三者を特定できる表現を公開文から外してください。</p>
          <p>診断名や治療方針の断定に見える表現は避け、悩みの言語化と受け止めを中心にしてください。</p>
        </div>
        <label className="block space-y-2 text-sm text-night-muted">
          <span>配信URL</span>
          <input value={streamUrl} onChange={(event) => setStreamUrl(event.target.value)} className={adminFieldClass} />
        </label>
        <button onClick={savePublicPost} className="w-full rounded-md bg-night-accent px-4 py-3 text-sm font-semibold text-night-background sm:w-auto">
          公開用データを保存
        </button>
      </section>

      {draft ? (
        <section className="min-w-0 space-y-4 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-6 lg:col-span-2">
          <h2 className="break-words text-xl font-semibold">下書き補助</h2>
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

      <section className="min-w-0 space-y-4 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-6 lg:col-span-2">
        <div className="min-w-0">
          <h2 className="break-words text-xl font-semibold text-night-text">公開管理</h2>
          <p className="mt-2 break-words text-sm leading-7 text-night-muted">
            個人情報混入、危険判断、投稿者保護、荒らし対応が必要な場合に使います。まずは公開停止を優先してください。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {post.allow_public ? (
            <button
              type="button"
              onClick={stopPublicVisibility}
              className="w-full rounded-md border border-night-warm/40 px-4 py-3 text-sm font-semibold text-night-text hover:bg-night-warm/10 sm:w-auto"
            >
              公開停止
            </button>
          ) : (
            <p className="break-words rounded-md border border-white/10 bg-black/10 px-4 py-3 text-sm leading-7 text-night-muted">
              この投稿は公開アーカイブ対象ではありません。
            </p>
          )}
          <button
            type="button"
            onClick={deletePost}
            className="w-full rounded-md border border-red-300/35 px-4 py-3 text-sm font-semibold text-red-100 hover:bg-red-950/20 sm:w-auto"
          >
            完全削除
          </button>
        </div>
        {status ? <p className="break-words text-sm leading-7 text-night-muted">{status}</p> : null}
      </section>
    </div>
  );
}

function DraftBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-md border border-white/10 bg-black/15 p-4">
      <h3 className="break-words font-semibold text-night-text">{title}</h3>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-night-muted">{body || "なし"}</p>
    </div>
  );
}
