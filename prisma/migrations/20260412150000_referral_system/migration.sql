ALTER TABLE "users" ADD COLUMN "referral_code" TEXT;
ALTER TABLE "users" ADD COLUMN "referred_by" TEXT;
ALTER TABLE "users" ADD COLUMN "referral_count" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "users_referral_code_key" ON "users"("referral_code");
