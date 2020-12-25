import {MigrationInterface, QueryRunner} from "typeorm";

export class PasswordReset1608936459437 implements MigrationInterface {
    name = 'PasswordReset1608936459437'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `passwordReset` (`id` int NOT NULL AUTO_INCREMENT, `userId` int NOT NULL, `token` int NOT NULL, `expiry` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `passwordReset`");
    }

}
