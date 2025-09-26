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
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import {
  StudentsPageDTO,
  StudentDetailsDTO,
  StudentListItemDTO,
} from './dto/user-views.dto';
import { CreateStudentDto } from '../users/dto/create-student.dto';
import { UpdateStudentDto } from '../users/dto/update-student.dto';
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
  ) {}

  async resetPassword(
    userId: number,
    resetPasswordDto: ResetPasswordDto,
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
      resetPasswordDto.old_password,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(
      resetPasswordDto.new_password,
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
    const total_classes = enrollments.length;
    let total_semesters = 0;

    if (enrollments.length > 0) {
      // Calculate GPA
      const scores = enrollments
        .map((e) => getAverageScore(e.scores))
        .filter((score) => score > 0);

      gpa =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;

      // Count completed classes
      completed_classes = enrollments.filter(
        (e) => e.status === EnrollmentStatus.COMPLETED,
      ).length;

      // Calculate credits (assuming 3 credits per completed class)
      total_credits = completed_classes * 3;

      // Count unique semesters
      const semesters = new Set(
        enrollments.map((e) => e.class?.semester).filter(Boolean),
      );
      total_semesters = semesters.size;
    }

    // Build registration history using shared function
    const registration_history = buildRegistrationSemesters(enrollments);

    return {
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
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
    createStudentDto: CreateStudentDto,
  ): Promise<{ message: string; user: any; studentProfile: StudentProfile }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createStudentDto.password,
      saltRounds,
    );

    // Create user
    const user = this.userRepository.create({
      full_name: createStudentDto.full_name,
      email: createStudentDto.email,
      password: hashedPassword,
      user_type: UserType.STUDENT,
    });

    const savedUser = await this.userRepository.save(user);

    // Create student profile
    const studentProfile = this.studentProfileRepository.create({
      user_id: savedUser.user_id,
      student_id: createStudentDto.student_id,
      phone: createStudentDto.phone,
      dob: createStudentDto.dob,
      avatar_url: createStudentDto.avatar_url,
      department: createStudentDto.department,
      enrollment_year: createStudentDto.enrollment_year,
    });

    const savedStudentProfile =
      await this.studentProfileRepository.save(studentProfile);

    return {
      message: 'Student created successfully',
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
    updateStudentDto: UpdateStudentDto,
  ): Promise<{ message: string; user: any; studentProfile: StudentProfile }> {
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
    if (updateStudentDto.email && updateStudentDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateStudentDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Update user fields
    const userUpdateData: any = {};
    if (updateStudentDto.full_name)
      userUpdateData.full_name = updateStudentDto.full_name;
    if (updateStudentDto.email) userUpdateData.email = updateStudentDto.email;

    if (updateStudentDto.password) {
      const saltRounds = 10;
      userUpdateData.password = await bcrypt.hash(
        updateStudentDto.password,
        saltRounds,
      );
    }

    // Update student profile fields
    const profileUpdateData: any = {};
    if (updateStudentDto.student_id !== undefined)
      profileUpdateData.student_id = updateStudentDto.student_id;
    if (updateStudentDto.phone !== undefined)
      profileUpdateData.phone = updateStudentDto.phone;
    if (updateStudentDto.dob !== undefined)
      profileUpdateData.dob = updateStudentDto.dob;
    if (updateStudentDto.avatar_url !== undefined)
      profileUpdateData.avatar_url = updateStudentDto.avatar_url;
    if (updateStudentDto.department !== undefined)
      profileUpdateData.department = updateStudentDto.department;
    if (updateStudentDto.enrollment_year !== undefined)
      profileUpdateData.enrollment_year = updateStudentDto.enrollment_year;

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
      message: 'Student updated successfully',
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
}
