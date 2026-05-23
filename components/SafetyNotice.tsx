type SafetyNoticeProps = {
  compact?: boolean;
  riskLevel?: "low" | "medium" | "high" | "critical";
};

export function SafetyNotice({ compact = false, riskLevel }: SafetyNoticeProps) {
  const urgent = riskLevel === "high" || riskLevel === "critical";

  return (
    <section className={`rounded-lg border ${urgent ? "border-red-300/40 bg-red-950/25" : "border-white/10 bg-white/[0.04]"} p-5`}>
      <h2 className="text-base font-semibold text-night-text">{urgent ? "今すぐ安全を優先してください" : "大切なお知らせ"}</h2>
      <p className={`mt-2 text-sm leading-7 ${urgent ? "text-red-100" : "text-night-muted"}`}>
        このサイトは医療・診断・治療サービスではありません。命の危険、暴力、自傷のおそれ、今すぐ助けが必要な状況では、
        地域の緊急窓口、警察・消防、自治体や公的相談窓口、信頼できる身近な人に連絡してください。
      </p>
      {!compact ? (
        <p className="mt-3 text-sm leading-7 text-night-muted">
          投稿への返信は管理者が確認してから行います。AIは下書き補助に限り、自動返信には使いません。
        </p>
      ) : null}
    </section>
  );
}
