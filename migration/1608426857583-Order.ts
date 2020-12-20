import {MigrationInterface, QueryRunner} from "typeorm";

export class Order1608426857583 implements MigrationInterface {
    name = 'Order1608426857583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE INDEX `tokenId_idx` ON `order` (`tokenId`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `tokenId_idx` ON `order`");
    }

}
