CREATE TABLE "bundle_patches" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"bundle_id" uuid NOT NULL,
	"base_bundle_id" uuid NOT NULL,
	"base_file_hash" text NOT NULL,
	"patch_file_hash" text NOT NULL,
	"patch_storage_uri" text NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bundles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"should_force_update" boolean NOT NULL,
	"enabled" boolean NOT NULL,
	"file_hash" text NOT NULL,
	"git_commit_hash" text,
	"message" text,
	"channel" text DEFAULT 'production' NOT NULL,
	"storage_uri" text NOT NULL,
	"target_app_version" text,
	"fingerprint_hash" text,
	"metadata" json DEFAULT '{}'::json NOT NULL,
	"rollout_cohort_count" integer DEFAULT 1000 NOT NULL,
	"target_cohorts" json,
	"manifest_storage_uri" text,
	"manifest_file_hash" text,
	"asset_base_storage_uri" text
);
--> statement-breakpoint
CREATE TABLE "private_hot_updater_settings" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"version" varchar(255) DEFAULT '0.31.0' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bundle_patches" ADD CONSTRAINT "bundle_patches_bundle_id_fk" FOREIGN KEY ("bundle_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
ALTER TABLE "bundle_patches" ADD CONSTRAINT "bundle_patches_base_bundle_id_fk" FOREIGN KEY ("base_bundle_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE restrict;--> statement-breakpoint
CREATE INDEX "bundle_patches_bundle_id_idx" ON "bundle_patches" USING btree ("bundle_id");--> statement-breakpoint
CREATE INDEX "bundle_patches_base_bundle_id_idx" ON "bundle_patches" USING btree ("base_bundle_id");--> statement-breakpoint
CREATE INDEX "bundles_target_app_version_idx" ON "bundles" USING btree ("target_app_version");--> statement-breakpoint
CREATE INDEX "bundles_fingerprint_hash_idx" ON "bundles" USING btree ("fingerprint_hash");--> statement-breakpoint
CREATE INDEX "bundles_channel_idx" ON "bundles" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "bundles_rollout_idx" ON "bundles" USING btree ("rollout_cohort_count");