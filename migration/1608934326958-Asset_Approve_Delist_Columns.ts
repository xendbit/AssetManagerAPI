import {MigrationInterface, QueryRunner} from "typeorm";

export class AssetApproveDelistColumns1608934326958 implements MigrationInterface {
    name = 'AssetApproveDelistColumns1608934326958'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `delisted` `listed` tinyint(1) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `listed` `delisted` tinyint(1) NOT NULL");
    }

}
