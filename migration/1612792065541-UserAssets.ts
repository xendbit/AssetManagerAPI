import {MigrationInterface, QueryRunner} from "typeorm";

export class UserAssets1612792065541 implements MigrationInterface {
    name = 'UserAssets1612792065541'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `userAssets` (`id` int NOT NULL AUTO_INCREMENT, `user_id` int NOT NULL, `asset_id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("DROP TABLE `userAssets`");
    }

}
