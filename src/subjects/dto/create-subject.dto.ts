import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Department } from '../../common/enums';

export class CreateSubjectDto {
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
