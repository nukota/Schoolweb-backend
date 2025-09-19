import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { UserType, Department } from '../../common/enums';

export class CreateUserDto {
  @IsOptional()
  @IsNumber()
  student_id?: number;

  @IsString()
  full_name: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsString()
  password_hash: string;

  @IsEnum(UserType)
  user_type: UserType;

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsEnum(Department)
  department: Department;
}
