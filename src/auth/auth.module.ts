import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from './guards/auth.guard';
import { TeacherProfile } from 'src/teacher-profiles/entities/teacher-profile.entity';
import { StudentProfile } from 'src/student-profiles/entities/student-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, StudentProfile, TeacherProfile]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
