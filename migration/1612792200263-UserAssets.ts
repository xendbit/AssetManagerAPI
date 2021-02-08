import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAssets1612792200263 implements MigrationInterface {
    name = 'UserAssets1612792200263'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `IDX_7105dd54c82d6840a4f99a3003` ON `userAssets` (`user_id`)");
        await queryRunner.query("CREATE INDEX `IDX_566a62726801d589ff4b0201c8` ON `userAssets` (`asset_id`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_566a62726801d589ff4b0201c8` ON `userAssets`");
        await queryRunner.query("DROP INDEX `IDX_7105dd54c82d6840a4f99a3003` ON `userAssets`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

}
