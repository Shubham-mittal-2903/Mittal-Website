-- CreateEnum
CREATE TYPE "JaydenMemoryTier" AS ENUM ('MEDIUM', 'LONG');

-- CreateTable
CREATE TABLE "JaydenMemory" (
    "id" TEXT NOT NULL,
    "tier" "JaydenMemoryTier" NOT NULL DEFAULT 'MEDIUM',
    "content" TEXT NOT NULL,
    "category" TEXT,
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JaydenMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JaydenMemory_tier_idx" ON "JaydenMemory"("tier");

-- CreateIndex
CREATE INDEX "JaydenMemory_expiresAt_idx" ON "JaydenMemory"("expiresAt");
