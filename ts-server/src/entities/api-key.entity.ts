import { Column, Entity } from 'typeorm';
import {
  Column64Char,
  ColumnPrimaryKey,
  ColumnTinyInt,
  CreatedAt,
  UpdatedAt,
  ColumnUnsignedForeignKey,
  ColumnTimestamp
} from '../utils';

@Entity('ApiKey')
export class ApiKey {
  @ColumnPrimaryKey()
  id: number;

  @Column64Char()
  key: string;

  @Column64Char()
  customerId: string;

  @ColumnTinyInt({ default: 1 })
  status: number;

  @ColumnUnsignedForeignKey()
  maxRequest: number

  @ColumnTimestamp()
  timeStart: Date

  @ColumnTimestamp()
  timeEnd: Date

  @CreatedAt()
  createdAt: Date;

  @UpdatedAt()
  updatedAt: Date;
}
