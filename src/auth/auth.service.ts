import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { TeacherProfile } from '../teacher-profiles/entities/teacher-profile.entity';
import {
  SignupDto,
  LoginDto,
  AuthResponseDto,
  JwtPayload,
} from './dto/auth.dto';
import { UserType } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponseDto> {
    const { email, full_name, password, user_type } = signupDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      full_name,
      email,
      password: hashedPassword,
      user_type,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: savedUser.user_id,
      email: savedUser.email,
      user_type: savedUser.user_type,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'User created successfully',
      access_token,
      user: {
        user_id: savedUser.user_id,
        email: savedUser.email,
        full_name: savedUser.full_name,
        user_type: savedUser.user_type,
        has_profile: false,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['student_profile', 'teacher_profile'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user has profile
    const hasProfile =
      user.user_type === UserType.STUDENT
        ? !!user.student_profile
        : !!user.teacher_profile;

    // Generate JWT token
    const payload: JwtPayload = {
      sub: user.user_id,
      email: user.email,
      user_type: user.user_type,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login successful',
      access_token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        has_profile: hasProfile,
      },
    };
  }
}
