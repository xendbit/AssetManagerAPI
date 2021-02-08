import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAssets1612793436327 implements MigrationInterface {
    name = 'UserAssets1612793436327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `userAssets` ADD `asset_id` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `IDX_566a62726801d589ff4b0201c8` ON `userAssets` (`asset_id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_566a62726801d589ff4b0201c8` ON `userAssets`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `userAssets` DROP COLUMN `asset_id`");
    }

}
