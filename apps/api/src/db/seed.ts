import { eq } from "drizzle-orm";
import { db, queryClient } from "./client";
import { branches, companies, dailyMetrics, reviews, users } from "./schema";

const COMPANY_NORTH = "11111111-1111-4111-8111-111111111111";
const COMPANY_CLINIC = "22222222-2222-4222-8222-222222222222";
const BRANCH_NEVSKY = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1";
const BRANCH_VASILEO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2";
const BRANCH_LITEYNY = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1";
const ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const CLIENT_ID = "00000000-0000-4000-8000-000000000002";

function isoDay(daysAgo: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function wave(seed: number, day: number, base: number, spread: number) {
  const swing = Math.sin((day + seed) / 4.2) * spread;
  const weekend = day % 7 === 0 || day % 7 === 6 ? -spread * 0.25 : spread * 0.1;
  return Math.max(0, Math.round(base + swing + weekend));
}

async function seed() {
  const adminHash = await Bun.password.hash("admin-demo");
  const clientHash = await Bun.password.hash("client-demo");

  await db
    .insert(companies)
    .values([
      { id: COMPANY_NORTH, name: "Северный берег", city: "Санкт-Петербург" },
      { id: COMPANY_CLINIC, name: "Тихий ход", city: "Санкт-Петербург" },
    ])
    .onConflictDoNothing();

  await db
    .insert(users)
    .values([
      {
        id: ADMIN_ID,
        email: "admin@istinny.example",
        name: "Алина Короткова",
        passwordHash: adminHash,
        role: "admin",
        companyId: null,
      },
      {
        id: CLIENT_ID,
        email: "marina@sever.example",
        name: "Марина Северская",
        passwordHash: clientHash,
        role: "client",
        companyId: COMPANY_NORTH,
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(branches)
    .values([
      {
        id: BRANCH_NEVSKY,
        companyId: COMPANY_NORTH,
        name: "Невский",
        address: "Невский проспект, 12",
      },
      {
        id: BRANCH_VASILEO,
        companyId: COMPANY_NORTH,
        name: "Васильевский",
        address: "6-я линия В.О., 8",
      },
      {
        id: BRANCH_LITEYNY,
        companyId: COMPANY_CLINIC,
        name: "Литейный",
        address: "Литейный проспект, 44",
      },
    ])
    .onConflictDoNothing();

  const branchSeeds = [
    { id: BRANCH_NEVSKY, seed: 3 },
    { id: BRANCH_VASILEO, seed: 9 },
    { id: BRANCH_LITEYNY, seed: 17 },
  ];

  const metricRows = branchSeeds.flatMap(({ id, seed }) =>
    Array.from({ length: 90 }, (_, day) => {
      const cardViews = wave(seed, day, 240 + seed * 8, 90);
      const siteClicks = wave(seed + 1, day, 38 + seed, 14);
      const calls = wave(seed + 2, day, 22 + seed / 2, 9);
      const routesBuilt = wave(seed + 3, day, 31 + seed, 12);
      const avg = 3.6 + ((seed + day) % 12) / 20;
      return {
        branchId: id,
        day: isoDay(89 - day),
        cardViews,
        siteClicks,
        calls,
        routesBuilt,
        avgRating: avg.toFixed(2),
        reviewsCount: wave(seed + 4, day, 3, 2),
      };
    }),
  );

  await db.delete(dailyMetrics);
  await db.insert(dailyMetrics).values(metricRows);

  const reviewTemplates = [
    {
      branchId: BRANCH_NEVSKY,
      authorName: "Павел",
      rating: 5,
      body: "На карте нашли быстро, внутри очередь двигалась.",
      status: "done" as const,
      daysAgo: 2,
    },
    {
      branchId: BRANCH_NEVSKY,
      authorName: "Ольга",
      rating: 3,
      body: "Маршрут в навигаторе вёл ко второму входу, который закрыт.",
      status: "processing" as const,
      daysAgo: 5,
    },
    {
      branchId: BRANCH_VASILEO,
      authorName: "Игорь",
      rating: 4,
      body: "Телефон с карточки ответили с третьего гудка.",
      status: "new" as const,
      daysAgo: 1,
    },
    {
      branchId: BRANCH_VASILEO,
      authorName: "Наталья",
      rating: 2,
      body: "На Яндекс Картах до сих пор старые часы работы.",
      status: "new" as const,
      daysAgo: 8,
    },
    {
      branchId: BRANCH_LITEYNY,
      authorName: "Сергей",
      rating: 5,
      body: "Отделение легко найти по табличке у калитки.",
      status: "done" as const,
      daysAgo: 3,
    },
    {
      branchId: BRANCH_LITEYNY,
      authorName: "Елена",
      rating: 1,
      body: "Построили маршрут не к той клинике на соседней улице.",
      status: "processing" as const,
      daysAgo: 6,
    },
  ];

  await db.delete(reviews);
  await db.insert(reviews).values(
    reviewTemplates.map((review) => ({
      branchId: review.branchId,
      authorName: review.authorName,
      rating: review.rating,
      body: review.body,
      status: review.status,
      publishedAt: new Date(Date.now() - review.daysAgo * 86400000),
    })),
  );

  const companyCount = await db.select({ id: companies.id }).from(companies);
  const userCount = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "marina@sever.example"));
  console.log(
    `seed complete: ${companyCount.length} companies, client exists=${userCount.length > 0}`,
  );
}

await seed();
await queryClient.end();
