import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { CreatedAt, UpdatedAt } from '../utils';

@Entity('CollectionSimilar')
export class CollectionSimilar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  keyId: number;

  @Column()
  contract: string;

  @Column()
  chain: string;

  @Column({
    nullable: true
  })
  email: string;

  @Column({
    nullable: true
  })
  status: number;

  @Column({
    nullable: true
  })
  totalSupply: number;

  @Column({
    nullable: true
  })
  flagRed: number;

  @Column({
    nullable: true
  })
  flagConsider: number;

  @Column({
    nullable: true
  })
  flagReliable: number;

  @Column({
    nullable: true
  })
  summary: string;

  @CreatedAt()
  createdAt: Date;

  @UpdatedAt()
  updatedAt: Date;
}
