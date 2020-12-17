import {MigrationInterface, QueryRunner} from "typeorm";

export class UserModel1608243140947 implements MigrationInterface {
    name = 'UserModel1608243140947'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL AUTO_INCREMENT, `privateKey` varchar(255) NOT NULL, `password` varchar(255) NOT NULL, `address` varchar(255) NOT NULL, `userId` int NOT NULL, UNIQUE INDEX `user_idx` (`userId`, `address`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `user_idx` ON `user`");
        await queryRunner.query("DROP TABLE `user`");
    }

}
