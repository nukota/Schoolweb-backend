import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestType } from '../../common/enums';

export class CreateRequestDTO {
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

  @ApiPropertyOptional({
    example: 'I would like to enroll in this class because...',
    description: 'Optional request message from the student',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
