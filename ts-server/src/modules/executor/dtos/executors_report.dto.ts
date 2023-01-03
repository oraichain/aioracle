import { IsNotEmpty,
  IsOptional,
  Validate,
  IsString,
  Length,
  IsBase64,
  IsHexadecimal,
  ValidateNested,
  IsNumber,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsContractOrai, IsClaimObj, IsValidRewards } from 'src/utils/validator';

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

export class ReportSubmitted {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  request_id: number;

  @IsNotEmpty()
  @IsString()
  @Validate(IsContractOrai)
  contract_addr: string;

  @IsNotEmpty()
  @IsString()
  @IsHexadecimal()
  executor: string;
}

export class ReportReports {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  request_id: number;

  @IsNotEmpty()
  @IsString()
  @Validate(IsContractOrai)
  contract_addr: string;

  @IsOptional()
  page_number: number;

  @IsOptional()
  limit_per_page: number;
}

export class ReportSingle {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  request_id: number;

  @IsNotEmpty()
  @IsString()
  @Validate(IsContractOrai)
  contract_addr: string;
}

export class ReportPost {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  request_id: number;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ReportBodyData)
  report: typeof reportBodyData;
}


/**
 * init private object validation
 */

class ClaimObj {
  request_id: number
  executor: string
}

class ReportBodyData {
  @IsNotEmpty()
  @IsString()
  @Length(44, 44)
  @IsBase64()
  executor: string;

  @IsNotEmpty()
  @IsBase64()
  data: string;

  @IsNotEmpty()
  @IsBase64()
  @Length(88, 88)
  signature: string

  @IsNotEmpty()
  @Validate(IsValidRewards)
  rewards: object
}

const reportBodyData = new ReportBodyData();
