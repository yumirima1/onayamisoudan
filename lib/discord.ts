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
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();

    if (!webhookUrl) {
      return;
    }

    try {
      new URL(webhookUrl);
    } catch (error) {
      console.error("Invalid Discord webhook URL", error);
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
      console.error("Discord webhook failed", {
        status: response.status,
        statusText: response.statusText
      });
    }
  } catch (error) {
    console.error("Failed to send Discord new post notification", error);
  }
}
