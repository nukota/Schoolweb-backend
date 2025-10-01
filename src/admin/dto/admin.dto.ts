import { IsString, IsOptional, IsEmail, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminDTO {
  @ApiPropertyOptional({
    example: 'newadmin@school.com',
    description: 'New email address for the admin',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewSecurePass123!',
    description: 'New password for the admin account',
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;
}
