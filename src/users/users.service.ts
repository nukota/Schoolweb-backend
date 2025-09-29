import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { TeacherProfile } from '../teacher-profiles/entities/teacher-profile.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import {
  StudentsPageDTO,
  StudentDetailsDTO,
  StudentListItemDTO,
  TeachersListDTO,
  TeacherListItemDTO,
} from './dto/user-views.dto';
import { CreateStudentDTO } from '../users/dto/create-student.dto';
import { UpdateStudentDTO } from '../users/dto/update-student.dto';
import { UserType, EnrollmentStatus } from '../common/enums';
import { getAverageScore, buildRegistrationSemesters } from '../common/utils';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
  ) {}

  async resetPassword(
    userId: number,
    resetPasswordDTO: ResetPasswordDTO,
  ): Promise<{ message: string }> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(
      resetPasswordDTO.old_password,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(
      resetPasswordDTO.new_password,
      saltRounds,
    );

    // Update password
    await this.userRepository.update(userId, { password: hashedNewPassword });

    return {
      message: 'Password reset successfully',
    };
  }

  async getStudentsPage(): Promise<StudentsPageDTO> {
    // Get all students with their profiles
    const students = await this.userRepository.find({
      where: { user_type: UserType.STUDENT },
      relations: ['student_profile'],
    });

    const studentList: StudentListItemDTO[] = [];

    for (const user of students) {
      const profile = user.student_profile;

      // Calculate GPA from enrollments
      const enrollments = await this.enrollmentRepository.find({
        where: { student_id: user.user_id },
      });

      let gpa = 0;
      if (enrollments.length > 0) {
        const scores = enrollments
          .map((e) => getAverageScore(e.scores))
          .filter((score) => score > 0);

        gpa =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;
      }

      studentList.push({
        user_id: user.user_id,
        name: user.full_name,
        email: user.email,
        phone: profile?.phone || '',
        gpa: Math.round(gpa * 100) / 100,
        avatar: profile?.avatar_url,
        student_id: profile?.student_id?.toString() || '',
      });
    }

    return { students: studentList };
  }

  async getTeachersList(): Promise<TeachersListDTO> {
    // Get all teachers with their profiles
    const teachers = await this.userRepository.find({
      where: { user_type: UserType.TEACHER },
      relations: ['teacher_profile'],
    });

    const teacherList: TeacherListItemDTO[] = teachers
      .filter((user) => user.teacher_profile) // Only include teachers with profiles
      .map((user) => ({
        user_id: user.user_id,
        teacher_id: user.teacher_profile!.teacher_id,
        full_name: user.full_name,
      }));

    return { teachers: teacherList };
  }

  async getStudentDetails(userId: number): Promise<StudentDetailsDTO> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId, user_type: UserType.STUDENT },
      relations: ['student_profile'],
    });

    if (!user || !user.student_profile) {
      throw new NotFoundException('Student not found');
    }

    const profile = user.student_profile;

    // Calculate stats from enrollments
    const enrollments = await this.enrollmentRepository.find({
      where: { student_id: userId },
      relations: ['class', 'class.subject', 'class.teacher'],
    });

    let gpa = 0;
    let total_credits = 0;
    let completed_classes = 0;
    const total_classes = enrollments.filter(
      (e) =>
        e.status === EnrollmentStatus.ENROLLED ||
        e.status === EnrollmentStatus.COMPLETED,
    ).length;
    let total_semesters = 0;

    if (enrollments.length > 0) {
      // Filter to only include enrolled and completed classes for calculations
      const activeEnrollments = enrollments.filter(
        (e) =>
          e.status === EnrollmentStatus.ENROLLED ||
          e.status === EnrollmentStatus.COMPLETED,
      );

      // Calculate GPA from active enrollments only
      const scores = activeEnrollments
        .map((e) => getAverageScore(e.scores))
        .filter((score) => score > 0);

      gpa =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      // Count completed classes
      completed_classes = activeEnrollments.filter(
        (e) => e.status === EnrollmentStatus.COMPLETED,
      ).length;

      // Calculate credits (assuming 3 credits per completed class)
      total_credits = completed_classes * 3;

      // Count unique semesters from active enrollments
      const semesters = new Set(
        activeEnrollments.map((e) => e.class?.semester).filter(Boolean),
      );
      total_semesters = semesters.size;
    }

    // Build registration history using shared function (only active enrollments)
    const activeEnrollments = enrollments.filter(
      (e) =>
        e.status === EnrollmentStatus.ENROLLED ||
        e.status === EnrollmentStatus.COMPLETED,
    );
    const registration_history = buildRegistrationSemesters(activeEnrollments);

    return {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      dob: profile.dob
        ? new Date(profile.dob).toISOString().split('T')[0]
        : undefined,
      phone: profile.phone || '',
      gpa: Math.round(gpa * 100) / 100,
      avatar: profile.avatar_url,
      student_id: profile.student_id?.toString() || '',
      department: profile.department || '',
      enrollment_year: profile.enrollment_year || 0,
      total_credits,
      total_semesters,
      completed_classes,
      total_classes,
      registration_history,
    };
  }

  async createStudent(
    createStudentDTO: CreateStudentDTO,
  ): Promise<{ user: any; studentProfile: StudentProfile }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createStudentDTO.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createStudentDTO.password,
      saltRounds,
    );

    // Create user
    const user = this.userRepository.create({
      full_name: createStudentDTO.full_name,
      email: createStudentDTO.email,
      password: hashedPassword,
      user_type: UserType.STUDENT,
    });

    const savedUser = await this.userRepository.save(user);

    // Create student profile
    const studentProfile = this.studentProfileRepository.create({
      user_id: savedUser.user_id,
      student_id: createStudentDTO.student_id,
      phone: createStudentDTO.phone,
      dob: createStudentDTO.dob,
      avatar_url: createStudentDTO.avatar_url,
      department: createStudentDTO.department,
      enrollment_year: createStudentDTO.enrollment_year,
    });

    const savedStudentProfile =
      await this.studentProfileRepository.save(studentProfile);

    return {
      user: {
        user_id: savedUser.user_id,
        full_name: savedUser.full_name,
        email: savedUser.email,
        user_type: savedUser.user_type,
        created_at: savedUser.created_at,
      },
      studentProfile: savedStudentProfile,
    };
  }

  async updateStudent(
    studentId: number,
    updateStudentDTO: UpdateStudentDTO,
  ): Promise<{ user: any; studentProfile: StudentProfile }> {
    // Find the user and their student profile
    const user = await this.userRepository.findOne({
      where: { user_id: studentId },
      relations: ['student_profile'],
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    if (!user.student_profile) {
      throw new NotFoundException('Student profile not found');
    }

    // Check if email already exists (if email is being updated)
    if (updateStudentDTO.email && updateStudentDTO.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateStudentDTO.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update user fields
    const userUpdateData: any = {};
    if (updateStudentDTO.full_name)
      userUpdateData.full_name = updateStudentDTO.full_name;
    if (updateStudentDTO.email) userUpdateData.email = updateStudentDTO.email;

    if (updateStudentDTO.password) {
      const saltRounds = 10;
      userUpdateData.password = await bcrypt.hash(
        updateStudentDTO.password,
        saltRounds,
      );
    }

    // Update student profile fields
    const profileUpdateData: any = {};
    if (updateStudentDTO.student_id !== undefined)
      profileUpdateData.student_id = updateStudentDTO.student_id;
    if (updateStudentDTO.phone !== undefined)
      profileUpdateData.phone = updateStudentDTO.phone;
    if (updateStudentDTO.dob !== undefined)
      profileUpdateData.dob = updateStudentDTO.dob;
    if (updateStudentDTO.avatar_url !== undefined)
      profileUpdateData.avatar_url = updateStudentDTO.avatar_url;
    if (updateStudentDTO.department !== undefined)
      profileUpdateData.department = updateStudentDTO.department;
    if (updateStudentDTO.enrollment_year !== undefined)
      profileUpdateData.enrollment_year = updateStudentDTO.enrollment_year;

    // Update user if there are changes
    if (Object.keys(userUpdateData).length > 0) {
      await this.userRepository.update(user.user_id, userUpdateData);
    }

    // Update student profile if there are changes (using user_id as primary key)
    if (Object.keys(profileUpdateData).length > 0) {
      await this.studentProfileRepository.update(
        user.student_profile.user_id,
        profileUpdateData,
      );
    }

    // Fetch updated data
    const updatedUser = await this.userRepository.findOne({
      where: { user_id: studentId },
      relations: ['student_profile'],
    });

    if (!updatedUser || !updatedUser.student_profile) {
      throw new NotFoundException('Failed to retrieve updated student data');
    }

    return {
      user: {
        user_id: updatedUser.user_id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        user_type: updatedUser.user_type,
        created_at: updatedUser.created_at,
      },
      studentProfile: updatedUser.student_profile,
    };
  }

  async deleteCurrentUser(userId: number): Promise<{ message: string }> {
    // Find the user with their profile
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['student_profile', 'teacher_profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Delete profile based on user type
    if (user.user_type === UserType.STUDENT && user.student_profile) {
      await this.studentProfileRepository.delete(user.student_profile.user_id);
    } else if (user.user_type === UserType.TEACHER && user.teacher_profile) {
      await this.teacherProfileRepository.delete(user.teacher_profile.user_id);
    }

    // Delete the user (this will cascade delete related data due to foreign keys)
    await this.userRepository.delete(userId);

    return {
      message: 'Account deleted successfully',
    };
  }

  async deleteStudent(studentId: number): Promise<{ message: string }> {
    // Find the student user with their profile
    const user = await this.userRepository.findOne({
      where: { user_id: studentId, user_type: UserType.STUDENT },
      relations: ['student_profile'],
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    if (!user.student_profile) {
      throw new NotFoundException('Student profile not found');
    }

    // Delete student profile first
    await this.studentProfileRepository.delete(user.student_profile.user_id);

    // Delete the user (this will cascade delete enrollments and requests due to foreign keys)
    await this.userRepository.delete(studentId);

    return {
      message: 'Student deleted successfully',
    };
  }
}
