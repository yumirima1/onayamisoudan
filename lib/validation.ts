import { z } from "zod";

export const submitPostSchema = z.object({
  nickname: z.string().trim().max(40).optional().nullable(),
  email: z.string().trim().email().max(254).optional().nullable(),
  age_group: z.enum(["中学生", "高校生", "大学生", "社会人", "その他", "答えたくない"]).optional().nullable(),
  category: z.enum(["学校", "人間関係", "家族", "恋愛", "将来", "気分", "ただ聞いてほしい", "その他"]),
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(20).max(2000),
  urgency: z.enum(["normal", "soon", "risky"]),
  allow_public: z.boolean(),
  allow_stream: z.boolean(),
  website: z.string().trim().max(0).optional()
});

export const adminReplySchema = z.object({
  admin_reply: z.string().trim().max(3000).optional().nullable(),
  admin_memo: z.string().trim().max(3000).optional().nullable(),
  status: z.enum(["unreplied", "replied", "hidden"]).optional()
});

export const publicPostSchema = z.object({
  public_title: z.string().trim().min(1).max(120),
  public_body: z.string().trim().min(1).max(3000),
  public_reply: z.string().trim().min(1).max(3000),
  category: z.enum(["学校", "人間関係", "家族", "恋愛", "将来", "気分", "ただ聞いてほしい", "その他"]),
  archive_status: z.enum(["published", "draft", "hidden"]),
  is_stream_used: z.boolean(),
  stream_url: z.string().trim().url().optional().or(z.literal("")).nullable()
});

export function normalizeEmpty(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
