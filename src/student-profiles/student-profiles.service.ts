import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentProfileDTO } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDTO } from './dto/update-student-profile.dto';
import { StudentProfile } from './entities/student-profile.entity';
import { User } from '../users/entities/user.entity';
import { UserType } from '../common/enums';
import { StudentProfileDTO } from './dto/student-profile-view.dto';

@Injectable()
export class StudentProfilesService {
  constructor(
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    userId: number,
    createStudentProfileDTO: CreateStudentProfileDTO,
  ): Promise<StudentProfile> {
    // Check if user exists and is a student
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['student_profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.student_profile) {
      throw new ConflictException(
        'Student profile already exists for this user',
      );
    }

    const studentProfile = this.studentProfileRepository.create({
      ...createStudentProfileDTO,
      user_id: userId,
    });

    return await this.studentProfileRepository.save(studentProfile);
  }

  async update(
    userId: number,
    updateStudentProfileDTO: UpdateStudentProfileDTO,
  ): Promise<UpdateStudentProfileDTO> {
    // Check if user exists and is a student
    const user = await this.userRepository.findOne({
      where: { user_id: userId, user_type: UserType.STUDENT },
      relations: ['student_profile'],
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    if (!user.student_profile) {
      throw new NotFoundException('Student profile not found');
    }

    const { email, ...profileData } = updateStudentProfileDTO;

    // Update user email if provided
    if (email) {
      // Check if email already exists for another user
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser && existingUser.user_id !== userId) {
        throw new ConflictException('Email already exists');
      }

      await this.userRepository.update(userId, { email });
      user.email = email;
    }

    // Update student profile
    if (Object.keys(profileData).length > 0) {
      await this.studentProfileRepository.update(userId, profileData);
    }

    // Fetch updated profile
    const updatedProfile = await this.studentProfileRepository.findOne({
      where: { user_id: userId },
    });

    // Return only the fields defined in UpdateStudentProfileDTO
    const result: UpdateStudentProfileDTO = {
      phone: updatedProfile?.phone,
      dob: updatedProfile?.dob
        ? new Date(updatedProfile.dob).toISOString().split('T')[0]
        : undefined,
      email: user.email,
      avatar_url: updatedProfile?.avatar_url,
    };
    return result;
  }

  async getProfileWithUser(userId: number): Promise<StudentProfileDTO> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId, user_type: UserType.STUDENT },
      relations: ['student_profile'],
    });

    if (!user) {
      throw new NotFoundException('Student not found');
    }

    if (!user.student_profile) {
      throw new NotFoundException('Student profile not found');
    }

    const profile = user.student_profile;

    return {
      user_id: user.user_id,
      student_id: profile.student_id,
      full_name: user.full_name,
      email: user.email,
      phone: profile.phone,
      dob: profile.dob?.toString(),
      avatar_url: profile.avatar_url,
      department: profile.department,
      enrollment_year: profile.enrollment_year,
    };
  }
}
