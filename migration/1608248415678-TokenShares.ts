import {MigrationInterface, QueryRunner} from "typeorm";

export class TokenShares1608248415678 implements MigrationInterface {
    name = 'TokenShares1608248415678'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `tokenShares` (`id` int NOT NULL AUTO_INCREMENT, `tokenId` int NOT NULL, `owner` varchar(255) NOT NULL, `sharesContract` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `symbol` varchar(255) NOT NULL, `totalSupply` int NOT NULL, `issuingPrice` int NOT NULL, `issuer` varchar(255) NOT NULL, UNIQUE INDEX `shares_contract_idx` (`sharesContract`), UNIQUE INDEX `token_idx` (`tokenId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `token_idx` ON `tokenShares`");
        await queryRunner.query("DROP INDEX `shares_contract_idx` ON `tokenShares`");
        await queryRunner.query("DROP TABLE `tokenShares`");
    }

}
