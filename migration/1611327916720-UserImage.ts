import {MigrationInterface, QueryRunner} from "typeorm";

export class UserImage1611327916720 implements MigrationInterface {
    name = 'UserImage1611327916720'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `asset` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `asset` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `imageUrl`");
    }

}
