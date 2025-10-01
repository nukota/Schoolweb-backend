import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TeacherClassesDTO,
  ClassDetailsDTO,
  TeacherScheduleDTO,
  TeacherScheduleItemDTO,
  ClassMemberDTO,
} from '../dto/class-views.dto';
import { Class } from '../entities/class.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { StudentProfile } from '../../student-profiles/entities/student-profile.entity';
import { EnrollmentStatus } from '../../common/enums';
import {
  EditStudentScoresDTO,
  ClassManagementResponseDTO,
} from '../dto/class-management.dto';
import { getAverageScore } from '../../common/utils';

@Injectable()
export class ClassesTeacherService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
  ) {}

  async getTeacherClasses(teacherId: number): Promise<TeacherClassesDTO> {
    const classes = await this.classRepository.find({
      where: { teacher_id: teacherId },
      relations: ['subject', 'enrollments'],
    });

    const teacherClasses: any[] = classes.map((classEntity) => ({
      class_id: classEntity.class_id,
      class_name: classEntity.subject.subject_name,
      class_code: classEntity.class_code,
      department: classEntity.subject.department,
      size:
        classEntity.enrollments?.filter(
          (enrollment) => enrollment.status !== EnrollmentStatus.DROPPED,
        ).length || 0,
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

  async getClassDetails(
    classId: number,
    teacherId: number,
  ): Promise<ClassDetailsDTO> {
    const classEntity = await this.classRepository.findOne({
      where: { class_id: classId, teacher_id: teacherId },
      relations: [
        'subject',
        'teacher',
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

    const members: ClassMemberDTO[] = classEntity.enrollments
      .filter((enrollment) => enrollment.status !== EnrollmentStatus.DROPPED)
      .map((enrollment) => ({
        user_id: enrollment.student.user_id,
        full_name: enrollment.student.full_name,
        student_id:
          enrollment.student.student_profile?.student_id?.toString() || '',
        avatar: enrollment.student.student_profile?.avatar_url,
        scores: enrollment.scores || [0, 0, 0, 0], // Get actual scores from enrollment
      })); // Check if class has any completed enrollments - if so, teacher cannot edit
    const hasCompletedEnrollments =
      classEntity.enrollments?.some(
        (enrollment) => enrollment.status === EnrollmentStatus.COMPLETED,
      ) || false;

    return {
      class_id: classEntity.class_id,
      class_name: classEntity.subject.subject_name,
      class_code: classEntity.class_code,
      department: classEntity.subject.department,
      size: members.length, // Use filtered members count instead of total enrollments
      max_size: classEntity.max_size,
      semester: classEntity.semester,
      start_date: classEntity.start_date,
      end_date: classEntity.end_date,
      day: classEntity.day,
      start_time: classEntity.start_time,
      end_time: classEntity.end_time,
      room: classEntity.room || '',
      credits: classEntity.subject.credits,
      teacher_id: classEntity.teacher_id.toString(),
      teacher_name: classEntity.teacher.full_name,
      is_editable: !hasCompletedEnrollments, // Teacher cannot edit if class has completed enrollments
      members,
    };
  }

  async getTeacherSchedule(
    teacherId: number,
    startDate: string,
    endDate: string,
  ): Promise<TeacherScheduleDTO> {
    this.validateWeekDates(startDate, endDate);

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

  async editStudentScores(
    classId: number,
    editScoresDTO: EditStudentScoresDTO,
  ): Promise<ClassManagementResponseDTO> {
    const details: string[] = [];
    let affectedCount = 0;

    for (const scoreUpdate of editScoresDTO.student_scores) {
      // Find student profile by student_id
      const studentProfile = await this.studentProfileRepository.findOne({
        where: { student_id: scoreUpdate.student_id },
        relations: ['user'],
      });

      if (!studentProfile || !studentProfile.user) {
        details.push(`Student with ID ${scoreUpdate.student_id} not found`);
        continue;
      }

      const actualUserId = studentProfile.user.user_id;

      // Check if student has a completed enrollment in this class
      const completedEnrollment = await this.enrollmentRepository.findOne({
        where: {
          student_id: actualUserId,
          class_id: classId,
          status: EnrollmentStatus.COMPLETED,
        },
      });

      if (completedEnrollment) {
        details.push(`Class is completed, further modifications not allowed.`);
        break;
      }

      // Find enrollment
      const enrollment = await this.enrollmentRepository.findOne({
        where: {
          student_id: actualUserId,
          class_id: classId,
          status: EnrollmentStatus.ENROLLED,
        },
        relations: ['student'],
      });

      if (!enrollment) {
        details.push(
          `Student with ID ${scoreUpdate.student_id} is not enrolled in this class`,
        );
        continue;
      }

      // Validate scores are within 0-10
      const validateScore = (score: number | undefined, label: string) => {
        if (score !== undefined && (score < 0 || score > 10)) {
          throw new BadRequestException(
            `${label} score for student ${enrollment.student.full_name} must be between 0 and 10`,
          );
        }
      };

      validateScore(scoreUpdate.coursework, 'Coursework');
      validateScore(scoreUpdate.lab, 'Lab');
      validateScore(scoreUpdate.midterm, 'Midterm');
      validateScore(scoreUpdate.final_exam, 'Final Exam');

      // Update scores array: [coursework, lab, midterm, final_exam]
      const currentScores = enrollment.scores || [0, 0, 0, 0];
      const updatedScores = [...currentScores];

      let hasUpdates = false;
      const scoreUpdates: string[] = [];

      if (scoreUpdate.coursework !== undefined) {
        updatedScores[0] = scoreUpdate.coursework;
        scoreUpdates.push(`Coursework: ${scoreUpdate.coursework}`);
        hasUpdates = true;
      }

      if (scoreUpdate.lab !== undefined) {
        updatedScores[1] = scoreUpdate.lab;
        scoreUpdates.push(`Lab: ${scoreUpdate.lab}`);
        hasUpdates = true;
      }

      if (scoreUpdate.midterm !== undefined) {
        updatedScores[2] = scoreUpdate.midterm;
        scoreUpdates.push(`Midterm: ${scoreUpdate.midterm}`);
        hasUpdates = true;
      }

      if (scoreUpdate.final_exam !== undefined) {
        updatedScores[3] = scoreUpdate.final_exam;
        scoreUpdates.push(`Final Exam: ${scoreUpdate.final_exam}`);
        hasUpdates = true;
      }

      if (hasUpdates) {
        enrollment.scores = updatedScores;
        await this.enrollmentRepository.save(enrollment);
        affectedCount++;
        details.push(
          `Updated scores for ${enrollment.student.full_name}: ${scoreUpdates.join(', ')}`,
        );
      } else {
        details.push(
          `No score updates provided for ${enrollment.student.full_name}`,
        );
      }

      // Always recalculate and update the average score (5th element in scores array)
      const averageScore = getAverageScore(updatedScores);
      updatedScores[4] = averageScore; // Store average as 5th element
      enrollment.scores = updatedScores;
      await this.enrollmentRepository.save(enrollment);
    }

    return {
      message: `${affectedCount} student score(s) updated successfully`,
      affected_count: affectedCount,
      details,
    };
  }
}
