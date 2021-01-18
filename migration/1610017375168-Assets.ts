import {MigrationInterface, QueryRunner} from "typeorm";

export class Assets1610017375168 implements MigrationInterface {
    name = 'Assets1610017375168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `asset` (`tokenId` int NOT NULL, `issuer` varchar(255) NOT NULL, `description` varchar(255) NOT NULL, `symbol` varchar(255) NOT NULL, `totalSupply` int NOT NULL, `issuingPrice` int NOT NULL, `issuerId` int NOT NULL, `artistName` varchar(255) NOT NULL, `titleOfWork` varchar(255) NOT NULL, `commission` int NOT NULL, `price` varchar(255) NOT NULL, `createdOn` int NOT NULL, `sharesAvailable` int NOT NULL, `nameOfOwners` varchar(255) NOT NULL, `id` int NOT NULL AUTO_INCREMENT, `owner` varchar(255) NOT NULL, `sharesContract` varchar(255) NOT NULL, `approved` tinyint(1) NOT NULL, `imageUrl` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `token_idx` ON `asset`");
        await queryRunner.query("DROP INDEX `shares_contract_idx` ON `asset`");
        await queryRunner.query("DROP INDEX `token_name_issuer` ON `asset`");
        await queryRunner.query("DROP TABLE `asset`");
    }

}
