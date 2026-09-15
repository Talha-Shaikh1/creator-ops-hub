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
  console.log("Seeding CreatorOps Hub database...");

  // 1. System Settings
  await prisma.systemSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      whatsappPhone: "923001234567",
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

  // 3. Personas (7-day rotation)
  const personas = [
    {
      name: "weekly.rewind.club",
      assignedDay: 0, // Sunday
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
    {
      name: "objitoon",
      assignedDay: 1, // Monday
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

  // Find today's assigned persona
  const todayDayOfWeek = new Date(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Karachi" }).format(pktDate)
  ).getDay();

  const activePersona = await prisma.persona.findFirst({
    where: { assignedDay: todayDayOfWeek },
  });

  if (activePersona) {
    await prisma.dailyUpload.upsert({
      where: {
        date_personaId: {
          date: todayStr,
          personaId: activePersona.id,
        },
      },
      update: {},
      create: {
        date: todayStr,
        personaId: activePersona.id,
        videoTitle: "Viral 3D Animation Hook: The Secret Room",
        notes: "Remember to add captions and link in the first pinned comment!",
        youtubeDone: true,
        instaDone: false,
        tiktokDone: false,
        facebookDone: false,
        allCompleted: false,
      },
    });
  }

  console.log("Database seeded successfully! Today in PKT is:", todayStr);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
