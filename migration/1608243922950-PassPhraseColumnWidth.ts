import {MigrationInterface, QueryRunner} from "typeorm";

export class PassPhraseColumnWidth1608243922950 implements MigrationInterface {
    name = 'PassPhraseColumnWidth1608243922950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `user_idx` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `userId`");
        await queryRunner.query("ALTER TABLE `user` ADD `passphrase` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `email` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `privateKey` `privateKey` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `password` `password` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `address` `address` varchar(255) NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `user_idx` ON `user` (`email`, `address`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `user_idx` ON `user`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `address` `address` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `password` `password` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `privateKey` `privateKey` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `email`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `passphrase`");
        await queryRunner.query("ALTER TABLE `user` ADD `userId` int NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `user_idx` ON `user` (`userId`, `address`)");
    }

}
