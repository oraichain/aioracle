import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateCollectionVerify1657790876568 implements MigrationInterface {

  private tbl = 'CollectionSimilar';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tbl,
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'code',
            type: 'varchar(8)',
          },
          {
            name: 'contract',
            type: 'varchar(100)',
          },
          {
            name: 'chain',
            type: 'int unsigned',
          },
          {
            name: 'email',
            type: 'varchar(100)',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'tinyint',
            isNullable: true,
          },
          {
            name: 'totalSupply',
            type: 'int unsigned',
            isNullable: true,
          },
          {
            name: 'flagRed',
            type: 'int unsigned',
            isNullable: true,
          },
          {
            name: 'flagConsider',
            type: 'int unsigned',
            isNullable: true,
          },
          {
            name: 'flagReliable',
            type: 'int unsigned',
            isNullable: true,
          },
          {
            name: 'summary',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'detail',
            type: 'longtext',
            isNullable: true,
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
        ]
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(this.tbl);
  }
}
