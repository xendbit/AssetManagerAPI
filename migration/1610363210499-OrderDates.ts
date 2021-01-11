import {MigrationInterface, QueryRunner} from "typeorm";

export class OrderDates1610363210499 implements MigrationInterface {
    name = 'OrderDates1610363210499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `orderDate`");
        await queryRunner.query("ALTER TABLE `order` ADD `orderDate` bigint(20) NOT NULL");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `statusDate`");
        await queryRunner.query("ALTER TABLE `order` ADD `statusDate` bigint(20) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `statusDate`");
        await queryRunner.query("ALTER TABLE `order` ADD `statusDate` int(11) NOT NULL");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `orderDate`");
        await queryRunner.query("ALTER TABLE `order` ADD `orderDate` int(11) NOT NULL");
    }

}
