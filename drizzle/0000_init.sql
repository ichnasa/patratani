CREATE TYPE "public"."bid_status" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."commodity_category" AS ENUM('SAYURAN', 'BUAH', 'UMBI_UMBIAN', 'CABAI_BAWANG', 'BUMBU_REMPAH', 'BERAS_BIJI_BIJIAN', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."delivery_method" AS ENUM('SELF_PICKUP', 'FARMER_DELIVERY');--> statement-breakpoint
CREATE TYPE "public"."dispute_resolution" AS ENUM('RELEASE_TO_FARMER', 'REFUND_TO_BUYER');--> statement-breakpoint
CREATE TYPE "public"."market_post_type" AS ENUM('ETALASE_PANEN', 'TENDER_PERMINTAAN');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('OPEN', 'BIDDING', 'AWARDED', 'PAID_HELD', 'HANDOVER', 'COMPLETED', 'DISPUTED', 'CANCELED_H1');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('FARMER', 'BUYER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."wallet_transaction_type" AS ENUM('TOP_UP', 'ESCROW_HOLD', 'ESCROW_REFUND', 'PAYOUT_RELEASE', 'PLATFORM_COMMISSION', 'WITHDRAWAL');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "farmer_delivery_configs" (
	"user_id" text PRIMARY KEY NOT NULL,
	"is_delivery_enabled" boolean DEFAULT false NOT NULL,
	"min_capacity_kg" integer,
	"max_capacity_kg" integer,
	"max_radius_km" integer,
	"fixed_delivery_fee_idr" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "farmer_delivery_configs_enabled_complete" CHECK (not "farmer_delivery_configs"."is_delivery_enabled" or (
        "farmer_delivery_configs"."min_capacity_kg" is not null
        and "farmer_delivery_configs"."max_capacity_kg" is not null
        and "farmer_delivery_configs"."max_radius_km" is not null
        and "farmer_delivery_configs"."fixed_delivery_fee_idr" is not null
        and "farmer_delivery_configs"."min_capacity_kg" > 0
        and "farmer_delivery_configs"."max_capacity_kg" >= "farmer_delivery_configs"."min_capacity_kg"
        and "farmer_delivery_configs"."max_radius_km" > 0
        and "farmer_delivery_configs"."fixed_delivery_fee_idr" >= 0
      ))
);
--> statement-breakpoint
ALTER TABLE "farmer_delivery_configs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"role" "user_role" DEFAULT 'BUYER' NOT NULL,
	"business_name" text,
	"phone" text,
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"wallet_balance_idr" integer DEFAULT 0 NOT NULL,
	"rating_avg" double precision DEFAULT 0 NOT NULL,
	"rating_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_wallet_balance_non_negative" CHECK ("users"."wallet_balance_idr" >= 0),
	CONSTRAINT "users_rating_avg_range" CHECK ("users"."rating_avg" between 0 and 5)
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "verifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "bids" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"bidder_id" text NOT NULL,
	"weight_kg" integer NOT NULL,
	"offered_price_per_kg_idr" integer NOT NULL,
	"delivery_method" "delivery_method" DEFAULT 'SELF_PICKUP' NOT NULL,
	"delivery_fee_idr" integer DEFAULT 0 NOT NULL,
	"delivery_address" text,
	"delivery_latitude" double precision,
	"delivery_longitude" double precision,
	"distance_km" double precision,
	"notes" text,
	"status" "bid_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bids_weight_positive" CHECK ("bids"."weight_kg" > 0),
	CONSTRAINT "bids_price_positive" CHECK ("bids"."offered_price_per_kg_idr" > 0),
	CONSTRAINT "bids_self_pickup_free" CHECK ("bids"."delivery_method" <> 'SELF_PICKUP' or "bids"."delivery_fee_idr" = 0),
	CONSTRAINT "bids_delivery_fee_non_negative" CHECK ("bids"."delivery_fee_idr" >= 0)
);
--> statement-breakpoint
ALTER TABLE "bids" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "market_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" text NOT NULL,
	"type" "market_post_type" NOT NULL,
	"title" text NOT NULL,
	"commodity_name" text NOT NULL,
	"category" "commodity_category" NOT NULL,
	"description" text,
	"image_urls" text[] DEFAULT '{}'::text[] NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"total_quota_kg" integer NOT NULL,
	"remaining_quota_kg" integer NOT NULL,
	"min_order_kg" integer DEFAULT 10 NOT NULL,
	"price_per_kg_idr" integer NOT NULL,
	"harvest_or_needed_date" timestamp with time zone NOT NULL,
	"bidding_deadline" timestamp with time zone,
	"is_open" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "market_posts_quota_bounds" CHECK ("market_posts"."remaining_quota_kg" >= 0 and "market_posts"."remaining_quota_kg" <= "market_posts"."total_quota_kg"),
	CONSTRAINT "market_posts_min_order" CHECK ("market_posts"."min_order_kg" > 0 and "market_posts"."min_order_kg" <= "market_posts"."total_quota_kg"),
	CONSTRAINT "market_posts_price_positive" CHECK ("market_posts"."price_per_kg_idr" > 0),
	CONSTRAINT "market_posts_tender_deadline" CHECK ("market_posts"."type" <> 'TENDER_PERMINTAAN' or "market_posts"."bidding_deadline" is not null)
);
--> statement-breakpoint
ALTER TABLE "market_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "disputes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"opened_by_user_id" text NOT NULL,
	"reason" text NOT NULL,
	"evidence_urls" text[] DEFAULT '{}'::text[] NOT NULL,
	"resolution" "dispute_resolution",
	"admin_notes" text,
	"resolved_by_admin_id" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "disputes_order_id_unique" UNIQUE("order_id"),
	CONSTRAINT "disputes_resolution_complete" CHECK (("disputes"."resolution" is null) = ("disputes"."resolved_at" is null))
);
--> statement-breakpoint
ALTER TABLE "disputes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "handover_evidences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"uploaded_by_user_id" text NOT NULL,
	"uploaded_by_role" "user_role" NOT NULL,
	"storage_path" text NOT NULL,
	"photo_url" text NOT NULL,
	"captured_latitude" double precision NOT NULL,
	"captured_longitude" double precision NOT NULL,
	"captured_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "handover_evidences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_code" text NOT NULL,
	"post_id" uuid NOT NULL,
	"bid_id" uuid NOT NULL,
	"farmer_id" text NOT NULL,
	"buyer_id" text NOT NULL,
	"status" "order_status" DEFAULT 'AWARDED' NOT NULL,
	"fixed_weight_kg" integer NOT NULL,
	"agreed_price_per_kg_idr" integer NOT NULL,
	"delivery_method" "delivery_method" NOT NULL,
	"subtotal_harvest_idr" integer NOT NULL,
	"delivery_fee_idr" integer DEFAULT 0 NOT NULL,
	"total_escrow_held_idr" integer NOT NULL,
	"platform_commission_idr" integer NOT NULL,
	"net_farmer_payout_idr" integer NOT NULL,
	"is_h1_confirmed" boolean,
	"h1_notes" text,
	"h1_confirmed_at" timestamp with time zone,
	"farmer_confirmed_complete" boolean DEFAULT false NOT NULL,
	"buyer_confirmed_complete" boolean DEFAULT false NOT NULL,
	"paid_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_code_unique" UNIQUE("order_code"),
	CONSTRAINT "orders_bid_id_unique" UNIQUE("bid_id"),
	CONSTRAINT "orders_weight_positive" CHECK ("orders"."fixed_weight_kg" > 0),
	CONSTRAINT "orders_subtotal_math" CHECK ("orders"."subtotal_harvest_idr" = "orders"."fixed_weight_kg" * "orders"."agreed_price_per_kg_idr"),
	CONSTRAINT "orders_escrow_math" CHECK ("orders"."total_escrow_held_idr" = "orders"."subtotal_harvest_idr" + "orders"."delivery_fee_idr"),
	CONSTRAINT "orders_payout_math" CHECK ("orders"."net_farmer_payout_idr" = "orders"."subtotal_harvest_idr" - "orders"."platform_commission_idr" + "orders"."delivery_fee_idr"),
	CONSTRAINT "orders_self_pickup_free" CHECK ("orders"."delivery_method" <> 'SELF_PICKUP' or "orders"."delivery_fee_idr" = 0),
	CONSTRAINT "orders_distinct_parties" CHECK ("orders"."farmer_id" <> "orders"."buyer_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"reviewer_id" text NOT NULL,
	"reviewee_id" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_one_per_reviewer_per_order" UNIQUE("order_id","reviewer_id"),
	CONSTRAINT "reviews_rating_range" CHECK ("reviews"."rating" between 1 and 5),
	CONSTRAINT "reviews_not_self" CHECK ("reviews"."reviewer_id" <> "reviews"."reviewee_id")
);
--> statement-breakpoint
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wallet_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"order_id" uuid,
	"type" "wallet_transaction_type" NOT NULL,
	"amount_idr" integer NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farmer_delivery_configs" ADD CONSTRAINT "farmer_delivery_configs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_post_id_market_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."market_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_users_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_posts" ADD CONSTRAINT "market_posts_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_opened_by_user_id_users_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_resolved_by_admin_id_users_id_fk" FOREIGN KEY ("resolved_by_admin_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handover_evidences" ADD CONSTRAINT "handover_evidences_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "handover_evidences" ADD CONSTRAINT "handover_evidences_uploaded_by_user_id_users_id_fk" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_post_id_market_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."market_posts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_bid_id_bids_id_fk" FOREIGN KEY ("bid_id") REFERENCES "public"."bids"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_farmer_id_users_id_fk" FOREIGN KEY ("farmer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewee_id_users_id_fk" FOREIGN KEY ("reviewee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "bids_post_id_status_idx" ON "bids" USING btree ("post_id","status");--> statement-breakpoint
CREATE INDEX "bids_bidder_id_idx" ON "bids" USING btree ("bidder_id");--> statement-breakpoint
CREATE UNIQUE INDEX "bids_one_pending_per_bidder" ON "bids" USING btree ("post_id","bidder_id") WHERE "bids"."status" = 'PENDING';--> statement-breakpoint
CREATE INDEX "market_posts_creator_id_idx" ON "market_posts" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "market_posts_browse_idx" ON "market_posts" USING btree ("type","is_open","category");--> statement-breakpoint
CREATE INDEX "market_posts_created_at_idx" ON "market_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "disputes_unresolved_idx" ON "disputes" USING btree ("created_at") WHERE "disputes"."resolution" is null;--> statement-breakpoint
CREATE INDEX "handover_evidences_order_id_idx" ON "handover_evidences" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_farmer_id_status_idx" ON "orders" USING btree ("farmer_id","status");--> statement-breakpoint
CREATE INDEX "orders_buyer_id_status_idx" ON "orders" USING btree ("buyer_id","status");--> statement-breakpoint
CREATE INDEX "orders_post_id_idx" ON "orders" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "reviews_reviewee_id_idx" ON "reviews" USING btree ("reviewee_id");--> statement-breakpoint
CREATE INDEX "wallet_transactions_user_id_idx" ON "wallet_transactions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "wallet_transactions_order_id_idx" ON "wallet_transactions" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallet_transactions_once_per_order" ON "wallet_transactions" USING btree ("order_id","type",coalesce("user_id", '')) WHERE "wallet_transactions"."order_id" is not null;