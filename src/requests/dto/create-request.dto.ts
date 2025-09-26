import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RequestType, RequestStatus } from '../../common/enums';

export class CreateRequestDto {
  @ApiProperty({
    example: 1,
    description: 'Student ID reference',
  })
  @IsNumber()
  student_id: number;

  @ApiProperty({
    example: 1,
    description: 'Class ID reference',
  })
  @IsNumber()
  class_id: number;

  @ApiProperty({
    enum: RequestType,
    example: RequestType.ENROLL,
    description: 'Type of request',
  })
  @IsEnum(RequestType)
  request_type: RequestType;

  @ApiProperty({
    example: 'I would like to enroll in this class because...',
    description: 'Request message from the student',
  })
  @IsString()
  message: string;

  @ApiProperty({
    enum: RequestStatus,
    example: RequestStatus.PENDING,
    description: 'Status of the request',
    required: false,
  })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;
}
