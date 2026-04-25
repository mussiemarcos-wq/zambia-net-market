-- Add phone verification fields to users
ALTER TABLE "users" ADD COLUMN "is_phone_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "phone_verified_at" TIMESTAMP(3);

-- Create phone_verifications table
CREATE TABLE "phone_verifications" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified_at" TIMESTAMP(3),
    "ip_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "phone_verifications_phone_created_at_idx" ON "phone_verifications"("phone", "created_at" DESC);
CREATE INDEX "phone_verifications_expires_at_idx" ON "phone_verifications"("expires_at");
