import { IsNumber, IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateStudentProfileDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  student_id: number;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsNumber()
  enrollment_year?: number;
}
