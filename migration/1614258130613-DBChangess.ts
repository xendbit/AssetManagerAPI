import {MigrationInterface, QueryRunner} from "typeorm";

export class DBChangess1614258130613 implements MigrationInterface {
    name = 'DBChangess1614258130613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `order` ADD `orderIsCancelled` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `phoneNumber` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `address` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `phone-number-idx` ON `user` (`phoneNumber`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `phone-number-idx` ON `user`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `address`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `phoneNumber`");
        await queryRunner.query("ALTER TABLE `order` DROP COLUMN `orderIsCancelled`");
    }

}
