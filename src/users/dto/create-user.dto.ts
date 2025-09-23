import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../common/enums';

export class CreateUserDto {
  @ApiProperty({
    example: 1,
    description: 'Student ID reference',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  student_id?: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  full_name: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'User password (will be hashed)',
  })
  @IsString()
  password: string; // This will be hashed before saving

  @ApiProperty({
    enum: UserType,
    example: UserType.STUDENT,
    description: 'Type of user account',
  })
  @IsEnum(UserType)
  user_type: UserType;
}
