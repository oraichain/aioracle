import { IsNotEmpty,
  IsOptional,
  Validate,
  IsString,
  Length,
  IsBase64,
  IsHexadecimal 
} from 'class-validator';
import { ContractOrai } from 'src/utils/validator';

export class ExecutorsReport {
  @IsNotEmpty()
  @Validate(ContractOrai)
  contract_addr: string;

  @IsOptional()
  page_number: number;

  @IsOptional()
  limit_per_page: number;
}

export class ExecutorsReportParam {
  @IsNotEmpty()
  @IsString()
  @Length(44, 44)
  @IsBase64()
  executor: string;
}

export class ExecutorsReportHexParam {
  @IsNotEmpty()
  @IsString()
  @IsHexadecimal()
  executor: string;
}
