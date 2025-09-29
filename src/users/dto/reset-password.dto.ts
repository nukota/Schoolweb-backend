import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDTO {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Current password',
  })
  @IsString()
  old_password: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password',
  })
  @IsString()
  new_password: string;
}
