import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Market')
export class Market {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
