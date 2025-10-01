import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  StudentClassesDTO,
  StudentClassDTO,
  StudentScheduleDTO,
  StudentScheduleItemDTO,
} from '../dto/class-views.dto';
import { Class } from '../entities/class.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { EnrollmentStatus } from '../../common/enums';

@Injectable()
export class ClassesStudentService {
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

  async getStudentClasses(studentId: number): Promise<StudentClassesDTO> {
    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['class', 'class.subject', 'class.teacher'],
    });

    const currentClasses: StudentClassDTO[] = [];
    const completedClasses: StudentClassDTO[] = [];

    enrollments.forEach((enrollment) => {
      const classDTO: StudentClassDTO = {
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
        completedClasses.push(classDTO);
      } else if (enrollment.status === EnrollmentStatus.ENROLLED) {
        currentClasses.push(classDTO);
      }
      // Dropped classes are not included in either array
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
    this.validateWeekDates(startDate, endDate);

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

  validateWeekDates(startDate: string, endDate: string): void {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'Both start_date and end_date query parameters are required',
      );
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Check if dates are valid
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Use YYYY-MM-DD format.',
      );
    }

    // Check if start_date is Monday (getDay() returns 1 for Monday)
    if (startDateObj.getDay() !== 1) {
      throw new BadRequestException('start_date must be a Monday');
    }

    // Check if end_date is Sunday (getDay() returns 0 for Sunday)
    if (endDateObj.getDay() !== 0) {
      throw new BadRequestException('end_date must be a Sunday');
    }

    // Check if they are the same week (end_date should be 6 days after start_date)
    const timeDiff = endDateObj.getTime() - startDateObj.getTime();
    const dayDiff = timeDiff / (1000 * 60 * 60 * 24);

    if (dayDiff !== 6) {
      throw new BadRequestException(
        'start_date and end_date must be Monday and Sunday of the same week',
      );
    }
  }
}
