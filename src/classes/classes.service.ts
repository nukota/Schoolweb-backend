import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class } from './entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    // Verify subject exists
    const subject = await this.subjectRepository.findOne({
      where: { subject_id: createClassDto.subject_id },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Verify teacher exists
    const teacher = await this.userRepository.findOne({
      where: { user_id: createClassDto.teacher_id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if class code is unique
    const existingClass = await this.classRepository.findOne({
      where: { class_code: createClassDto.class_code },
    });

    if (existingClass) {
      throw new ConflictException('Class code already exists');
    }

    const classEntity = this.classRepository.create(createClassDto);
    return await this.classRepository.save(classEntity);
  }

  async findAll(): Promise<Class[]> {
    return await this.classRepository.find({
      relations: ['subject', 'teacher', 'enrollments'],
    });
  }

  async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { class_id: id },
      relations: ['subject', 'teacher', 'enrollments', 'enrollments.student'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async findByTeacher(teacherId: number): Promise<Class[]> {
    return await this.classRepository.find({
      where: { teacher_id: teacherId },
      relations: ['subject', 'enrollments'],
    });
  }

  async findBySubject(subjectId: number): Promise<Class[]> {
    return await this.classRepository.find({
      where: { subject_id: subjectId },
      relations: ['teacher', 'enrollments'],
    });
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const classEntity = await this.findOne(id);

    // Check if class code is being updated and if it's unique
    if (
      updateClassDto.class_code &&
      updateClassDto.class_code !== classEntity.class_code
    ) {
      const existingClass = await this.classRepository.findOne({
        where: { class_code: updateClassDto.class_code },
      });

      if (existingClass) {
        throw new ConflictException('Class code already exists');
      }
    }

    // Verify subject if being updated
    if (updateClassDto.subject_id) {
      const subject = await this.subjectRepository.findOne({
        where: { subject_id: updateClassDto.subject_id },
      });

      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
    }

    // Verify teacher if being updated
    if (updateClassDto.teacher_id) {
      const teacher = await this.userRepository.findOne({
        where: { user_id: updateClassDto.teacher_id },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
    }

    Object.assign(classEntity, updateClassDto);
    return await this.classRepository.save(classEntity);
  }

  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);
    await this.classRepository.remove(classEntity);
  }
}
