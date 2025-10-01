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
import { Admin } from '../admin/entities/admin.entity';
import {
  SignupDTO,
  LoginDTO,
  AuthResponseDTO,
  JwtPayload,
  MeUserDTO,
} from './dto/auth.dto';
import { UserType, UserRole } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDTO: SignupDTO): Promise<AuthResponseDTO> {
    const { email, full_name, password } = signupDTO;

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

    // Create user as STUDENT (default for signup)
    const user = this.userRepository.create({
      full_name,
      email,
      password: hashedPassword,
      user_type: UserType.STUDENT,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload: JwtPayload = {
      sub: savedUser.user_id,
      email: savedUser.email,
      user_role: UserRole.STUDENT,
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
        user_role: UserRole.STUDENT,
        has_profile: false,
      },
    };
  }

  async login(loginDTO: LoginDTO): Promise<AuthResponseDTO> {
    const { email, password } = loginDTO;

    // First, try to find regular user by email
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['student_profile', 'teacher_profile'],
    });

    if (user) {
      // Verify user password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        // Check if user has profile
        const hasProfile =
          user.user_type === UserType.STUDENT
            ? !!user.student_profile
            : !!user.teacher_profile;

        // Generate JWT token for user
        const payload: JwtPayload = {
          sub: user.user_id,
          email: user.email,
          user_role: user.user_type as unknown as UserRole,
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
            user_role: user.user_type as unknown as UserRole,
            has_profile: hasProfile,
          },
        };
      }
    }

    // If not a regular user, check admin
    const admin = await this.adminRepository.findOne({
      where: { email },
    });

    if (admin) {
      // Verify admin password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (isPasswordValid) {
        // Generate JWT token for admin
        const payload: JwtPayload = {
          sub: 1, // Fixed ID for admin since there's only one
          email: admin.email,
          user_role: UserRole.ADMIN,
        };

        const access_token = this.jwtService.sign(payload);

        return {
          success: true,
          message: 'Admin login successful',
          access_token,
          user: {
            user_id: 0, // Fixed ID for admin
            email: admin.email,
            full_name: 'Administrator',
            user_role: UserRole.ADMIN,
            has_profile: true,
          },
        };
      }
    }

    // If neither user nor admin found, or password incorrect
    throw new UnauthorizedException('Invalid credentials');
  }

  async getMe(userId: number, userRole?: UserRole): Promise<MeUserDTO> {
    // Handle admin users
    if (userRole === UserRole.ADMIN) {
      const admin = await this.adminRepository.findOne({
        where: { id: 0 },
      });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      return {
        user_id: 0,
        email: admin.email,
        full_name: 'Administrator',
        user_role: UserRole.ADMIN,
        has_profile: true,
      };
    }

    // Handle regular users (students and teachers)
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['student_profile', 'teacher_profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has profile
    const hasProfile =
      user.user_type === UserType.STUDENT
        ? !!user.student_profile
        : !!user.teacher_profile;

    // Get avatar_url from the correct profile
    let avatar_url: string | undefined = undefined;
    if (user.user_type === UserType.STUDENT && user.student_profile) {
      avatar_url = user.student_profile.avatar_url;
    } else if (user.user_type === UserType.TEACHER && user.teacher_profile) {
      avatar_url = user.teacher_profile.avatar_url;
    }

    return {
      user_id: user.user_id,
      email: user.email,
      full_name: user.full_name,
      user_role: user.user_type as unknown as UserRole,
      has_profile: hasProfile,
      avatar_url,
    };
  }
}
