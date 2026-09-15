import { getPKTTimeString } from "./time";

export interface ReminderData {
  brandName: string;
  youtubeDone: boolean;
  instaDone: boolean;
  tiktokDone: boolean;
  facebookDone: boolean;
  appUrl: string;
  currentTimeStr?: string;
}

export function formatWhatsAppMessage(data: ReminderData): string {
  const time = data.currentTimeStr || getPKTTimeString();
  const ytStatus = data.youtubeDone ? "✅" : "❌";
  const instaStatus = data.instaDone ? "✅" : "❌";
  const tiktokStatus = data.tiktokDone ? "✅" : "❌";
  const fbStatus = data.facebookDone ? "✅" : "❌";

  return `🔔 *CreatorOps Alert (PKT Time: ${time})*
━━━━━━━━━━━━━━━━━━
Bhai! Aaj *${data.brandName}* ki bari hai video upload karne ki!

📊 *Status:*
${ytStatus} YouTube
${instaStatus} Instagram
${tiktokStatus} TikTok
${fbStatus} Facebook

🔗 Open Dashboard to mark done:
${data.appUrl}
━━━━━━━━━━━━━━━━━━`;
}

export async function sendWhatsAppAlert({
  phone,
  apiKey,
  message,
}: {
  phone: string;
  apiKey: string;
  message: string;
}): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      return { success: false, error: "Invalid WhatsApp phone number" };
    }
    if (!apiKey) {
      return { success: false, error: "CallMeBot API Key is missing" };
    }

    const encodedText = encodeURIComponent(message);
    const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedText}&apikey=${encodeURIComponent(
      apiKey
    )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "CreatorOps-Hub/1.0",
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      return {
        success: false,
        error: `CallMeBot HTTP ${response.status}: ${responseText.slice(0, 100)}`,
      };
    }

    return {
      success: true,
      data: responseText,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
