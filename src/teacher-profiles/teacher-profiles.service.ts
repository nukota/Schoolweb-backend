import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherProfileDto } from './dto/create-teacher-profile.dto';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { User } from '../users/entities/user.entity';
import { UserType } from '../common/enums';
import { TeacherProfileDTO } from './dto/teacher-profile-view.dto';

@Injectable()
export class TeacherProfilesService {
  constructor(
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
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

  async getProfileWithUser(userId: number): Promise<TeacherProfileDTO> {
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

    const profile = user.teacher_profile;

    return {
      user_id: user.user_id,
      teacher_id: profile.teacher_id,
      full_name: user.full_name,
      email: user.email,
      position: profile.position,
      dob: profile.dob?.toString(),
      avatar_url: profile.avatar_url,
      department: profile.department,
      hire_date: profile.hire_date?.toString(),
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
