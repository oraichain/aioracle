import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class CreateReportCraw1656925204069 implements MigrationInterface {

    private tbl = 'ReportCraw';
    
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
                        name: 'name',
                        type: 'int unsigned'
                    },
                    {
                        name: 'type',
                        type: 'int(2) unsigned'
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
            name: 'IDX_RECR_DATE',
            columnNames: ['date']
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.tbl, 'IDX_RECR_DATE');
        await queryRunner.dropTable(this.tbl);
    }

}
