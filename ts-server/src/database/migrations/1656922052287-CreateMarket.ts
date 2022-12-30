import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateMarket1656922052287 implements MigrationInterface {

    private tbl = 'Market';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.tbl,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated:true,
                        generationStrategy:'increment'
                    },
                    {
                        name: 'name',
                        type: 'varchar(20)'
                    },
                ]
            }),
            true,
        );
        await queryRunner.createIndex(this.tbl, new TableIndex({
            name: 'IDX_MA_NAME',
            columnNames: ['name'],
            isUnique: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.tbl, 'IDX_MA_NAME');
        await queryRunner.dropTable(this.tbl);
    }

}
