CREATE TYPE "user_role" AS ENUM ('admin', 'client');
CREATE TYPE "review_status" AS ENUM ('new', 'processing', 'done');

CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"company_id" uuid REFERENCES "companies"("id")
);

CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL REFERENCES "companies"("id"),
	"name" text NOT NULL,
	"address" text NOT NULL
);

CREATE TABLE "daily_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL REFERENCES "branches"("id"),
	"day" date NOT NULL,
	"card_views" integer NOT NULL,
	"site_clicks" integer NOT NULL,
	"calls" integer NOT NULL,
	"routes_built" integer NOT NULL,
	"avg_rating" numeric(3, 2) NOT NULL,
	"reviews_count" integer NOT NULL,
	CONSTRAINT "daily_metrics_branch_day" UNIQUE ("branch_id", "day")
);

CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branch_id" uuid NOT NULL REFERENCES "branches"("id"),
	"author_name" text NOT NULL,
	"rating" integer NOT NULL,
	"body" text NOT NULL,
	"status" "review_status" DEFAULT 'new' NOT NULL,
	"published_at" timestamptz NOT NULL
);

CREATE INDEX "branches_company_id_idx" ON "branches" ("company_id");
CREATE INDEX "daily_metrics_branch_day_idx" ON "daily_metrics" ("branch_id", "day");
CREATE INDEX "reviews_branch_status_idx" ON "reviews" ("branch_id", "status");
