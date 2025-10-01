import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesAdminService } from './services/classes-admin.service';
import { ClassesTeacherService } from './services/classes-teacher.service';
import { ClassesStudentService } from './services/classes-student.service';
import { Class } from './entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Request } from '../requests/entities/request.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Class,
      Subject,
      User,
      Enrollment,
      Request,
      StudentProfile,
    ]),
    AuthModule,
  ],
  controllers: [ClassesController],
  providers: [
    ClassesAdminService,
    ClassesTeacherService,
    ClassesStudentService,
  ],
  exports: [],
})
export class ClassesModule {}
