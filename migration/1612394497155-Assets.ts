import {MigrationInterface, QueryRunner} from "typeorm";

export class Assets1612394497155 implements MigrationInterface {
    name = 'Assets1612394497155'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` ADD `issuerIsSeller` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `issuerIsSeller`");
    }

}
