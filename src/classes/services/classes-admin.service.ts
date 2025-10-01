import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassDTO } from '../dto/create-class.dto';
import { UpdateClassDTO } from '../dto/update-class.dto';
import { AdminClassesDTO, AdminClassDTO } from '../dto/class-views.dto';
import { Class } from '../entities/class.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Request } from '../../requests/entities/request.entity';
import { StudentProfile } from '../../student-profiles/entities/student-profile.entity';
import {
  EnrollmentStatus,
  RequestType,
  RequestStatus,
} from '../../common/enums';
import {
  AddStudentsToClassDTO,
  RemoveStudentsFromClassDTO,
  ClassManagementResponseDTO,
} from '../dto/class-management.dto';

@Injectable()
export class ClassesAdminService {
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
      throw new BadRequestException(
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

  async addStudentsToClass(
    classId: number,
    addStudentsDTO: AddStudentsToClassDTO,
  ): Promise<ClassManagementResponseDTO> {
    const details: string[] = [];
    let affectedCount = 0;

    for (const studentIdStr of addStudentsDTO.student_ids) {
      try {
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
          where: {
            student_id: actualUserId,
            class_id: classId,
            status: EnrollmentStatus.ENROLLED || EnrollmentStatus.COMPLETED,
          },
        });

        if (existingEnrollment) {
          details.push(`Student ID ${studentIdStr} is already enrolled`);
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
      } catch (error) {
        details.push(`Error adding student ${studentIdStr}: ${error.message}`);
      }
    }

    return {
      message:
        affectedCount > 0
          ? `${affectedCount} student(s) added successfully`
          : 'No students were added successfully. Check the details for specific reasons.',
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
      try {
        // Find student profile by user_id
        const studentProfile = await this.studentProfileRepository.findOne({
          where: { student_id: studentIdStr },
          relations: ['user'],
        });

        if (!studentProfile || !studentProfile.user) {
          details.push(`Student with ID ${studentIdStr} not found`);
          continue;
        }

        const actualUserId = studentProfile.user.user_id;

        // Find all enrollments for this student in this class
        const enrollments = await this.enrollmentRepository.find({
          where: { student_id: actualUserId, class_id: classId },
          relations: ['student'],
        });

        if (!enrollments || enrollments.length === 0) {
          details.push(
            `Student with ID ${studentIdStr} is not enrolled in this class`,
          );
          continue;
        }

        // Update all enrollment statuses to dropped
        let updatedCount = 0;
        for (const enrollment of enrollments) {
          enrollment.status = EnrollmentStatus.DROPPED;
          await this.enrollmentRepository.save(enrollment);
          updatedCount++;
        }

        if (updatedCount > 0) {
          affectedCount++;
          details.push(
            `Student ${studentIdStr}: ${enrollments[0].student.full_name} removed from class (${updatedCount} enrollment(s) updated)`,
          );
        }

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
            `Drop request for ${enrollments[0].student.full_name} approved`,
          );
        }
      } catch (error) {
        details.push(
          `Error removing student ${studentIdStr}: ${error.message}`,
        );
      }
    }

    return {
      message: `${affectedCount} student(s) removed successfully`,
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

  async getAllClasses(): Promise<AdminClassesDTO> {
    const classes = await this.classRepository.find({
      relations: [
        'subject',
        'teacher',
        'teacher.teacher_profile',
        'enrollments',
      ],
    });

    const adminClasses: AdminClassDTO[] = classes.map((classEntity) => ({
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
      teacher_id:
        classEntity.teacher.teacher_profile?.teacher_id?.toString() || '',
      teacher_name: classEntity.teacher.full_name,
    }));

    return { classes: adminClasses };
  }
}
