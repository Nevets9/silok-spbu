/*
  Warnings:

  - Added the required column `mapsUrl` to the `GasStation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `gasstation` ADD COLUMN `mapsUrl` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
