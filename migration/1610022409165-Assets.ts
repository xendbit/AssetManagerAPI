import {MigrationInterface, QueryRunner} from "typeorm";

export class Assets1610022409165 implements MigrationInterface {
    name = 'Assets1610022409165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `price`");
        await queryRunner.query("ALTER TABLE `asset` ADD `price` int NOT NULL");
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `asset` ADD `createdOn` bigint(20) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `createdOn`");
        await queryRunner.query("ALTER TABLE `asset` ADD `createdOn` int(11) NOT NULL");
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `price`");
        await queryRunner.query("ALTER TABLE `asset` ADD `price` varchar(255) NOT NULL");
    }

}
