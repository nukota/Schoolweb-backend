import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import {
  TeacherClassesDTO,
  TeacherClassDetailsDTO,
  TeacherClassDTO,
  ClassMemberDTO,
  StudentClassesDTO,
  StudentClassDTO,
  StudentScheduleDTO,
  StudentScheduleItemDTO,
  TeacherScheduleDTO,
  TeacherScheduleItemDTO,
} from './dto/class-views.dto';
import { Class } from './entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { EnrollmentStatus } from '../common/enums';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    // Verify subject exists
    const subject = await this.subjectRepository.findOne({
      where: { subject_id: createClassDto.subject_id },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Enforce class_code starts with subject_code
    if (!createClassDto.class_code.startsWith(subject.subject_code)) {
      throw new BadRequestException(
        `class_code must start with the subject_code (${subject.subject_code})`,
      );
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

    // Determine the subject to use for validation
    let subjectToCheck: Subject | null = null;
    if (updateClassDto.subject_id) {
      subjectToCheck = await this.subjectRepository.findOne({
        where: { subject_id: updateClassDto.subject_id },
      });
      if (!subjectToCheck) {
        throw new NotFoundException('Subject not found');
      }
    } else {
      subjectToCheck = classEntity.subject;
    }

    // Enforce class_code starts with subject_code if either is being updated
    const newClassCode = updateClassDto.class_code || classEntity.class_code;
    if (
      subjectToCheck &&
      newClassCode &&
      !newClassCode.startsWith(subjectToCheck.subject_code)
    ) {
      throw new (await import('@nestjs/common')).BadRequestException(
        `class_code must start with the subject_code (${subjectToCheck.subject_code})`,
      );
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

  async getTeacherClasses(teacherId: number): Promise<TeacherClassesDTO> {
    const classes = await this.classRepository.find({
      where: { teacher_id: teacherId },
      relations: ['subject', 'enrollments'],
    });

    const teacherClasses: TeacherClassDTO[] = classes.map((classEntity) => ({
      class_id: classEntity.class_id,
      class_name: classEntity.subject.subject_name,
      class_code: classEntity.class_code,
      department: classEntity.subject.department,
      size: classEntity.enrollments?.length || 0,
      max_size: classEntity.max_size,
      semester: classEntity.semester,
      start_date: classEntity.start_date,
      end_date: classEntity.end_date,
      day: classEntity.day,
      start_time: classEntity.start_time,
      end_time: classEntity.end_time,
      room: classEntity.room || '',
      credits: classEntity.subject.credits,
    }));

    return { classes: teacherClasses };
  }

  async getTeacherClassDetails(
    classId: number,
    teacherId: number,
  ): Promise<TeacherClassDetailsDTO> {
    const classEntity = await this.classRepository.findOne({
      where: { class_id: classId, teacher_id: teacherId },
      relations: [
        'subject',
        'enrollments',
        'enrollments.student',
        'enrollments.student.student_profile',
      ],
    });

    if (!classEntity) {
      throw new NotFoundException(
        'Class not found or you are not the teacher of this class',
      );
    }

    const members: ClassMemberDTO[] = classEntity.enrollments.map(
      (enrollment) => ({
        user_id: enrollment.student.user_id,
        full_name: enrollment.student.full_name,
        student_id:
          enrollment.student.student_profile?.student_id?.toString() || '',
        avatar: enrollment.student.student_profile?.avatar_url,
        scores: [0, 0, 0, 0], // Default scores, you can implement actual score retrieval later
      }),
    );

    return {
      class_id: classEntity.class_id,
      class_name: classEntity.subject.subject_name,
      class_code: classEntity.class_code,
      department: classEntity.subject.department,
      size: classEntity.enrollments?.length || 0,
      max_size: classEntity.max_size,
      semester: classEntity.semester,
      start_date: classEntity.start_date,
      end_date: classEntity.end_date,
      day: classEntity.day,
      start_time: classEntity.start_time,
      end_time: classEntity.end_time,
      room: classEntity.room || '',
      credits: classEntity.subject.credits,
      is_editable: true, // Teacher can always edit their own classes
      members,
    };
  }

  async getStudentClasses(studentId: number): Promise<StudentClassesDTO> {
    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['class', 'class.subject', 'class.teacher'],
    });

    const currentClasses: StudentClassDTO[] = [];
    const completedClasses: StudentClassDTO[] = [];

    enrollments.forEach((enrollment) => {
      const classDto: StudentClassDTO = {
        class_id: enrollment.class.class_id,
        class_name: enrollment.class.subject.subject_name,
        class_code: enrollment.class.class_code,
        teacher_name: enrollment.class.teacher.full_name,
        department: enrollment.class.subject.department,
        start_date: enrollment.class.start_date,
        end_date: enrollment.class.end_date,
        day: enrollment.class.day,
        start_time: enrollment.class.start_time,
        end_time: enrollment.class.end_time,
        room: enrollment.class.room || '',
        credits: enrollment.class.subject.credits,
        requested_to_drop: false, // You can implement actual drop request logic
      };

      // Separate current and completed classes based on enrollment status
      if (enrollment.status === EnrollmentStatus.COMPLETED) {
        completedClasses.push(classDto);
      } else {
        currentClasses.push(classDto);
      }
    });

    return {
      current_classes: currentClasses,
      completed_classes: completedClasses,
    };
  }

  async getStudentSchedule(
    studentId: number,
    startDate: string,
    endDate: string,
  ): Promise<StudentScheduleDTO> {
    const enrollments = await this.enrollmentRepository.find({
      where: {
        student_id: studentId,
        status: EnrollmentStatus.ENROLLED, // Only active enrollments
      },
      relations: ['class', 'class.subject', 'class.teacher'],
    });

    const schedule: StudentScheduleItemDTO[] = enrollments
      .filter(
        (enrollment) => enrollment.class.day && enrollment.class.start_time,
      )
      .filter((enrollment) => {
        // Filter classes that occur during the specified week
        return this.isClassInDateRange(enrollment.class, startDate, endDate);
      })
      .map((enrollment) => ({
        department: enrollment.class.subject.department,
        class_name: enrollment.class.subject.subject_name,
        class_code: enrollment.class.class_code,
        teacher_name: enrollment.class.teacher.full_name,
        start_time: enrollment.class.start_time || '',
        end_time: enrollment.class.end_time || '',
        room: enrollment.class.room || '',
        day: enrollment.class.day || '',
      }));

    return { schedule };
  }

  async getTeacherSchedule(
    teacherId: number,
    startDate: string,
    endDate: string,
  ): Promise<TeacherScheduleDTO> {
    const classes = await this.classRepository.find({
      where: { teacher_id: teacherId },
      relations: ['subject'],
    });

    const schedule: TeacherScheduleItemDTO[] = classes
      .filter((classEntity) => classEntity.day && classEntity.start_time)
      .filter((classEntity) => {
        // Filter classes that occur during the specified week
        return this.isClassInDateRange(classEntity, startDate, endDate);
      })
      .map((classEntity) => ({
        department: classEntity.subject.department,
        class_name: classEntity.subject.subject_name,
        class_code: classEntity.class_code,
        start_time: classEntity.start_time || '',
        end_time: classEntity.end_time || '',
        room: classEntity.room || '',
        day: classEntity.day || '',
      }));

    return { schedule };
  }

  private isClassInDateRange(
    classEntity: Class,
    weekStartDate: string,
    weekEndDate: string,
  ): boolean {
    // If class doesn't have start_date or end_date, we can't determine if it's in range
    if (!classEntity.start_date || !classEntity.end_date) {
      return false;
    }

    const classStartDate = new Date(classEntity.start_date);
    const classEndDate = new Date(classEntity.end_date);
    const requestedStartDate = new Date(weekStartDate);
    const requestedEndDate = new Date(weekEndDate);

    // Check if the requested week overlaps with the class duration
    // Class must be active during at least part of the requested week
    return (
      classStartDate <= requestedEndDate && classEndDate >= requestedStartDate
    );
  }
}
