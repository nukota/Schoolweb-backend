import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { TeacherProfile } from '../teacher-profiles/entities/teacher-profile.entity';
import { Class } from '../classes/entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Request } from '../requests/entities/request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      StudentProfile,
      TeacherProfile,
      Class,
      Subject,
      Enrollment,
      Request,
    ]),
  ],
  controllers: [UtilsController],
  providers: [UtilsService],
})
export class UtilsModule {}
