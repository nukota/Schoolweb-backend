import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../common/enums';

export class CreateSubjectDTO {
  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Name of the subject',
  })
  @IsString()
  subject_name: string;

  @ApiProperty({
    example: 'CS101',
    description: 'Unique subject code',
  })
  @IsString()
  @Matches(/^[A-Z]{2}\d{3}$/, {
    message:
      'Subject code must be in format: 2 uppercase letters followed by 3 numbers (e.g., CS101)',
  })
  subject_code: string;

  @ApiProperty({
    enum: Department,
    example: Department.COMPUTER_SCIENCE,
    description: 'Academic department',
  })
  @IsEnum(Department)
  department: Department;

  @ApiProperty({
    example: 3,
    description: 'Credit hours for the subject',
  })
  @IsNumber()
  credits: number;

  @ApiProperty({
    example: 'An introductory course covering basic programming concepts',
    description: 'Subject description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
