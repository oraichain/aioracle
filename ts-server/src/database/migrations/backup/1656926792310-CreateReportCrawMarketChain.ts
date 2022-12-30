import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateReportCrawMarketChain1656926792310 implements MigrationInterface {

    private tbl = 'ReportCrawChainMarket';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.tbl,
                columns: [
                    {
                        name: 'date',
                        type: 'timestamp',
                    },
                    {
                        name: 'chain',
                        type: 'int unsigned',
                        isNullable: true
                    },
                    {
                        name: 'market',
                        type: 'int unsigned',
                        isNullable: true
                    },
                    {
                        name: 'count',
                        type: 'int unsigned'
                    }
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.tbl, new TableIndex({
            name: 'IDX_RECRCHMA_DATE',
            columnNames: ['date']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.tbl, 'IDX_RECRCHMA_DATE');
        await queryRunner.dropTable(this.tbl);
    }

}
