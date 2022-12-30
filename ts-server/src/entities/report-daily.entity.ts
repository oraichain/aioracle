import { Column, Entity, Index } from 'typeorm';
import { ColumnInt, ColumnPrimaryKey, DateAt } from '../utils';

@Entity('ReportDaily')
export class ReportDaily {
  @ColumnPrimaryKey()
  id: number;

  @ColumnInt()
  keyId: number;

  @ColumnInt({ default: 0 })
  count: number;

  @Column()
  date: string;

  @Column()
  type: number;
}
