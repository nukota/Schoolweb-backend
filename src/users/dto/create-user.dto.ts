import { IsString, IsEnum, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '../../common/enums';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @IsString()
  full_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123123',
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
