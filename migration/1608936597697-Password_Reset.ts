import {MigrationInterface, QueryRunner} from "typeorm";

export class PasswordReset1608936597697 implements MigrationInterface {
    name = 'PasswordReset1608936597697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `passwordReset` DROP COLUMN `expiry`");
        await queryRunner.query("ALTER TABLE `passwordReset` ADD `expiry` bigint NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `passwordReset` DROP COLUMN `expiry`");
        await queryRunner.query("ALTER TABLE `passwordReset` ADD `expiry` int NOT NULL");
    }

}
