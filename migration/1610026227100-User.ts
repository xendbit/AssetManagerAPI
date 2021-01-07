import {MigrationInterface, QueryRunner} from "typeorm";

export class User1610026227100 implements MigrationInterface {
    name = 'User1610026227100'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `role` int NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `role`");
    }

}
