import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Subject } from './entities/subject.entity';
import { Department } from '../common/enums';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    // Check if subject code is unique
    const existingSubject = await this.subjectRepository.findOne({
      where: { subject_code: createSubjectDto.subject_code },
    });

    if (existingSubject) {
      throw new ConflictException('Subject code already exists');
    }

    const subject = this.subjectRepository.create(createSubjectDto);
    return await this.subjectRepository.save(subject);
  }

  async findAll(): Promise<Subject[]> {
    return await this.subjectRepository.find({
      relations: ['classes'],
    });
  }

  async findOne(id: number): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { subject_id: id },
      relations: ['classes', 'classes.teacher'],
    });

    if (!subject) {
      throw new NotFoundException(`Subject with ID ${id} not found`);
    }

    return subject;
  }

  async update(
    id: number,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<Subject> {
    const subject = await this.findOne(id);

    // Check if subject code is being updated and if it's unique
    if (
      updateSubjectDto.subject_code &&
      updateSubjectDto.subject_code !== subject.subject_code
    ) {
      const existingSubject = await this.subjectRepository.findOne({
        where: { subject_code: updateSubjectDto.subject_code },
      });

      if (existingSubject) {
        throw new ConflictException('Subject code already exists');
      }
    }

    Object.assign(subject, updateSubjectDto);
    return await this.subjectRepository.save(subject);
  }

  async remove(id: number): Promise<void> {
    const subject = await this.findOne(id);
    await this.subjectRepository.remove(subject);
  }
}
