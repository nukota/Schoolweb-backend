import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  RegistrationClassesDTO,
  AcademicResultsDTO,
  RegistrationHistoryDTO,
} from './dto/enrollment-views.dto';
import { Enrollment } from './entities/enrollment.entity';
import { Class } from '../classes/entities/class.entity';
import {
  ClassStatus,
  RequestStatus,
  RequestType,
  EnrollmentStatus,
} from '../common/enums';
import { buildRegistrationSemesters, getAverageScore } from '../common/utils';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
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

    // Map classes to RegisterClassDTO format with proper status
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
        status: In([EnrollmentStatus.ENROLLED, EnrollmentStatus.COMPLETED]),
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

          // Always recalculate average using weighted formula (even if already exists)
          const calculatedAverage = getAverageScore(paddedScores.slice(0, 4));
          paddedScores[4] = calculatedAverage;

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
      return {
        total_semesters: 0,
        total_classes: 0,
        total_credits: 0,
        completed_classes: 0,
        semesters: [],
      };
    }

    // Get all enrollments for the student (all statuses)
    const enrollments = await this.enrollmentRepository.find({
      where: {
        student_id: studentId,
      },
      relations: ['class', 'class.subject', 'class.teacher'],
    });

    // Use shared function to build semesters
    const semesters = buildRegistrationSemesters(enrollments);

    // Calculate summary statistics
    let totalCredits = 0;
    let completedClasses = 0;

    enrollments.forEach((enrollment) => {
      if (
        enrollment.status === EnrollmentStatus.ENROLLED ||
        enrollment.status === EnrollmentStatus.COMPLETED
      ) {
        totalCredits += enrollment.class.subject.credits;
      }

      if (enrollment.status === EnrollmentStatus.COMPLETED) {
        completedClasses++;
      }
    });

    return {
      total_semesters: semesters.length,
      total_classes: enrollments.length,
      total_credits: totalCredits,
      completed_classes: completedClasses,
      semesters,
    };
  }
}
