import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateChain1656922061415 implements MigrationInterface {

    private tbl = 'Chain';

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
            name: 'IDX_CH_NAME',
            columnNames: ['name'],
            isUnique: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.tbl, 'IDX_CH_NAME');
        await queryRunner.dropTable(this.tbl);
    }

}
