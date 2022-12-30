import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ApiKeyCreate1656662749589 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ApiKey',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'key',
            type: 'varchar(64)',
            isUnique: true,
          },
          {
            name: 'customerId',
            type: 'varchar(64)',
          },
          {
            name: 'status',
            type: 'tinyint',
            default: 1,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ApiKey');
  }
}
