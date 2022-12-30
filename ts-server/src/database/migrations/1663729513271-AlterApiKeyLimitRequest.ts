import { MigrationInterface, QueryRunner } from "typeorm"

export class AlterApiKeyLimitRequest1663729513271 implements MigrationInterface {

    private tbl = 'ApiKey';

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn(this.tbl, 'maxRequest')) {
            await queryRunner.query(`ALTER TABLE ${this.tbl} 
                add column \`maxRequest\` INT unsigned 
                NULL DEFAULT 10 AFTER \`status\``
            );
        }
        
        if (!await queryRunner.hasColumn(this.tbl, 'timeStart')) {
            await queryRunner.query(`ALTER TABLE ${this.tbl} 
                add column \`timeStart\` timestamp 
                NULL DEFAULT CURRENT_TIMESTAMP() AFTER \`maxRequest\``
            );
        }

        if (!await queryRunner.hasColumn(this.tbl, 'timeEnd')) {
            await queryRunner.query(`ALTER TABLE ${this.tbl} 
                add column \`timeEnd\` timestamp 
                NULL DEFAULT CURRENT_TIMESTAMP() AFTER \`timeStart\``
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn(this.tbl, 'maxRequest')) {
            await queryRunner.dropColumn(this.tbl, 'maxRequest');
        }
        if (await queryRunner.hasColumn(this.tbl, 'timeStart')) {
            await queryRunner.dropColumn(this.tbl, 'timeStart');
        }
        if (await queryRunner.hasColumn(this.tbl, 'timeEnd')) {
            await queryRunner.dropColumn(this.tbl, 'timeEnd');
        }
    }

}
