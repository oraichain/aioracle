import { MigrationInterface, QueryRunner } from "typeorm"

export class AlterReportDailyAddType1660552006773 implements MigrationInterface {

    private tbl = 'ReportDaily';
    private colAdd = 'type';

    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasColumn(this.tbl, this.colAdd)) {
            return;
          }
        await queryRunner.query(`ALTER TABLE ${this.tbl} add column \`${this.colAdd}\` SMALLINT unsigned 
            NULL DEFAULT 1 AFTER \`count\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!await queryRunner.hasColumn(this.tbl, this.colAdd)) {
            return;
          }
          await queryRunner.dropColumn(this.tbl, this.colAdd);
    }

}
