import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPKTDateString } from "@/lib/time";

export const dynamic = "force-dynamic";

interface GenerateRequest {
  personaId: string;
  date?: string;
  customTopic?: string;
  postType?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateRequest = await req.json();
    const { personaId, date = getPKTDateString(), customTopic, postType } = body;

    if (!personaId) {
      return NextResponse.json(
        { error: "personaId is required" },
        { status: 400 }
      );
    }

    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Check for Gemini API key in settings or env
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "default" },
    });
    const geminiKey = settings?.geminiApiKey || process.env.GEMINI_API_KEY;

    let generatedData = null;

    if (geminiKey) {
      try {
        generatedData = await generateWithGemini(persona, customTopic, postType, geminiKey);
      } catch (geminiError) {
        console.warn("Gemini generation failed, falling back to smart engine:", geminiError);
      }
    }

    if (!generatedData) {
      generatedData = generateWithSmartEngine(persona, customTopic, postType, date);
    }

    // Save to DailyContentPlan
    const savedPlan = await prisma.dailyContentPlan.upsert({
      where: {
        date_personaId: {
          date,
          personaId,
        },
      },
      create: {
        date,
        personaId,
        trendingTopic: generatedData.trendingTopic,
        trendingAudio: generatedData.trendingAudio,
        hook: generatedData.hook,
        reelScript: generatedData.reelScript,
        imagePostType: generatedData.imagePostType,
        imagePrompt: generatedData.imagePrompt,
        carouselSlides: JSON.stringify(generatedData.carouselSlides),
        storiesPlan: JSON.stringify(generatedData.storiesPlan),
        ytTitle: generatedData.ytTitle,
        ytDescription: generatedData.ytDescription,
        ytTags: generatedData.ytTags,
        tiktokCaption: generatedData.tiktokCaption,
        tiktokHashtags: generatedData.tiktokHashtags,
        instaCaption: generatedData.instaCaption,
        instaHashtags: generatedData.instaHashtags,
        facebookCaption: generatedData.facebookCaption,
        facebookHashtags: generatedData.facebookHashtags,
      },
      update: {
        trendingTopic: generatedData.trendingTopic,
        trendingAudio: generatedData.trendingAudio,
        hook: generatedData.hook,
        reelScript: generatedData.reelScript,
        imagePostType: generatedData.imagePostType,
        imagePrompt: generatedData.imagePrompt,
        carouselSlides: JSON.stringify(generatedData.carouselSlides),
        storiesPlan: JSON.stringify(generatedData.storiesPlan),
        ytTitle: generatedData.ytTitle,
        ytDescription: generatedData.ytDescription,
        ytTags: generatedData.ytTags,
        tiktokCaption: generatedData.tiktokCaption,
        tiktokHashtags: generatedData.tiktokHashtags,
        instaCaption: generatedData.instaCaption,
        instaHashtags: generatedData.instaHashtags,
        facebookCaption: generatedData.facebookCaption,
        facebookHashtags: generatedData.facebookHashtags,
      },
      include: { persona: true },
    });

    return NextResponse.json({
      success: true,
      plan: savedPlan,
      raw: generatedData,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Failed to generate content operations pack", details: errorMsg },
      { status: 500 }
    );
  }
}

async function generateWithGemini(
  persona: any,
  customTopic: string | undefined,
  requestedPostType: string | undefined,
  apiKey: string
) {
  const prompt = `You are an elite Daily Content Operations Director for AI influencer personas.
Persona details:
- Name: ${persona.name}
- Niche: ${persona.niche || "Lifestyle & Relationships"}
- Primary Language: ${persona.language || "English"} (CRITICAL: If Roman Urdu/Hinglish, write dialogues and hooks in authentic Roman Urdu like "Jab koi kahe ke...", if English write natural modern conversational English)
- Target Audience: ${persona.targetAudience || "Young adults 18-35"}
- Visual Aesthetic: ${persona.visualStyle || "Warm cinematic lighting, photorealistic modern minimal aesthetic"}
- Master Video Prompt Reference: ${persona.masterVideoPrompt || "Cinematic 4k vertical portrait, natural lighting"}
- Frame Prompt Reference: ${persona.framePrompt || "Photorealistic 8k portrait"}
${customTopic ? `- User Specified Focus Topic: ${customTopic}` : ""}
${requestedPostType ? `- Selected Image Post Type: ${requestedPostType}` : ""}

Return a strictly valid JSON object matching this schema:
{
  "trendingTopic": "High-engagement viral angle or relationship debate",
  "trendingAudio": "Exact viral audio recommendation name (e.g. 'JVKE - Golden Hour (Aesthetic Slowed) [Search on Reels/TikTok]')",
  "hook": "3-second scroll stopping hook with visual cue",
  "reelScript": "35-45 second spoken dialogue with timestamps [0:00-0:05], [0:05-0:18], [0:18-0:32], [0:32-0:42] in the persona's authentic language",
  "imagePostType": "${requestedPostType || "carousel (3-5 slides, 4:5 vertical)"}",
  "imagePrompt": "Complete Midjourney/Flux prompt with camera lens, lighting, and an outfit DISTINCTLY DIFFERENT from the reel outfit",
  "carouselSlides": [
    { "slide": 1, "title": "Cover Hook", "text": "Slide 1 overlay text", "visual": "Description of image/background" },
    { "slide": 2, "title": "The Conflict", "text": "Slide 2 overlay text", "visual": "Description of image" },
    { "slide": 3, "title": "The Twist", "text": "Slide 3 overlay text", "visual": "Description of image" },
    { "slide": 4, "title": "Actionable Insight", "text": "Slide 4 overlay text", "visual": "Description of image" },
    { "slide": 5, "title": "CTA", "text": "Slide 5 overlay text", "visual": "Description of image" }
  ],
  "storiesPlan": [
    { "storyNumber": 1, "type": "Morning Vibe", "caption": "Short morning thought", "sticker": "None" },
    { "storyNumber": 2, "type": "Interactive Poll", "caption": "Relatable dilemma", "sticker": "Poll: Agree or Disagree?" },
    { "storyNumber": 3, "type": "Reel Tease", "caption": "New drop is live... read carefully", "sticker": "Link / Tap Here" },
    { "storyNumber": 4, "type": "Behind The Scenes", "caption": "Candid reflection or mic clip", "sticker": "Slider" },
    { "storyNumber": 5, "type": "Evening Q&A", "caption": "Drop your thoughts below", "sticker": "Question Box" }
  ],
  "ytTitle": "SEO-optimised YouTube Shorts Title under 60 chars",
  "ytDescription": "1500+ char description with hook summary, timestamps, creator bio, related search queries, and 6 hashtags",
  "ytTags": "15 comma-separated high-ranking tags",
  "tiktokCaption": "Hook-first 1-2 line caption for TikTok with CTA",
  "tiktokHashtags": "5-6 high-volume hashtags",
  "instaCaption": "Story-driven high engagement caption for Instagram Reels with line breaks and CTA",
  "instaHashtags": "8-12 niche and viral hashtags",
  "facebookCaption": "Question-heavy discussion starter caption for Facebook to trigger long comment debates",
  "facebookHashtags": "3-5 Facebook hashtags"
}

Do not include markdown code block backticks. Return only valid JSON.`;

  const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-pro-latest"];
  let responseText = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) break;
      }
    } catch (e) {
      // try next model
    }
  }

  if (!responseText) {
    throw new Error("Gemini models could not be reached");
  }

  return JSON.parse(responseText);
}

function generateWithSmartEngine(
  persona: any,
  customTopic: string | undefined,
  requestedPostType: string | undefined,
  dateStr: string
) {
  const isRomanUrdu =
    (persona.language || "").toLowerCase().includes("urdu") ||
    (persona.language || "").toLowerCase().includes("hinglish") ||
    persona.name.includes("pak");

  const postTypes = [
    "carousel (3-5 slides, 4:5 vertical)",
    "casual candid",
    "OOTD / mirror photo",
    "podcast host / BTS",
    "aesthetic flatlay / coffee shop",
    "quote-over-photo",
    "photo dump",
  ];

  const selectedPostType =
    requestedPostType || postTypes[Math.abs(hashString(dateStr + persona.name)) % postTypes.length];

  if (isRomanUrdu) {
    // Desi / Roman Urdu Persona (e.g. aayla.khan.pak)
    const topic = customTopic || "Logon ki baatein aur Rishton ka pressure vs Apni Peace of Mind";
    
    return {
      trendingTopic: topic,
      trendingAudio: "Slowed Desi Lofi Instrumental / 'Tu Hai Kahan (Aesthetic Reverb)' [Trending on Reels]",
      hook: "👀 'Log kya kahenge?' — Yeh woh line hai jisne humari aadhe se zyada khushiyan cheen li hain.",
      reelScript: `[0:00-0:05] (Camera tight zoom, intense calm eye contact)
"Ek baat batao... aap kab tak logon ko khush karne ke chakkar mein apni peace of mind sacrifice karoge?"

[0:05-0:18] (Relaxed conversational gesture, looking slightly away then back)
"Desi society mein sab se bada masla yeh hai ke log tab tak khush nahi hotay jab tak aap unke standard ke mutabiq na jeeyo. Par sach yeh hai: Jo log aaj judge kar rahe hain, kal woh aapke bills nahi bharne aayenge."

[0:18-0:32] (Leaning forward slightly, confident tone)
"Jab maine boundary set karna shuru ki, sab ne bola 'attitude aa gaya hai'. Par asal mein yeh attitude nahi, self-respect thi jo saalon se dafan thi."

[0:32-0:45] (Direct smile, strong close)
"Stop explaining yourself to people who don't even understand themselves. Agar aap bhi is phase se guzar rahe ho, to comment mein 'REAL' likho aur yeh reel us dost ko bhejo jise yeh sunna chahiye!"`,
      imagePostType: selectedPostType,
      imagePrompt: `Cinematic 8k photorealistic portrait of ${persona.name}, elegant modern emerald green silk kurta with minimal gold embroidery (outfit strictly different from reel casual blazer), sitting by a cafe window overlooking rainy Lahore/Islamabad streets, soft amber warm lighting, 85mm f/1.4 lens bokeh, ultra-detailed facial texture, calm confident gaze --ar 4:5 --v 6.0 --style raw`,
      carouselSlides: [
        {
          slide: 1,
          title: "Cover Hook (4:5)",
          text: "4 Hard Truths jo har 20s ke insaan ko samajh leni chahiye 🥀",
          visual: "Moody aesthetic portrait with bold white typography and subtle dark overlay",
        },
        {
          slide: 2,
          title: "Truth #1: Expectations",
          text: "1. Kisi ko tabiyat se manana theek hai, par apni self-respect gira kar nahi.",
          visual: "Minimalist aesthetic coffee table with handwritten notebook",
        },
        {
          slide: 3,
          title: "Truth #2: Peace over Popularity",
          text: "2. Choti circle honi chahiye jahan sakoon ho, bheed nahi jo bas tamasha dekhe.",
          visual: "Candid walking shot on quiet evening street",
        },
        {
          slide: 4,
          title: "Truth #3: Timing",
          text: "3. Har kisi ka timeline alag hota hai. Dusron ki shadi ya success dekh kar apna sakoon mat khona.",
          visual: "Warm golden hour sunlight through window blinds",
        },
        {
          slide: 5,
          title: "Action CTA",
          text: "Save this post when you need a reminder 📌 Share with your inner circle.",
          visual: "Soft closing aesthetic frame with creator branding",
        },
      ],
      storiesPlan: [
        {
          storyNumber: 1,
          type: "Morning Vibe (8:00 AM)",
          caption: "Chai + Sakoon pehle, duniya ke maslay baad mein ☕✨ Good morning!",
          sticker: "Time Sticker",
        },
        {
          storyNumber: 2,
          type: "Interactive Poll (12:00 PM)",
          caption: "Quick question: Kya boundaries banana selfish hona hota hai?",
          sticker: "Poll: [Nahi, Zaroori hai] vs [Log bura maantay hain]",
        },
        {
          storyNumber: 3,
          type: "Reel Reshare Tease (3:30 PM)",
          caption: "Aaj ki reel bohot logon ko chubhegi... don't read the comment section 👀🔥 Link below!",
          sticker: "Watch Reel Button",
        },
        {
          storyNumber: 4,
          type: "Behind The Scenes (6:30 PM)",
          caption: "Scripting session notes 🎙️ Kuch naya plan ho raha hai for you guys.",
          sticker: "Heart Slider",
        },
        {
          storyNumber: 5,
          type: "Evening Q&A (9:30 PM)",
          caption: "Late night tea talk: Whats one boundary you set this year that changed your life?",
          sticker: "Question Box: 'Write here...'",
        },
      ],
      ytTitle: "Stop Sacrificing Your Peace For People 💔 #shorts",
      ytDescription: `Kab tak logon ki expectations ke peeche bhagoge? In this video, we break down why setting boundaries isn't selfish — it's survival. 

📌 CHAPTERS & HIGHLIGHTS:
0:00 The "Log Kya Kahenge" Trap
0:15 Why explaining yourself never works
0:35 The power of calm self-respect

🔔 Subscribe to @${persona.name} for daily mindset shifts, relationship truths, and authentic lifestyle insights.

🔗 Connect Across Platforms:
Instagram: instagram.com/${persona.name}
TikTok: tiktok.com/@${persona.name}
Facebook: facebook.com/${persona.name}

#MindsetMatters #DesiMindset #Boundaries #SelfRespect #MentalPeace #ViralShorts #AaylaKhan`,
      ytTags: "desi mindset, relationship advice, log kya kahenge, boundaries, self growth, urdu motivation, hinglish reels, mental peace, aesthetic lifestyle, toxic relationships, life lessons, personal growth, shorts, trending shorts, viral",
      tiktokCaption: "Stop explaining yourself to people who only want to misunderstand you 🥀 Save this reminder. #MindsetShift #DesiTok #Relatable #SelfRespect",
      tiktokHashtags: "#DesiMindset #UrduQuotes #MindsetShift #AaylaKhan #DeepThoughts #ViralReel",
      instaCaption: `Log tab tak aapko pasand karte hain jab tak aap unki marzi ke mutabiq chalte ho. The moment you start choosing your peace, they call it "attitude".

Lekin sach yeh hai ke apni boundaries protect karna koi gunah nahi hai. You owe yourself the same peace and kindness you give so freely to everyone else.

Agar yeh baat dil ko lagi ho to save zaroor karna 📌 Aur un doston ke sath share karo jinko aaj yeh sunne ki zaroorat hai.

Drop a '🤍' in the comments if you agree.`,
      instaHashtags: "#MindsetQuotes #DesiThoughts #UrduWriters #SelfLoveJourney #InnerPeace #MentalHealthMatters #AestheticVibes #RealTalk #PersonalGrowth #AaylaKhan",
      facebookCaption: "Sach batayen: Kya aapne kabhi kisi rishtey ya dosti mein sirf peace of mind ki khatir chup rehna pasand kia? Drop your perspective in the comments below 👇",
      facebookHashtags: "#RealTalk #DesiCommunity #Relationships #Mindset #SelfGrowth",
    };
  } else {
    // English / UK-Europe Persona (e.g. aayla.khan.uk, objitoon, zara.joe)
    const topic = customTopic || "Why High-Value People Never Chase: The Power of Detached Confidence";

    return {
      trendingTopic: topic,
      trendingAudio: "Montagem Mystic / 'Slow Down - Cinematic Ambient Lo-Fi' [Trending on IG Reels & TikTok]",
      hook: "🚨 The moment you stop chasing validation is the exact moment people start chasing yours.",
      reelScript: `[0:00-0:05] (Direct eye contact, sharp pause, low conversational tone)
"Here is the brutal psychology of why chasing people always destroys your leverage..."

[0:05-0:18] (Subtle turn, calm confident body language)
"When you over-explain, over-text, or over-accommodate, you are subconsciously signaling that their approval is worth more than your own standard. People value what is rare, not what is desperate."

[0:18-0:32] (Step slightly closer, grounded delivery)
"The most attractive trait in the room isn't loud perfection—it's complete emotional sovereignty. Knowing who you are without requiring a single person in the room to validate it."

[0:32-0:45] (Slight smile, decisive sign-off)
"Stop auditioning for roles in lives where you were meant to be the main character. If this hit home, save it and drop a ♟️ in the comments below."`,
      imagePostType: selectedPostType,
      imagePrompt: `Editorial portrait of ${persona.name}, wearing an oversized tailored camel wool coat over an ivory cashmere turtleneck (distinctly different outfit from video), standing in front of modern minimalist London architecture with glass reflections, soft overcast daylight, 35mm film grain aesthetic, high-fashion streetstyle, crisp 8k --ar 4:5 --v 6.0`,
      carouselSlides: [
        {
          slide: 1,
          title: "Cover Hook (4:5)",
          text: "5 Habits That Instantly Give You Unshakable Leverage ♟️",
          visual: "Moody editorial street shot with bold minimalist typography and high contrast",
        },
        {
          slide: 2,
          title: "Habit 1: Pausing Before Reacting",
          text: "1. The 3-Second Delay. Never react to provocation immediately. Silence creates unmatched psychological dominance.",
          visual: "Clean aesthetic portrait looking calmly into camera",
        },
        {
          slide: 3,
          title: "Habit 2: No Over-Explaining",
          text: "2. Eliminate Paragraph Justifications. A clear 'No, that doesn't work for me' requires zero defense.",
          visual: "Minimalist desktop flatlay with espresso and leather journal",
        },
        {
          slide: 4,
          title: "Habit 3: The Power of Walking Away",
          text: "3. Never negotiate your baseline boundaries. Your willingness to leave is your greatest superpower.",
          visual: "Candid walking away shot in city lighting",
        },
        {
          slide: 5,
          title: "Action CTA",
          text: "Bookmark this framework 📌 Share with someone mastering their mindset.",
          visual: "Closing branded card with signature icon",
        },
      ],
      storiesPlan: [
        {
          storyNumber: 1,
          type: "Morning Vibe (8:30 AM GMT)",
          caption: "Morning espresso + reviewing today's strategic goals ☕ Level up quietly.",
          sticker: "Aesthetic Time",
        },
        {
          storyNumber: 2,
          type: "Interactive Poll (1:00 PM)",
          caption: "Real question: What's harder—setting the boundary or maintaining it when they push back?",
          sticker: "Poll: [Setting it] vs [Maintaining it]",
        },
        {
          storyNumber: 3,
          type: "Reel Reshare Tease (4:00 PM)",
          caption: "Today's reel will make you rethink your entire communication strategy ♟️ Watch before it's buried.",
          sticker: "Tap to Watch",
        },
        {
          storyNumber: 4,
          type: "Behind The Scenes (7:00 PM)",
          caption: "Pre-recording lighting check 🎙️ What topics do you want covered next week?",
          sticker: "Slider",
        },
        {
          storyNumber: 5,
          type: "Evening Q&A (10:00 PM)",
          caption: "Nightly mindset check-in: Ask me 1 question about confidence or career dynamics.",
          sticker: "Question Box: 'Ask anything...'",
        },
      ],
      ytTitle: "Why High Value People NEVER Chase ♟️ #shorts",
      ytDescription: `The psychology of detachment: Learn why high-value confidence always wins over chasing validation.

Timestamps & Highlights:
0:00 The Subconscious Signals of Chasing
0:15 How Over-Accommodating Lowers Leverage
0:35 The 1 Mindset Shift That Changes Everything

Subscribe to @${persona.name} for daily high-performance psychology, relationship dynamics, and modern mindset insights.

Follow on Socials:
📸 Instagram: instagram.com/${persona.name}
🎵 TikTok: tiktok.com/@${persona.name}
📘 Facebook: facebook.com/${persona.name}

#Mindset #HighValue #Psychology #SelfRespect #PersonalDevelopment #Shorts #SuccessHabits`,
      ytTags: "high value habits, psychology hacks, confidence tips, self respect, stop chasing, relationship leverage, stoicism, modern mindset, dark psychology, personal development, uk creator, daily shorts, viral shorts, mindset shift",
      tiktokCaption: "Stop auditioning for people who don't deserve the ticket ♟️ Save this rule. #Mindset #HighValueHabits #Psychology #Confidence",
      tiktokHashtags: "#HighValueHabits #MindsetShift #ConfidenceHacks #PsychologyTips #StoicMindset #ForYou",
      instaCaption: `The moment you stop seeking external validation is the moment your presence becomes undeniable.

When you master the art of emotional detachment, you stop reacting to things that used to derail you. You don't need to shout to be heard, and you don't need to prove yourself to those committed to misunderstanding you.

Save this for when you need a mindset reset 📌
Drop a '♟️' if you're holding your standard this week.`,
      instaHashtags: "#MindsetShift #HighValueMindset #EmotionalIntelligence #StoicPhilosophy #SelfMastery #ExecutivePresence #ModernAesthetic #DeepWisdom #ConfidenceBuilding #AaylaKhan",
      facebookCaption: "Do you believe silence in an argument shows strength or weakness? Share your honest opinion in the comments below 👇",
      facebookHashtags: "#Mindset #PersonalGrowth #Debate #HighValue #SelfMastery",
    };
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
