import { IsNotEmpty,
  IsOptional,
  Validate,
  IsString,
  Length,
  IsBase64,
  IsHexadecimal, 
  IsArray,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsContractOrai, IsClaimObj } from 'src/utils/validator';

export class ExecutorsReport {
  @IsNotEmpty()
  @Validate(IsContractOrai)
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

export class ExecutorsClaimBody {
  @IsNotEmpty()
  @Validate(IsContractOrai)
  contract_addr: string;

  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ClaimObj)
  @Validate(IsClaimObj)
  data: ClaimObj[]
}

class ClaimObj {
  request_id: number
  executor: string
}
