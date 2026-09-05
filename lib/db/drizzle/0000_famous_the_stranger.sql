CREATE TYPE "public"."analysis_status" AS ENUM('draft', 'analyzing', 'ready', 'failed');--> statement-breakpoint
CREATE TABLE "analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"decision" text NOT NULL,
	"objective" text,
	"horizon" text DEFAULT '12 months' NOT NULL,
	"status" "analysis_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analyses_updated_at_idx" ON "analyses" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "analyses_status_idx" ON "analyses" USING btree ("status");