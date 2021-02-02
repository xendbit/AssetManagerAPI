import {MigrationInterface, QueryRunner} from "typeorm";

export class Assets1612272098162 implements MigrationInterface {
    name = 'Assets1612272098162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `asset` ADD `brokerId` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `userId` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `userId`");
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `brokerId`");
    }

}
