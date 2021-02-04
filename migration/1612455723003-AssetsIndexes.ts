import {MigrationInterface, QueryRunner} from "typeorm";

export class AssetsIndexes1612455723003 implements MigrationInterface {
    name = 'AssetsIndexes1612455723003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `token-id-idx` ON `asset` (`tokenId`)");
        await queryRunner.query("CREATE INDEX `issuer-idx` ON `asset` (`issuer`)");
        await queryRunner.query("CREATE INDEX `issuer-id-idx` ON `asset` (`issuerId`)");
        await queryRunner.query("CREATE INDEX `broker-id-idx` ON `asset` (`brokerId`)");
        await queryRunner.query("CREATE INDEX `owner-idx` ON `asset` (`owner`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `owner-idx` ON `asset`");
        await queryRunner.query("DROP INDEX `broker-id-idx` ON `asset`");
        await queryRunner.query("DROP INDEX `issuer-id-idx` ON `asset`");
        await queryRunner.query("DROP INDEX `issuer-idx` ON `asset`");
        await queryRunner.query("DROP INDEX `token-id-idx` ON `asset`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

}
