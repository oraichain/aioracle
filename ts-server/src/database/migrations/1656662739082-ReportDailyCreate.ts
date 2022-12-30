import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class ReportDailyCreate1656662739082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ReportDaily',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'keyId',
            type: 'bigint',
          },
          {
            name: 'count',
            type: 'int',
            default: 0,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'ReportDaily',
      new TableIndex({
        name: 'IDX_ReportDaily_KeyId',
        columnNames: ['keyId'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ReportDaily');
  }
}
