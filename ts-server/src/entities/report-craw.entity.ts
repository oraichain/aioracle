import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('ReportCraw')
export class ReportCraw {

  @PrimaryColumn({name: 'date', type: 'date'})
  date: number;

  @PrimaryColumn()
  name: number;

  @PrimaryColumn()
  type: number;

  @Column()
  count: number;
}
