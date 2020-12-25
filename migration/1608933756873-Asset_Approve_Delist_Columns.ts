import {MigrationInterface, QueryRunner} from "typeorm";

export class AssetApproveDelistColumns1608933756873 implements MigrationInterface {
    name = 'AssetApproveDelistColumns1608933756873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `approved` `approved` tinyint(1) NOT NULL");
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `delisted` `delisted` tinyint(1) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `delisted` `delisted` tinyint(4) NOT NULL");
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `approved` `approved` tinyint(4) NOT NULL");
    }

}
