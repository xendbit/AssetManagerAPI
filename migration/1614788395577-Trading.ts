import {MigrationInterface, QueryRunner} from "typeorm";

export class Trading1614788395577 implements MigrationInterface {
    name = 'Trading1614788395577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `trade` (`sellerEmail` varchar(255) NOT NULL, `buyerEmail` varchar(255) NOT NULL, `assetSymbol` varchar(255) NOT NULL, `numberOfTradeTokens` int NOT NULL, `tradeId` int NOT NULL, `tradeType` varchar(255) NOT NULL, `tradeDate` varchar(255) NOT NULL, `tradePrice` int NOT NULL, `totalTokensOwnedByUser` int NOT NULL, `id` int NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("DROP TABLE `trade`");
    }

}
