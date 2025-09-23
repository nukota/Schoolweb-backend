import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserType } from '../../common/enums';
import { BaseResponseDTO } from '../../common/dto/common.dto';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  full_name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserType)
  user_type: UserType;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class AuthResponseDto extends BaseResponseDTO {
  access_token?: string;
  user?: {
    user_id: number;
    email: string;
    full_name: string;
    user_type: UserType;
    has_profile: boolean;
  };
}

export class JwtPayload {
  sub: number; // user_id
  email: string;
  user_type: UserType;
  iat?: number;
  exp?: number;
}
