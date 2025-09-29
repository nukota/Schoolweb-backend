import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../common/enums';
import { BaseResponseDTO } from '../../common/dto/common.dto';

export class SignupDTO {
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
    example: '123123',
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

export class LoginDTO {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123123',
    description: 'User password',
  })
  @IsString()
  password: string;
}

export class AuthResponseDTO extends BaseResponseDTO {
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

export class MeUserDTO {
  @ApiProperty({ example: 1 })
  user_id: number;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiProperty({ example: 'student' })
  user_type: string;

  @ApiProperty({ example: true })
  has_profile: boolean;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  avatar_url?: string;
}
