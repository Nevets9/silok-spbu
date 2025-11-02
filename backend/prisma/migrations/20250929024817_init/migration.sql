-- CreateTable
CREATE TABLE `GasStation` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `facilities` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
