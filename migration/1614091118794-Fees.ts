import {MigrationInterface, QueryRunner} from "typeorm";

export class Fees1614091118794 implements MigrationInterface {
    name = 'Fees1614091118794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `fees` (`id` int NOT NULL AUTO_INCREMENT, `smsNotification` int NOT NULL, `nse` int NOT NULL, `transaction` int NOT NULL, `blockchain` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `userAssets` CHANGE `user_id` `user_id` int NOT NULL");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `userAssets` CHANGE `user_id` `user_id` int NULL");
        await queryRunner.query("DROP TABLE `fees`");
    }

}
