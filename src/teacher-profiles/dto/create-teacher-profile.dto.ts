import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateTeacherProfileDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  teacher_id: number;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString()
  hire_date?: string;
}
