import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RegistrationClassesDTO,
  AcademicResultsDTO,
  RegistrationHistoryDTO,
} from './dto/enrollment-views.dto';
import { Enrollment } from './entities/enrollment.entity';
import { User } from '../users/entities/user.entity';
import { Class } from '../classes/entities/class.entity';
import { Request } from '../requests/entities/request.entity';
import {
  ClassStatus,
  RequestStatus,
  RequestType,
  EnrollmentStatus,
} from '../common/enums';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  async getRegistrationClasses(
    studentId?: number,
  ): Promise<RegistrationClassesDTO> {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    // Get all classes and filter by date logic
    const allClasses = await this.classRepository.find({
      relations: ['subject', 'teacher', 'enrollments', 'requests'],
    });

    const availableClasses = allClasses.filter((classEntity) => {
      if (!classEntity.start_date && !classEntity.end_date) {
        return true;
      }

      if (classEntity.start_date && !classEntity.end_date) {
        return currentDate >= classEntity.start_date;
      }
      if (!classEntity.start_date && classEntity.end_date) {
        return currentDate <= classEntity.end_date;
      }
      if (classEntity.start_date && classEntity.end_date) {
        return (
          currentDate >= classEntity.start_date &&
          currentDate <= classEntity.end_date
        );
      }
      return false;
    });

    // Map classes to RegisterClassDto format with proper status
    const registrationClasses = await Promise.all(
      availableClasses.map(async (classEntity) => {
        let status: ClassStatus = ClassStatus.AVAILABLE;

        // Check if class is full
        const enrolledStudents = classEntity.enrollments?.length || 0;
        if (enrolledStudents >= classEntity.max_size) {
          status = ClassStatus.FULL;
        } else if (studentId) {
          // Check if user is already enrolled
          const existingEnrollment = classEntity.enrollments?.find(
            (enrollment) => enrollment.student_id === studentId,
          );

          if (existingEnrollment) {
            status = ClassStatus.ENROLLED;
          } else {
            // Check if there's a pending request
            const pendingRequest = classEntity.requests?.find(
              (request) =>
                request.student_id === studentId &&
                request.request_type === RequestType.ENROLL &&
                request.status === RequestStatus.PENDING,
            );

            if (pendingRequest) {
              status = ClassStatus.REQUESTED;
            }
          }
        }

        return {
          class_id: classEntity.class_id,
          class_name: classEntity.subject.subject_name,
          class_code: classEntity.class_code,
          teacher_name: classEntity.teacher.full_name,
          department: classEntity.subject.department,
          start_date: classEntity.start_date,
          end_date: classEntity.end_date,
          day: classEntity.day,
          start_time: classEntity.start_time,
          end_time: classEntity.end_time,
          room: classEntity.room || '',
          credits: classEntity.subject.credits,
          max_students: classEntity.max_size,
          enrolled_students: enrolledStudents,
          description: classEntity.subject.description || '',
          status: status,
        };
      }),
    );

    return {
      available_classes: registrationClasses,
    };
  }

  async getAcademicResults(studentId?: number): Promise<AcademicResultsDTO> {
    if (!studentId) {
      return { semesters: [] };
    }

    // Get all enrollments for the student with completed or enrolled status
    const enrollments = await this.enrollmentRepository.find({
      where: {
        student_id: studentId,
        status: EnrollmentStatus.ENROLLED, // Can be expanded to include COMPLETED later
      },
      relations: ['class', 'class.subject', 'class.teacher'],
    });

    // Group enrollments by semester
    const semesterMap = new Map<string, typeof enrollments>();

    enrollments.forEach((enrollment) => {
      const semester = enrollment.class.semester;
      if (!semesterMap.has(semester)) {
        semesterMap.set(semester, []);
      }
      semesterMap.get(semester)!.push(enrollment);
    });

    // Convert to DTO format
    const semesters = Array.from(semesterMap.entries()).map(
      ([semesterName, semesterEnrollments]) => ({
        semester: semesterName,
        classes: semesterEnrollments.map((enrollment) => {
          // Ensure scores array has exactly 5 elements [coursework, lab, midterm, final, average]
          const scores = enrollment.scores || [];
          const paddedScores = [...scores];
          while (paddedScores.length < 5) {
            paddedScores.push(0);
          }
          // Calculate average if not provided (average of first 4 scores)
          if (
            paddedScores[4] === 0 &&
            (paddedScores[0] ||
              paddedScores[1] ||
              paddedScores[2] ||
              paddedScores[3])
          ) {
            const validScores = paddedScores
              .slice(0, 4)
              .filter((score) => score > 0);
            if (validScores.length > 0) {
              paddedScores[4] =
                validScores.reduce((sum, score) => sum + score, 0) /
                validScores.length;
            }
          }

          return {
            class_code: enrollment.class.class_code,
            class_name: enrollment.class.subject.subject_name,
            department: enrollment.class.subject.department,
            credits: enrollment.class.subject.credits,
            scores: paddedScores.slice(0, 5), // Ensure exactly 5 scores
            status: enrollment.status,
            teacher_name: enrollment.class.teacher.full_name,
          };
        }),
      }),
    );

    return { semesters };
  }

  async getRegistrationHistory(
    studentId?: number,
  ): Promise<RegistrationHistoryDTO> {
    if (!studentId) {
      return { semesters: [] };
    }

    // Get all enrollments for the student (all statuses)
    const enrollments = await this.enrollmentRepository.find({
      where: {
        student_id: studentId,
      },
      relations: ['class', 'class.subject', 'class.teacher', 'class.requests'],
    });

    // Group enrollments by semester
    const semesterMap = new Map<string, typeof enrollments>();

    enrollments.forEach((enrollment) => {
      const semester = enrollment.class.semester;
      if (!semesterMap.has(semester)) {
        semesterMap.set(semester, []);
      }
      semesterMap.get(semester)!.push(enrollment);
    });

    // Convert to DTO format
    const semesters = Array.from(semesterMap.entries()).map(
      ([semesterName, semesterEnrollments]) => {
        const classes = semesterEnrollments.map((enrollment) => {
          return {
            class_code: enrollment.class.class_code,
            class_name: enrollment.class.subject.subject_name,
            department: enrollment.class.subject.department,
            teacher_name: enrollment.class.teacher.full_name,
            credits: enrollment.class.subject.credits,
            registration_status: enrollment.status,
          };
        });

        // Calculate total credits for the semester
        const totalCredits = classes.reduce((sum, classItem) => {
          // Only count credits for enrolled or completed classes
          if (
            classItem.registration_status === EnrollmentStatus.ENROLLED ||
            classItem.registration_status === EnrollmentStatus.COMPLETED
          ) {
            return sum + classItem.credits;
          }
          return sum;
        }, 0);

        return {
          semester: semesterName,
          total_credits: totalCredits,
          classes,
        };
      },
    );

    return { semesters };
  }
}
