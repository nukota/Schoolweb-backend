import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDTO } from './create-teacher.dto';

export class UpdateTeacherDTO extends PartialType(CreateTeacherDTO) {}
