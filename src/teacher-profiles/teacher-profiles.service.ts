import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { User } from '../users/entities/user.entity';
import { UserType } from '../common/enums';
import { TeacherProfileDTO } from './dto/teacher-profile-view.dto';
import { UpdateTeacherProfileDTO } from './dto/update-teacher-profile.dto';

@Injectable()
export class TeacherProfilesService {
  constructor(
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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
    updateTeacherProfileDTO: UpdateTeacherProfileDTO,
  ): Promise<TeacherProfileDTO> {
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

    const { email, dob, avatar_url } = updateTeacherProfileDTO;

    // Update user email if provided
    if (email && email !== user.email) {
      // Check if email already exists for another user
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser && existingUser.user_id !== userId) {
        throw new ConflictException('Email already exists');
      }
      await this.userRepository.update(userId, { email });
    }

    // Update teacher profile fields (only dob and avatar_url)
    const profileUpdateData: Partial<TeacherProfile> = {};
    if (dob !== undefined) {
      profileUpdateData.dob = dob ? new Date(dob) : undefined;
    }
    if (avatar_url !== undefined) {
      profileUpdateData.avatar_url = avatar_url;
    }

    if (Object.keys(profileUpdateData).length > 0) {
      await this.teacherProfileRepository.update(
        { user_id: userId },
        profileUpdateData,
      );
    }

    // Fetch updated profile
    const updatedUser = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['teacher_profile'],
    });
    if (!updatedUser || !updatedUser.teacher_profile) {
      throw new NotFoundException('Failed to retrieve updated teacher data');
    }
    const profile = updatedUser.teacher_profile;
    return {
      user_id: updatedUser.user_id,
      teacher_id: profile.teacher_id,
      full_name: updatedUser.full_name,
      email: updatedUser.email,
      position: profile.position,
      dob: profile.dob?.toString(),
      avatar_url: profile.avatar_url,
      department: profile.department,
      hire_date: profile.hire_date?.toString(),
    };
  }
}
