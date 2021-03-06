import {MigrationInterface, QueryRunner} from "typeorm";

export class Changes1614959239678 implements MigrationInterface {
    name = 'Changes1614959239678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `blockchainAddress` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `value`");
        await queryRunner.query("ALTER TABLE `asset` ADD `value` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `value`");
        await queryRunner.query("ALTER TABLE `asset` ADD `value` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `blockchainAddress`");
    }

}
