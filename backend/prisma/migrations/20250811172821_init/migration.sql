-- CreateTable
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE "public"."KmlLayer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "properties" JSONB,
    "geom" geometry NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KmlLayer_pkey" PRIMARY KEY ("id")
);
