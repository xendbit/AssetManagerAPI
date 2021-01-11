import {MigrationInterface, QueryRunner} from "typeorm";

export class ProvidusUserDetails1610285860011 implements MigrationInterface {
    name = 'ProvidusUserDetails1610285860011'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `bvn` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `firstName` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `middleName` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `lastName` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `lastName`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `middleName`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `firstName`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `bvn`");
    }

}
