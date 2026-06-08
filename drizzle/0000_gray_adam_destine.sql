CREATE TYPE "public"."example_item_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TABLE "example_items" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "example_items_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 0 NOT NULL,
	"status" "example_item_status" DEFAULT 'draft' NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
