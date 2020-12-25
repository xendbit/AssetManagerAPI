import {MigrationInterface, QueryRunner} from "typeorm";

export class Admin1608931757569 implements MigrationInterface {
    name = 'Admin1608931757569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `admin` (`id` int NOT NULL AUTO_INCREMENT, `passphrase` varchar(255) NOT NULL, `email` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `firstName` varchar(255) NOT NULL, `lastName` varchar(255) NOT NULL, UNIQUE INDEX `admin_idx` (`email`, `passphrase`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `admin_idx` ON `admin`");
        await queryRunner.query("DROP TABLE `admin`");
    }

}
