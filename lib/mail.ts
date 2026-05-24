type SendReplyNotificationInput = {
  to: string;
  replyUrl: string;
};

type SendReplyNotificationResult =
  | {
      ok: true;
      sent: true;
      mocked: false;
    }
  | {
      ok: true;
      sent: false;
      mocked: true;
      reason: string;
    }
  | {
      ok: false;
      sent: false;
      mocked: false;
      error: string;
    };

export async function sendReplyNotificationEmail({ to, replyUrl }: SendReplyNotificationInput): Promise<SendReplyNotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!resendApiKey || !from) {
    return {
      ok: true,
      sent: false,
      mocked: true,
      reason: "RESEND_API_KEY または EMAIL_FROM が未設定のため、メールは実送信していません。"
    };
  }

  const text = [
    "よるの相談箱に返信が届きました。",
    "",
    "返信が届きました。以下の専用URLからサイトでご確認ください。",
    replyUrl,
    "",
    "この場所は医療・診断・治療ではありません。",
    "今すぐ危ない場合は、身近な人・学校・地域の相談窓口・緊急窓口に頼ってください。",
    "このURLを知っている人は返信を確認できます。他人に共有しないでください。"
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: "よるの相談箱に返信が届きました",
      text
    })
  });

  if (!response.ok) {
    return {
      ok: false,
      sent: false,
      mocked: false,
      error: "メール送信サービスでエラーが発生しました。"
    };
  }

  return {
    ok: true,
    sent: true,
    mocked: false
  };
}
