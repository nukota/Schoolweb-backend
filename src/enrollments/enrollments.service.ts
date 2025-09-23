import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Class } from '../classes/entities/class.entity';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { user_id: createEnrollmentDto.student_id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify class exists
    const classEntity = await this.classRepository.findOne({
      where: { class_id: createEnrollmentDto.class_id },
      relations: ['enrollments'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Check if student is already enrolled in this class
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: {
        student_id: createEnrollmentDto.student_id,
        class_id: createEnrollmentDto.class_id,
      },
    });

    if (existingEnrollment) {
      throw new ConflictException('Student is already enrolled in this class');
    }

    // Check class capacity
    if (
      classEntity.max_size &&
      classEntity.enrollments.length >= classEntity.max_size
    ) {
      throw new BadRequestException('Class is at maximum capacity');
    }

    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      relations: ['student', 'class', 'class.subject'],
    });
  }

  async findOne(id: number): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { enrollment_id: id },
      relations: ['student', 'class', 'class.subject'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }

    return enrollment;
  }

  async findByStudent(studentId: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['class', 'class.subject', 'class.teacher'],
    });
  }

  async findByClass(classId: number): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { class_id: classId },
      relations: ['student'],
    });
  }

  async update(
    id: number,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    Object.assign(enrollment, updateEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async remove(id: number): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async dropEnrollment(studentId: number, classId: number): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        student_id: studentId,
        class_id: classId,
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    await this.enrollmentRepository.remove(enrollment);
  }
}
