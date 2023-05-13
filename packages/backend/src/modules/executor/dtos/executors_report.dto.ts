import {
  IsNotEmpty,
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
import { IsContractOrai } from 'src/utils/validator';

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
  @Length(43, 63)
  executor: string;
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

export class ProofLeaf {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  request_id: number;

  @IsNotEmpty()
  @IsString()
  @Validate(IsContractOrai)
  contract_addr: string;

  @IsNotEmpty()
  @IsObject()
  leaf: object;
}

class ReportBodyData {
  @IsNotEmpty()
  @IsString()
  @Length(43, 63)
  executor: string;

  @IsNotEmpty()
  @IsString()
  @IsBase64()
  executorPubkey: string;

  @IsNotEmpty()
  @IsBase64()
  data: string;

  @IsNotEmpty()
  @IsBase64()
  @Length(88, 88)
  signature: string
}

const reportBodyData = new ReportBodyData();
