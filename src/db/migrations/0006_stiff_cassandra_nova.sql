CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"data" text DEFAULT '{}',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
