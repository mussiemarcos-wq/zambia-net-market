CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" TEXT,
    "category_slug" TEXT,
    "min_price" DECIMAL(12,2),
    "max_price" DECIMAL(12,2),
    "location" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_notified" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "saved_searches_user_id_is_active_idx" ON "saved_searches"("user_id", "is_active");
