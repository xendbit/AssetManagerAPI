import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAssets1613442096273 implements MigrationInterface {
    name = 'UserAssets1613442096273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `asset` ADD `marketPrice` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `marketPrice`");
    }

}
