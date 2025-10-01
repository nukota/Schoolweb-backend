import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardStudentService } from './services/dashboard-student.service';
import { DashboardTeacherService } from './services/dashboard-teacher.service';
import { DashboardAdminService } from './services/dashboard-admin.service';
import { AuthModule } from 'src/auth/auth.module';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Class } from '../classes/entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Enrollment, Class, Subject]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardStudentService,
    DashboardTeacherService,
    DashboardAdminService,
  ],
})
export class DashboardModule {}
