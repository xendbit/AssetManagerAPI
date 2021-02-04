import {MigrationInterface, QueryRunner} from "typeorm";

export class Indexes1612455939067 implements MigrationInterface {
    name = 'Indexes1612455939067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
        await queryRunner.query("CREATE INDEX `key-idx` ON `order` (`key`)");
        await queryRunner.query("CREATE INDEX `seller-idx` ON `order` (`seller`)");
        await queryRunner.query("CREATE INDEX `buyer-idx` ON `order` (`buyer`)");
        await queryRunner.query("CREATE INDEX `token-id-idx` ON `order` (`tokenId`)");
        await queryRunner.query("CREATE INDEX `user-id-idx` ON `passwordReset` (`userId`)");
        await queryRunner.query("CREATE INDEX `token-idx` ON `passwordReset` (`token`)");
        await queryRunner.query("CREATE INDEX `email-idx` ON `user` (`email`)");
        await queryRunner.query("CREATE INDEX `bvn-idx` ON `user` (`bvn`)");
        await queryRunner.query("CREATE INDEX `ngnc-account-number-idx` ON `user` (`ngncAccountNumber`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `ngnc-account-number-idx` ON `user`");
        await queryRunner.query("DROP INDEX `bvn-idx` ON `user`");
        await queryRunner.query("DROP INDEX `email-idx` ON `user`");
        await queryRunner.query("DROP INDEX `token-idx` ON `passwordReset`");
        await queryRunner.query("DROP INDEX `user-id-idx` ON `passwordReset`");
        await queryRunner.query("DROP INDEX `token-id-idx` ON `order`");
        await queryRunner.query("DROP INDEX `buyer-idx` ON `order`");
        await queryRunner.query("DROP INDEX `seller-idx` ON `order`");
        await queryRunner.query("DROP INDEX `key-idx` ON `order`");
        await queryRunner.query("ALTER TABLE `user` CHANGE `imageUrl` `imageUrl` varchar(255) NOT NULL");
    }

}
