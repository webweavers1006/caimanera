-- CreateTable
CREATE TABLE "_seeders" (
    "name" VARCHAR(100) NOT NULL,
    "ejecutado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "_seeders_pkey" PRIMARY KEY ("name")
);
