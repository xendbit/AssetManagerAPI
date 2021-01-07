import {MigrationInterface, QueryRunner} from "typeorm";

export class Assets1610024517774 implements MigrationInterface {
    name = 'Assets1610024517774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `asset` ADD `market` int NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `asset` DROP COLUMN `market`");
    }

}
