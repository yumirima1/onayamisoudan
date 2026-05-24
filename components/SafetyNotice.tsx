type SafetyNoticeProps = {
  compact?: boolean;
  riskLevel?: "low" | "medium" | "high" | "critical";
};

export function SafetyNotice({ compact = false, riskLevel }: SafetyNoticeProps) {
  const urgent = riskLevel === "high" || riskLevel === "critical";

  return (
    <section className={`min-w-0 overflow-hidden rounded-lg border ${urgent ? "border-red-300/35 bg-red-950/20" : "border-night-line bg-night-paper/70"} p-4 sm:p-5`}>
      <h2 className="break-words text-base font-semibold text-night-text">{urgent ? "今すぐ安全を優先してください" : "大切なお知らせ"}</h2>
      <p className={`mt-2 break-words text-sm leading-7 ${urgent ? "text-red-100" : "text-night-muted"}`}>
        このサイトは医療・診断・治療サービスではありません。命の危険、暴力、自傷のおそれ、今すぐ助けが必要な状況では、
        地域の緊急窓口、警察・消防、自治体や公的相談窓口、信頼できる身近な人に連絡してください。
      </p>
      {!compact ? (
        <p className="mt-3 break-words text-sm leading-7 text-night-muted">
          投稿への返信は管理者が確認してから行います。自動ですぐに返るものではありません。
        </p>
      ) : null}
    </section>
  );
}
