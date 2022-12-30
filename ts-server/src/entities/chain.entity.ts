import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Chain')
export class Chain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
