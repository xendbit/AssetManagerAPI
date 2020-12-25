import {MigrationInterface, QueryRunner} from "typeorm";

export class AssetApproveDelistColumns1608934360628 implements MigrationInterface {
    name = 'AssetApproveDelistColumns1608934360628'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` DROP COLUMN `listed`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` ADD `listed` tinyint(1) NOT NULL");
    }

}
