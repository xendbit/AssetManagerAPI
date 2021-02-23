import {MigrationInterface, QueryRunner} from "typeorm";

export class MarktSettings1614092246903 implements MigrationInterface {
    name = 'MarktSettings1614092246903'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `market_settings` (`id` int NOT NULL AUTO_INCREMENT, `percMinBuyQuantity` int NOT NULL, `percPriceChangeLimit` int NOT NULL, `primaryMarketHoldingPeriod` int NOT NULL, `maxNoOfDaysForInfinityOrders` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("DROP TABLE `market_settings`");
    }

}
