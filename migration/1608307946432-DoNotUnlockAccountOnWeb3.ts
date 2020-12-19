import {MigrationInterface, QueryRunner} from "typeorm";

export class DoNotUnlockAccountOnWeb31608307946432 implements MigrationInterface {
    name = 'DoNotUnlockAccountOnWeb31608307946432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `user_idx` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `privateKey`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `address`");
        await queryRunner.query("CREATE UNIQUE INDEX `user_idx` ON `user` (`email`, `passphrase`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `user_idx` ON `user`");
        await queryRunner.query("ALTER TABLE `user` ADD `address` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `user` ADD `privateKey` varchar(255) NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `user_idx` ON `user` (`email`, `address`)");
    }

}
