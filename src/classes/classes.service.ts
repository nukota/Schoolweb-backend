import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassDTO } from './dto/create-class.dto';
import { UpdateClassDTO } from './dto/update-class.dto';
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
import { Request } from '../requests/entities/request.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { EnrollmentStatus, RequestType, RequestStatus } from '../common/enums';
import {
  AddStudentsToClassDTO,
  RemoveStudentsFromClassDTO,
  EditStudentScoresDTO,
  ClassManagementResponseDTO,
} from './dto/class-management.dto';
import { getAverageScore } from '../common/utils';

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
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
  ) {}

  async create(createClassDTO: CreateClassDTO): Promise<Class> {
    // Verify subject exists
    const subject = await this.subjectRepository.findOne({
      where: { subject_id: createClassDTO.subject_id },
    });
    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    // Enforce class_code starts with subject_code
    if (!createClassDTO.class_code.startsWith(subject.subject_code)) {
      throw new BadRequestException(
        `class_code must start with the subject_code (${subject.subject_code})`,
      );
    }

    // Verify teacher exists
    const teacher = await this.userRepository.findOne({
      where: { user_id: createClassDTO.teacher_id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Check if class code is unique
    const existingClass = await this.classRepository.findOne({
      where: { class_code: createClassDTO.class_code },
    });

    if (existingClass) {
      throw new ConflictException('Class code already exists');
    }

    const classEntity = this.classRepository.create(createClassDTO);
    return await this.classRepository.save(classEntity);
  }

  private async findOne(id: number): Promise<Class> {
    const classEntity = await this.classRepository.findOne({
      where: { class_id: id },
      relations: ['subject', 'teacher', 'enrollments', 'enrollments.student'],
    });

    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    return classEntity;
  }

  async update(id: number, updateClassDTO: UpdateClassDTO): Promise<Class> {
    const classEntity = await this.findOne(id);

    // Check if max_size is being reduced below current enrollment count
    if (updateClassDTO.max_size !== undefined) {
      const currentEnrollmentCount =
        classEntity.enrollments?.filter(
          (enrollment) => enrollment.status === EnrollmentStatus.ENROLLED,
        ).length || 0;

      if (updateClassDTO.max_size < currentEnrollmentCount) {
        throw new ConflictException(
          `Cannot reduce max_size to ${updateClassDTO.max_size}. Current enrolled students: ${currentEnrollmentCount}`,
        );
      }
    }

    // Check if class code is being updated and if it's unique
    if (
      updateClassDTO.class_code &&
      updateClassDTO.class_code !== classEntity.class_code
    ) {
      const existingClass = await this.classRepository.findOne({
        where: { class_code: updateClassDTO.class_code },
      });
      if (existingClass) {
        throw new ConflictException('Class code already exists');
      }
    }

    // Determine the subject to use for validation
    let subjectToCheck: Subject | null = null;
    if (updateClassDTO.subject_id) {
      subjectToCheck = await this.subjectRepository.findOne({
        where: { subject_id: updateClassDTO.subject_id },
      });
      if (!subjectToCheck) {
        throw new NotFoundException('Subject not found');
      }
    } else {
      subjectToCheck = classEntity.subject;
    }

    // Enforce class_code starts with subject_code if either is being updated
    const newClassCode = updateClassDTO.class_code || classEntity.class_code;
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
    if (updateClassDTO.teacher_id) {
      const teacher = await this.userRepository.findOne({
        where: { user_id: updateClassDTO.teacher_id },
      });
      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }
    }

    Object.assign(classEntity, updateClassDTO);
    return await this.classRepository.save(classEntity);
  }

  async remove(id: number): Promise<void> {
    const classEntity = await this.findOne(id);

    // Check if class has any active enrollments (ENROLLED or COMPLETED)
    const activeEnrollments =
      classEntity.enrollments?.filter(
        (enrollment) =>
          enrollment.status === EnrollmentStatus.ENROLLED ||
          enrollment.status === EnrollmentStatus.COMPLETED,
      ) || [];

    if (activeEnrollments.length > 0) {
      throw new ConflictException(
        'Cannot delete class with enrolled or completed students. Please remove all active enrollments first.',
      );
    }

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
        scores: enrollment.scores || [0, 0, 0, 0], // Get actual scores from enrollment
      }),
    );

    // Check if class has any completed enrollments - if so, teacher cannot edit
    const hasCompletedEnrollments =
      classEntity.enrollments?.some(
        (enrollment) => enrollment.status === EnrollmentStatus.COMPLETED,
      ) || false;

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
      is_editable: !hasCompletedEnrollments, // Teacher cannot edit if class has completed enrollments
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

  async addStudentsToClass(
    classId: number,
    addStudentsDTO: AddStudentsToClassDTO,
  ): Promise<ClassManagementResponseDTO> {
    const details: string[] = [];
    let affectedCount = 0;

    for (const studentIdStr of addStudentsDTO.student_ids) {
      // Find student profile by student_id
      const studentProfile = await this.studentProfileRepository.findOne({
        where: { student_id: studentIdStr },
        relations: ['user'],
      });

      if (!studentProfile || !studentProfile.user) {
        details.push(`Student with ID ${studentIdStr} not found`);
        continue;
      }

      const actualUserId = studentProfile.user.user_id;

      // Check if student is already enrolled
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: { student_id: actualUserId, class_id: classId },
      });

      if (existingEnrollment) {
        details.push(
          `Student ${studentProfile.user.full_name} is already enrolled`,
        );
        continue;
      }

      // Check if there's a pending enrollment request
      const pendingRequest = await this.requestRepository.findOne({
        where: {
          student_id: actualUserId,
          class_id: classId,
          request_type: RequestType.ENROLL,
          status: RequestStatus.PENDING,
        },
      });

      // Create enrollment
      const enrollment = this.enrollmentRepository.create({
        student_id: actualUserId,
        class_id: classId,
        status: EnrollmentStatus.ENROLLED,
        scores: [0, 0, 0, 0], // Initialize with zeros [coursework, lab, midterm, final]
      });

      await this.enrollmentRepository.save(enrollment);
      affectedCount++;
      details.push(`Student ${studentProfile.user.full_name} added to class`);

      // If there was a pending request, approve it
      if (pendingRequest) {
        pendingRequest.status = RequestStatus.APPROVED;
        pendingRequest.reviewed_date = new Date();
        await this.requestRepository.save(pendingRequest);
        details.push(
          `Enrollment request for ${studentProfile.user.full_name} approved`,
        );
      }
    }

    if (affectedCount === 0) {
      throw new BadRequestException(
        'No students were added successfully. Check the details for specific reasons.',
      );
    }

    return {
      message: `${affectedCount} student(s) added successfully`,
      affected_count: affectedCount,
      details,
    };
  }

  async removeStudentsFromClass(
    classId: number,
    removeStudentsDTO: RemoveStudentsFromClassDTO,
  ): Promise<ClassManagementResponseDTO> {
    const details: string[] = [];
    let affectedCount = 0;

    for (const studentIdStr of removeStudentsDTO.student_ids) {
      // Find student profile by student_id
      const studentProfile = await this.studentProfileRepository.findOne({
        where: { student_id: studentIdStr },
        relations: ['user'],
      });

      if (!studentProfile || !studentProfile.user) {
        details.push(`Student with ID ${studentIdStr} not found`);
        continue;
      }

      const actualUserId = studentProfile.user.user_id;

      // Find enrollment
      const enrollment = await this.enrollmentRepository.findOne({
        where: { student_id: actualUserId, class_id: classId },
        relations: ['student'],
      });

      if (!enrollment) {
        details.push(
          `Student with ID ${studentIdStr} is not enrolled in this class`,
        );
        continue;
      }

      // Update enrollment status to dropped
      enrollment.status = EnrollmentStatus.DROPPED;
      await this.enrollmentRepository.save(enrollment);

      affectedCount++;
      details.push(
        `Student ${enrollment.student.full_name} removed from class`,
      );

      // If there's a pending drop request, approve it
      const pendingDropRequest = await this.requestRepository.findOne({
        where: {
          student_id: actualUserId,
          class_id: classId,
          request_type: RequestType.DROP,
          status: RequestStatus.PENDING,
        },
      });

      if (pendingDropRequest) {
        pendingDropRequest.status = RequestStatus.APPROVED;
        pendingDropRequest.reviewed_date = new Date();
        await this.requestRepository.save(pendingDropRequest);
        details.push(
          `Drop request for ${enrollment.student.full_name} approved`,
        );
      }
    }

    return {
      message: `${affectedCount} student(s) removed successfully`,
      affected_count: affectedCount,
      details,
    };
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

  async markClassAsComplete(
    classId: number,
    teacherId: number,
  ): Promise<ClassManagementResponseDTO> {
    // Verify class exists and belongs to teacher
    const classEntity = await this.classRepository.findOne({
      where: { class_id: classId, teacher_id: teacherId },
      relations: ['enrollments', 'enrollments.student'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found or not authorized');
    }

    // Check if class already has completed enrollments
    const completedEnrollments =
      classEntity.enrollments?.filter(
        (enrollment) => enrollment.status === EnrollmentStatus.COMPLETED,
      ) || [];

    if (completedEnrollments.length > 0) {
      throw new BadRequestException('Class already has completed enrollments');
    }

    // Get enrolled students
    const enrolledEnrollments =
      classEntity.enrollments?.filter(
        (enrollment) => enrollment.status === EnrollmentStatus.ENROLLED,
      ) || [];

    if (enrolledEnrollments.length === 0) {
      throw new BadRequestException(
        'No enrolled students to mark as completed',
      );
    }

    const details: string[] = [];
    let affectedCount = 0;

    // Update all enrolled enrollments to completed
    for (const enrollment of enrolledEnrollments) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      await this.enrollmentRepository.save(enrollment);
      affectedCount++;
      details.push(`Marked ${enrollment.student.full_name} as completed`);
    }

    return {
      message: `Class marked as completed for ${affectedCount} student(s)`,
      affected_count: affectedCount,
      details,
    };
  }
}
