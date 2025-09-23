import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './guards/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { TeacherProfile } from '../teacher-profiles/entities/teacher-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, StudentProfile, TeacherProfile]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
