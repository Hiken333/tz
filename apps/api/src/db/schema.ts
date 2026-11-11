import {
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "client"]);
export const reviewStatus = pgEnum("review_status", ["new", "processing", "done"]);

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  city: text("city").notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull(),
  companyId: uuid("company_id").references(() => companies.id),
});

export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
});

export const dailyMetrics = pgTable(
  "daily_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id),
    day: date("day").notNull(),
    cardViews: integer("card_views").notNull(),
    siteClicks: integer("site_clicks").notNull(),
    calls: integer("calls").notNull(),
    routesBuilt: integer("routes_built").notNull(),
    avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).notNull(),
    reviewsCount: integer("reviews_count").notNull(),
  },
  (table) => [unique("daily_metrics_branch_day").on(table.branchId, table.day)],
);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id),
  authorName: text("author_name").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  status: reviewStatus("status").notNull().default("new"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
});
