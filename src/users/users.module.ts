import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { TeacherProfile } from '../teacher-profiles/entities/teacher-profile.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Class } from '../classes/entities/class.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      StudentProfile,
      TeacherProfile,
      Enrollment,
      Class,
    ]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
