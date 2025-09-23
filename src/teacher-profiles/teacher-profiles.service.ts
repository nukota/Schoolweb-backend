import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherProfileDto } from './dto/create-teacher-profile.dto';
import { UpdateTeacherProfileDto } from './dto/update-teacher-profile.dto';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { User } from '../users/entities/user.entity';

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

    // Check if email is already taken
    const existingProfile = await this.teacherProfileRepository.findOne({
      where: { email: createTeacherProfileDto.email },
    });

    if (existingProfile) {
      throw new ConflictException('Email already exists');
    }

    const teacherProfile = this.teacherProfileRepository.create({
      ...createTeacherProfileDto,
      user_id: userId,
    });

    return await this.teacherProfileRepository.save(teacherProfile);
  }

  async findAll(): Promise<TeacherProfile[]> {
    return await this.teacherProfileRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<TeacherProfile> {
    const profile = await this.teacherProfileRepository.findOne({
      where: { user_id: id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(
        `Teacher profile with user ID ${id} not found`,
      );
    }

    return profile;
  }

  async findByEmail(email: string): Promise<TeacherProfile | null> {
    return await this.teacherProfileRepository.findOne({
      where: { email },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    updateTeacherProfileDto: UpdateTeacherProfileDto,
  ): Promise<TeacherProfile> {
    const profile = await this.findOne(id);

    // Check if email is being updated and if it's already taken
    if (
      updateTeacherProfileDto.email &&
      updateTeacherProfileDto.email !== profile.email
    ) {
      const existingProfile = await this.teacherProfileRepository.findOne({
        where: { email: updateTeacherProfileDto.email },
      });

      if (existingProfile) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(profile, updateTeacherProfileDto);
    return await this.teacherProfileRepository.save(profile);
  }

  async remove(id: number): Promise<void> {
    const profile = await this.findOne(id);
    await this.teacherProfileRepository.remove(profile);
  }
}
