import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AlterCollectionVerifyAddColKey1658300618626 implements MigrationInterface {

  private tbl = 'CollectionSimilar';
  private colAdd = 'keyId';
    
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn(this.tbl, this.colAdd)) {
      return;
    }
    await queryRunner.query(`ALTER TABLE ${this.tbl} add column \`${this.colAdd}\` int unsigned NULL DEFAULT NULL AFTER \`code\``);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!await queryRunner.hasColumn(this.tbl, this.colAdd)) {
      return;
    }
    await queryRunner.dropColumn(this.tbl, this.colAdd);
  }
}
