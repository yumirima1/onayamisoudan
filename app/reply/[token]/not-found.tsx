export default function ReplyNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-5 sm:py-14">
      <div className="min-w-0 overflow-hidden rounded-lg border border-white/10 bg-night-card p-4 sm:p-6">
        <h1 className="break-words text-2xl font-semibold text-night-text">返信確認URLを確認できませんでした</h1>
        <p className="mt-4 break-words leading-8 text-night-muted">
          URLが間違っているか、古い確認URLの可能性があります。メールに記載されたURLをもう一度確認してください。
        </p>
        <p className="mt-4 break-words leading-8 text-night-muted">
          この場所は医療・診断・治療ではありません。今すぐ危ない場合は、身近な人・学校・地域の相談窓口・緊急窓口に頼ってください。
        </p>
      </div>
    </div>
  );
}
