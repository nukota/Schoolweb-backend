import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { RequestType, RequestStatus } from '../../common/enums';

export class CreateRequestDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  class_id: number;

  @IsEnum(RequestType)
  request_type: RequestType;

  @IsString()
  message: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
