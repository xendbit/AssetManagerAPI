import {MigrationInterface, QueryRunner} from "typeorm";

export class Holiday1614095899873 implements MigrationInterface {
    name = 'Holiday1614095899873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `holiday` (`id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `day` int NOT NULL, `month` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("DROP TABLE `holiday`");
    }

}
