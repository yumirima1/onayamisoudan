export type Urgency = "normal" | "soon" | "risky";

export type PostStatus = "unreplied" | "replied" | "hidden";

export type Post = {
  id: string;
  created_at: string;
  nickname: string | null;
  email?: string | null;
  age_group: string | null;
  category: string;
  title: string;
  body: string;
  urgency: Urgency;
  allow_public: boolean;
  allow_stream: boolean;
  admin_reply: string | null;
  admin_memo: string | null;
  public_draft_title: string | null;
  public_draft_body: string | null;
  public_draft_reply: string | null;
  risk_flags: Record<string, unknown> | null;
  ai_summary: Record<string, unknown> | null;
  ai_drafts: Record<string, unknown> | null;
  status: PostStatus;
  replied_at: string | null;
  reply_notified_at?: string | null;
};

export type PublicPost = {
  id: string;
  source_post_id: string | null;
  published_at: string | null;
  public_title: string;
  public_body: string;
  public_reply: string;
  category: string;
  archive_status: "published" | "draft" | "hidden";
  is_stream_used: boolean;
  stream_url: string | null;
};

export type AiDraft = {
  summary: string;
  replyDrafts: string[];
  piiMaskSuggestions: string[];
  riskSigns: string[];
  streamSummary: string;
  riskLevel: "low" | "medium" | "high" | "critical";
};
