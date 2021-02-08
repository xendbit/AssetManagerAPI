import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAssets1612792573260 implements MigrationInterface {
    name = 'UserAssets1612792573260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_566a62726801d589ff4b0201c8` ON `userAssets`");
        await queryRunner.query("ALTER TABLE `userAssets` CHANGE `asset_id` `token_id` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `IDX_045984fe7d9e068c998036fce1` ON `userAssets` (`token_id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_045984fe7d9e068c998036fce1` ON `userAssets`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `userAssets` CHANGE `token_id` `asset_id` int NOT NULL");
        await queryRunner.query("CREATE INDEX `IDX_566a62726801d589ff4b0201c8` ON `userAssets` (`asset_id`)");
    }

}
