import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeNameToDesc1608300385410 implements MigrationInterface {
    name = 'ChangeNameToDesc1608300385410'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `name` `description` varchar(255) NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `token_name_issuer` ON `tokenShares` (`symbol`, `issuer`)");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `token_name_issuer` ON `tokenShares`");
        await queryRunner.query("ALTER TABLE `tokenShares` CHANGE `description` `name` varchar(255) NOT NULL");
    }

}
