import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../common/enums';
import { BaseResponseDTO } from '../../common/dto/common.dto';

export class SignupDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  full_name: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'User password',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: UserType,
    example: UserType.STUDENT,
    description: 'Type of user account',
  })
  @IsEnum(UserType)
  user_type: UserType;
}

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'User password',
  })
  @IsString()
  password: string;
}

export class AuthResponseDto extends BaseResponseDTO {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
    required: false,
  })
  access_token?: string;

  @ApiProperty({
    description: 'User information',
    required: false,
    example: {
      user_id: 1,
      email: 'john.doe@example.com',
      full_name: 'John Doe',
      user_type: 'student',
      has_profile: false,
    },
  })
  user?: {
    user_id: number;
    email: string;
    full_name: string;
    user_type: UserType;
    has_profile: boolean;
  };
}

export class JwtPayload {
  @ApiProperty({ description: 'User ID' })
  sub: number; // user_id

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ enum: UserType, description: 'User type' })
  user_type: UserType;

  @ApiProperty({ description: 'Token issued at', required: false })
  iat?: number;

  @ApiProperty({ description: 'Token expiration', required: false })
  exp?: number;
}
