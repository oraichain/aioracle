import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ReportCrawChainMarket')
export class ReportCrawChainMarket {

  @PrimaryColumn({name: 'date', type: 'date'})
  date: string;

  @PrimaryColumn()
  chain: number;

  @PrimaryColumn()
  market: number;

  @Column()
  count: number;
}
