import { PartialType } from '@nestjs/swagger';
import { CreateClassDTO } from './create-class.dto';

export class UpdateClassDTO extends PartialType(CreateClassDTO) {}
