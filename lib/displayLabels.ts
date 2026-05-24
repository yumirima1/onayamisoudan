import type { PostStatus, Urgency } from "@/lib/types";

export function urgencyLabel(urgency: Urgency | string) {
  switch (urgency) {
    case "normal":
      return "普通";
    case "soon":
      return "少し早めに見てほしい";
    case "risky":
      return "公開しない方がいい内容かも";
    default:
      return "未分類";
  }
}

export function postStatusLabel(status: PostStatus | string) {
  switch (status) {
    case "unreplied":
      return "まだ返信はありません";
    case "replied":
      return "返信済み";
    case "hidden":
      return "非表示";
    default:
      return "未分類";
  }
}

export function publicWishLabel(allowPublic: boolean) {
  return allowPublic ? "公開希望あり" : "公開希望なし";
}
