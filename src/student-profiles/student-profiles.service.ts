import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';
import { StudentProfile } from './entities/student-profile.entity';
import { User } from '../users/entities/user.entity';

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
    createStudentProfileDto: CreateStudentProfileDto,
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

    // Check if email is already taken
    const existingProfile = await this.studentProfileRepository.findOne({
      where: { email: createStudentProfileDto.email },
    });

    if (existingProfile) {
      throw new ConflictException('Email already exists');
    }

    const studentProfile = this.studentProfileRepository.create({
      ...createStudentProfileDto,
      user_id: userId,
    });

    return await this.studentProfileRepository.save(studentProfile);
  }

  async findAll(): Promise<StudentProfile[]> {
    return await this.studentProfileRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<StudentProfile> {
    const profile = await this.studentProfileRepository.findOne({
      where: { user_id: id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(
        `Student profile with user ID ${id} not found`,
      );
    }

    return profile;
  }

  async findByEmail(email: string): Promise<StudentProfile | null> {
    return await this.studentProfileRepository.findOne({
      where: { email },
      relations: ['user'],
    });
  }

  async update(
    id: number,
    updateStudentProfileDto: UpdateStudentProfileDto,
  ): Promise<StudentProfile> {
    const profile = await this.findOne(id);

    // Check if email is being updated and if it's already taken
    if (
      updateStudentProfileDto.email &&
      updateStudentProfileDto.email !== profile.email
    ) {
      const existingProfile = await this.studentProfileRepository.findOne({
        where: { email: updateStudentProfileDto.email },
      });

      if (existingProfile) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(profile, updateStudentProfileDto);
    return await this.studentProfileRepository.save(profile);
  }

  async remove(id: number): Promise<void> {
    const profile = await this.findOne(id);
    await this.studentProfileRepository.remove(profile);
  }
}
