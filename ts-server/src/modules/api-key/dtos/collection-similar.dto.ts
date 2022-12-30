import { IsEmail, IsNotEmpty, IsOptional, IsIn, Max } from 'class-validator';
import { CHAIN_LIST } from 'src/constants';

export class CollectionSimilarDto {
  @IsNotEmpty()
  contract: string;

  @IsNotEmpty()
  @IsIn(CHAIN_LIST)
  chain: string;

  @IsOptional()
  @IsEmail()
  email: string;
}
