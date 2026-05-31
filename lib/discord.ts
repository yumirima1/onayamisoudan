import { publicWishLabel, urgencyLabel } from "@/lib/displayLabels";
import type { Urgency } from "@/lib/types";

type NewPostDiscordNotification = {
  title: string;
  category: string;
  urgency: Urgency;
  allowPublic: boolean;
  adminUrl: string;
};

export async function notifyDiscordNewPost({
  title,
  category,
  urgency,
  allowPublic,
  adminUrl
}: NewPostDiscordNotification) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "よるの相談箱",
      embeds: [
        {
          title: "新しい相談が届きました",
          color: urgency === "risky" ? 0xf59e0b : 0x60a5fa,
          fields: [
            {
              name: "タイトル",
              value: title,
              inline: false
            },
            {
              name: "カテゴリ",
              value: category,
              inline: true
            },
            {
              name: "緊急度",
              value: urgencyLabel(urgency),
              inline: true
            },
            {
              name: "公開許可",
              value: publicWishLabel(allowPublic),
              inline: true
            },
            {
              name: "管理画面",
              value: adminUrl,
              inline: false
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`);
  }
}
