-- CreateTable
CREATE TABLE IF NOT EXISTS "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
    "annualPrice" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "features" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Product_name_key" ON "Product"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Product_planType_key" ON "Product"("planType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_planType_idx" ON "Product"("planType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_isActive_idx" ON "Product"("isActive");
