import {MigrationInterface, QueryRunner} from "typeorm";

export class Order1608424568065 implements MigrationInterface {
    name = 'Order1608424568065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `order` (`id` int NOT NULL AUTO_INCREMENT, `key` varchar(255) NOT NULL, `orderType` int NOT NULL, `orderStrategy` int NOT NULL, `seller` varchar(255) NOT NULL, `buyer` varchar(255) NOT NULL, `tokenId` int NOT NULL, `amountRemaining` int NOT NULL, `originalAmount` int NOT NULL, `price` int NOT NULL, `status` int NOT NULL, `orderDate` int NOT NULL, `statusDate` int NOT NULL, `goodUntil` int NOT NULL, UNIQUE INDEX `key_idx` (`key`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `key_idx` ON `order`");
        await queryRunner.query("DROP TABLE `order`");
    }

}
