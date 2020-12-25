import {MigrationInterface, QueryRunner} from "typeorm";

export class AssetApproveDelistColumns1608932683332 implements MigrationInterface {
    name = 'AssetApproveDelistColumns1608932683332'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` ADD `approved` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `tokenShares` ADD `delisted` tinyint NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` DROP COLUMN `delisted`");
        await queryRunner.query("ALTER TABLE `tokenShares` DROP COLUMN `approved`");
    }

}
