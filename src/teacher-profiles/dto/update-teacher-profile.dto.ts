import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsDateString } from 'class-validator';

export class UpdateTeacherProfileDTO {
  @ApiProperty({ example: 'teacher@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '1980-01-15',
    description: 'Date of birth in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar image URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;
}
