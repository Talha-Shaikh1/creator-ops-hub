import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to get PKT date
function getPKTDateString() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(new Date());
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day}`;
}

async function main() {
  console.log("Seeding CreatorOps Hub database with AI Content Operations Studio data...");

  // 1. System Settings
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {
      provider: "greenapi",
    },
    create: {
      id: "default",
      provider: "greenapi",
      whatsappPhone: "923121964939",
      callmebotApiKey: "123456",
      cronSecret: "creatorops_super_secret_cron_token_2025",
      startHourPKT: 14,
      endHourPKT: 23,
      appUrl: "http://localhost:3000",
    },
  });

  // 2. Gmail Accounts
  const g1 = await prisma.gmailAccount.upsert({
    where: { email: "talha.work@gmail.com" },
    update: {},
    create: {
      email: "talha.work@gmail.com",
      subscription: "Gemini Pro",
      renewalDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      browserProfile: "Profile 1",
      notes: "Primary AI creative workflow & video prompt engineering",
    },
  });

  const g2 = await prisma.gmailAccount.upsert({
    where: { email: "aayla.ops@gmail.com" },
    update: {},
    create: {
      email: "aayla.ops@gmail.com",
      subscription: "ChatGPT Plus",
      renewalDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      browserProfile: "Profile 2",
      notes: "Long-form script generation & viral hook ideation",
    },
  });

  const g3 = await prisma.gmailAccount.upsert({
    where: { email: "objitoon.creators@gmail.com" },
    update: {},
    create: {
      email: "objitoon.creators@gmail.com",
      subscription: "Free",
      browserProfile: "Profile 3",
      notes: "Connected to YouTube & Instagram creator portals",
    },
  });

  const g4 = await prisma.gmailAccount.upsert({
    where: { email: "backup.creative@gmail.com" },
    update: {},
    create: {
      email: "backup.creative@gmail.com",
      subscription: "Gemini Pro",
      renewalDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      browserProfile: "Profile 4",
      notes: "Secondary AI sandbox & image generation",
    },
  });

  // 3. Personas (Enhanced with Niche, Language, Visual Style, AI Prompts & Targets)
  const personas = [
    {
      name: "objitoon",
      assignedDay: 1, // Monday
      niche: "3D animation, comedic storytelling, satirical modern life observations",
      language: "English",
      targetAudience: "Global animation fans, Gen-Z / young millennials 16-30",
      visualStyle: "Pixar-quality 3D stylized character render, vibrant neon-accented lighting, crisp octane engine look",
      framePrompt: "Cinematic 3D animated character portrait of Objitoon, expressive mischievous smile, octane render, 8k vertical --ar 9:16",
      masterVideoPrompt: "Dynamic 3D stylized character speaking with exaggerated comedic gestures and fluid eye movements, 4k 60fps vertical",
      weeklyReelsTarget: 3,
      weeklyFeedTarget: 4,
      dailyStoriesTarget: 5,
      youtubeHandle: "@ObjitoonOfficial",
      youtubeUrl: "https://youtube.com/@ObjitoonOfficial",
      instaHandle: "@objitoon",
      instaUrl: "https://instagram.com/objitoon",
      tiktokHandle: "@objitoon.fun",
      tiktokUrl: "https://tiktok.com/@objitoon.fun",
      facebookHandle: "Objitoon Animation",
      facebookUrl: "https://facebook.com/ObjitoonAnimation",
      gmailAccountId: g3.id,
    },
    {
      name: "aayla.khan.uk",
      assignedDay: 2, // Tuesday
      niche: "Relationships + high-value mindset, emotional intelligence, UK/Europe audience",
      language: "English",
      targetAudience: "UK & European young professionals, ambitious women 20-35",
      visualStyle: "Warm cinematic, soft muted luxury tones, clean London street and cafe backdrop, 85mm portrait bokeh",
      framePrompt: "Editorial photorealistic portrait of Aayla Khan UK, tailored camel coat over ivory knitwear, soft London afternoon light, 85mm f/1.4 --ar 9:16",
      masterVideoPrompt: "Cinematic vertical video of elegant woman calmly delivering high-value mindset monologue with subtle breathing and natural micro-expressions",
      weeklyReelsTarget: 3,
      weeklyFeedTarget: 4,
      dailyStoriesTarget: 5,
      youtubeHandle: "@AaylaKhanUK",
      youtubeUrl: "https://youtube.com/@AaylaKhanUK",
      instaHandle: "@aayla.khan.uk",
      instaUrl: "https://instagram.com/aayla.khan.uk",
      tiktokHandle: "@aayla_uk",
      tiktokUrl: "https://tiktok.com/@aayla_uk",
      facebookHandle: "Aayla Khan UK",
      facebookUrl: "https://facebook.com/AaylaKhanUK",
      gmailAccountId: g2.id,
    },
    {
      name: "aayla.khan.pak",
      assignedDay: 3, // Wednesday
      niche: "Relationships + desi social pressure, self-respect & mental peace, Pakistan/India audience",
      language: "Roman Urdu / Hinglish",
      targetAudience: "Pakistani & South Asian youth 18-32, students & newlyweds balancing culture and freedom",
      visualStyle: "Warm amber ambient lighting, modern aesthetic ethnic silk kurtas, cozy rainy cafe & home library aesthetic",
      framePrompt: "Cinematic photorealistic portrait of Aayla Khan Pak in emerald green silk kurta with subtle gold detailing, warm indoor cafe lighting, 85mm f/1.4 --ar 9:16",
      masterVideoPrompt: "Realistic vertical video of South Asian creator speaking expressive emotional dialogue in Roman Urdu with natural hand gestures and direct eye contact",
      weeklyReelsTarget: 3,
      weeklyFeedTarget: 4,
      dailyStoriesTarget: 5,
      youtubeHandle: "@AaylaKhanPak",
      youtubeUrl: "https://youtube.com/@AaylaKhanPak",
      instaHandle: "@aayla.khan.pak",
      instaUrl: "https://instagram.com/aayla.khan.pak",
      tiktokHandle: "@aayla_pak",
      tiktokUrl: "https://tiktok.com/@aayla_pak",
      facebookHandle: "Aayla Khan Pakistan",
      facebookUrl: "https://facebook.com/AaylaKhanPakistan",
      gmailAccountId: g1.id,
    },
    {
      name: "zara.joe",
      assignedDay: 4, // Thursday
      niche: "Fashion aesthetic, luxury lifestyle, fitness and daily vlogs",
      language: "English",
      targetAudience: "Global fashion enthusiasts, fitness lovers 18-30",
      visualStyle: "High-contrast editorial lighting, clean minimalist neutrals, sunlit modern loft and studio aesthetic",
      framePrompt: "High-fashion streetstyle photo of Zara Joe, oversized structured blazer, clean hair, golden hour city glow, 35mm film aesthetic --ar 9:16",
      masterVideoPrompt: "Chic fashion creator speaking casually to camera in modern apartment, fluid gestures, natural daylight",
      weeklyReelsTarget: 3,
      weeklyFeedTarget: 4,
      dailyStoriesTarget: 5,
      youtubeHandle: "@ZaraJoeVlogs",
      youtubeUrl: "https://youtube.com/@ZaraJoeVlogs",
      instaHandle: "@zara.joe",
      instaUrl: "https://instagram.com/zara.joe",
      tiktokHandle: "@zarajoe",
      tiktokUrl: "https://tiktok.com/@zarajoe",
      facebookHandle: "Zara Joe Official",
      facebookUrl: "https://facebook.com/ZaraJoeOfficial",
      gmailAccountId: g1.id,
    },
    {
      name: "tech.pulse.hub",
      assignedDay: 5, // Friday
      niche: "AI tools breakdowns, future tech, productivity hacks",
      language: "English",
      targetAudience: "Tech enthusiasts, creators, AI builders",
      visualStyle: "Futuristic dark mode setup, moody teal & magenta neon backlighting",
      weeklyReelsTarget: 2,
      weeklyFeedTarget: 3,
      dailyStoriesTarget: 4,
      youtubeHandle: "@TechPulseHub",
      youtubeUrl: "https://youtube.com/@TechPulseHub",
      instaHandle: "@techpulsehub",
      instaUrl: "https://instagram.com/techpulsehub",
      tiktokHandle: "@techpulse",
      tiktokUrl: "https://tiktok.com/@techpulse",
      facebookHandle: "Tech Pulse Hub",
      facebookUrl: "https://facebook.com/TechPulseHub",
      gmailAccountId: g2.id,
    },
    {
      name: "daily.vibe.shorts",
      assignedDay: 6, // Saturday
      niche: "Viral relatable street interviews, lifestyle humor",
      language: "English",
      targetAudience: "Broad viral audience 15-28",
      visualStyle: "Bright outdoor street daylight, fast-paced camera framing",
      weeklyReelsTarget: 3,
      weeklyFeedTarget: 3,
      dailyStoriesTarget: 5,
      youtubeHandle: "@DailyVibeShorts",
      youtubeUrl: "https://youtube.com/@DailyVibeShorts",
      instaHandle: "@dailyvibeshorts",
      instaUrl: "https://instagram.com/dailyvibeshorts",
      tiktokHandle: "@dailyvibe",
      tiktokUrl: "https://tiktok.com/@dailyvibe",
      facebookHandle: "Daily Vibe Official",
      facebookUrl: "https://facebook.com/DailyVibeOfficial",
      gmailAccountId: g3.id,
    },
    {
      name: "weekly.rewind.club",
      assignedDay: 0, // Sunday
      niche: "Weekly pop culture recaps, viral drama summaries",
      language: "English",
      targetAudience: "Pop culture & internet trends fans",
      visualStyle: "Studio news-anchor style with split screens and green-screen overlays",
      weeklyReelsTarget: 2,
      weeklyFeedTarget: 3,
      dailyStoriesTarget: 4,
      youtubeHandle: "@WeeklyRewindClub",
      youtubeUrl: "https://youtube.com/@WeeklyRewindClub",
      instaHandle: "@weeklyrewind",
      instaUrl: "https://instagram.com/weeklyrewind",
      tiktokHandle: "@weeklyrewind",
      tiktokUrl: "https://tiktok.com/@weeklyrewind",
      facebookHandle: "Weekly Rewind Club",
      facebookUrl: "https://facebook.com/WeeklyRewindClub",
      gmailAccountId: g4.id,
    },
  ];

  for (const p of personas) {
    await prisma.persona.upsert({
      where: { name: p.name },
      update: p,
      create: p,
    });
  }

  // 4. Initial Daily Upload for Today
  const todayStr = getPKTDateString();
  const pktDate = new Date();
  const pktDay = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    weekday: "short",
  }).format(pktDate);

  const dayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const todayDayOfWeek = dayMap[pktDay] ?? 1;

  const todayPersona = await prisma.persona.findFirst({
    where: { assignedDay: todayDayOfWeek },
  });

  if (todayPersona) {
    await prisma.dailyUpload.upsert({
      where: {
        date_personaId: {
          date: todayStr,
          personaId: todayPersona.id,
        },
      },
      update: {},
      create: {
        date: todayStr,
        personaId: todayPersona.id,
        videoTitle: "The Psychological Power of Emotional Sovereignty",
        notes: "35-45s vertical reel + 4:5 carousel + 5 daily stories pack",
        feedPostsCount: 1,
        storiesCount: 3,
      },
    });
  }

  console.log("Database seeded successfully with AI Content Operations Studio setup!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
