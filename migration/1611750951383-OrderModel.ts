import {MigrationInterface, QueryRunner} from "typeorm";

export class OrderModel1611750951383 implements MigrationInterface {
    name = 'OrderModel1611750951383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `orderDate`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `statusDate`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `order` ADD `statusDate` bigint NOT NULL");
        await queryRunner.query("ALTER TABLE `order` ADD `orderDate` bigint NOT NULL");
    }

}
