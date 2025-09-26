import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherProfileDto } from './dto/create-teacher-profile.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { User } from '../users/entities/user.entity';
import { UserType } from '../common/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeacherProfilesService {
  constructor(
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    userId: number,
    createTeacherProfileDto: CreateTeacherProfileDto,
  ): Promise<TeacherProfile> {
    // Check if user exists and is a teacher
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['teacher_profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.teacher_profile) {
      throw new ConflictException(
        'Teacher profile already exists for this user',
      );
    }

    const teacherProfile = this.teacherProfileRepository.create({
      ...createTeacherProfileDto,
      user_id: userId,
    });

    return await this.teacherProfileRepository.save(teacherProfile);
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

  async getProfileWithUser(userId: number): Promise<{
    user: Partial<User>;
    profile: TeacherProfile;
  }> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId, user_type: UserType.TEACHER },
      relations: ['teacher_profile'],
      select: ['user_id', 'full_name', 'email', 'user_type', 'created_at'],
    });

    if (!user) {
      throw new NotFoundException('Teacher not found');
    }

    if (!user.teacher_profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        user_type: user.user_type,
        created_at: user.created_at,
      },
      profile: user.teacher_profile,
    };
  }

  async update(
    userId: number,
    updateTeacherProfileDto: import('./dto/update-teacher-profile.dto').UpdateTeacherProfileDto,
  ): Promise<{ user: Partial<User>; profile: TeacherProfile }> {
    // Find the user and their teacher profile
    const user = await this.userRepository.findOne({
      where: { user_id: userId, user_type: UserType.TEACHER },
      relations: ['teacher_profile'],
    });

    if (!user) {
      throw new NotFoundException('Teacher not found');
    }
    if (!user.teacher_profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    const { email, full_name, ...profileData } = updateTeacherProfileDto;

    // Update user fields if provided
    const userUpdateData: Partial<User> = {};
    if (email && email !== user.email) {
      // Check if email already exists for another user
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.user_id !== userId) {
        throw new ConflictException('Email already exists');
      }
      userUpdateData.email = email;
    }
    if (full_name) {
      userUpdateData.full_name = full_name;
    }
    if (Object.keys(userUpdateData).length > 0) {
      await this.userRepository.update(userId, userUpdateData);
    }

    // Update teacher profile fields
    if (Object.keys(profileData).length > 0) {
      await this.teacherProfileRepository.update(userId, profileData);
    }

    // Fetch updated profile
    const updatedUser = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['teacher_profile'],
    });
    if (!updatedUser || !updatedUser.teacher_profile) {
      throw new NotFoundException('Failed to retrieve updated teacher data');
    }
    return {
      user: {
        user_id: updatedUser.user_id,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        user_type: updatedUser.user_type,
        created_at: updatedUser.created_at,
      },
      profile: updatedUser.teacher_profile,
    };
  }
}
