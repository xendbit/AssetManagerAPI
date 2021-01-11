import {MigrationInterface, QueryRunner} from "typeorm";

export class UserNGNC1610363506241 implements MigrationInterface {
    name = 'UserNGNC1610363506241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `ngncAccountNumber` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `ngncAccountNumber`");
    }

}
