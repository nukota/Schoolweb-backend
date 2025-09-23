import { IsString, IsEnum } from 'class-validator';
import { UserType } from '../../common/enums';

export class CreateUserDto {
  @IsString()
  full_name: string;

  @IsString()
  password_hash: string;

  @IsEnum(UserType)
  user_type: UserType;
}
