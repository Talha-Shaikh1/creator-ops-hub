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

/**
 * Green-API WhatsApp Dispatcher (Zero-block, instant cloud instance)
 */
export async function sendGreenApiAlert({
  idInstance,
  apiToken,
  phone,
  message,
}: {
  idInstance: string;
  apiToken: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      return { success: false, error: "Invalid recipient phone number" };
    }
    if (!idInstance || !apiToken) {
      return {
        success: false,
        error: "Green-API idInstance and apiTokenInstance are required.",
      };
    }

    const url = `https://api.green-api.com/waInstance${idInstance.trim()}/sendMessage/${apiToken.trim()}`;
    const chatId = `${cleanPhone}@c.us`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId,
        message,
      }),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        error: resData.message || `Green-API HTTP ${res.status}`,
      };
    }

    return {
      success: true,
      data: JSON.stringify(resData),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMsg };
  }
}

/**
 * CallMeBot WhatsApp Dispatcher
 */
export async function sendCallMeBotAlert({
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
      apiKey.trim()
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

/**
 * Unified Dispatcher based on chosen Provider
 */
export async function sendWhatsAppNotification({
  provider = "greenapi",
  phone,
  callmebotApiKey,
  greenApiIdInstance,
  greenApiApiToken,
  message,
}: {
  provider?: string;
  phone: string;
  callmebotApiKey?: string | null;
  greenApiIdInstance?: string | null;
  greenApiApiToken?: string | null;
  message: string;
}) {
  if (provider === "greenapi") {
    if (!greenApiIdInstance || !greenApiApiToken) {
      return {
        success: false,
        error:
          "Green-API is selected, but idInstance or apiTokenInstance is missing in Settings.",
      };
    }
    return sendGreenApiAlert({
      idInstance: greenApiIdInstance,
      apiToken: greenApiApiToken,
      phone,
      message,
    });
  }

  return sendCallMeBotAlert({
    phone,
    apiKey: callmebotApiKey || "",
    message,
  });
}
