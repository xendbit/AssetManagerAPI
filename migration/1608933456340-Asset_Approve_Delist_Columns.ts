import {MigrationInterface, QueryRunner} from "typeorm";

export class AssetApproveDelistColumns1608933456340 implements MigrationInterface {
    name = 'AssetApproveDelistColumns1608933456340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `approved` `approved` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `delisted` `delisted` tinyint NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `delisted` `delisted` tinyint(1) NOT NULL");
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `approved` `approved` tinyint(1) NOT NULL");
    }

}
