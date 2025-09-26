import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherProfilesService } from './teacher-profiles.service';
import { TeacherProfilesController } from './teacher-profiles.controller';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeacherProfile, User, StudentProfile]),
    AuthModule,
  ],
  controllers: [TeacherProfilesController],
  providers: [TeacherProfilesService],
  exports: [TeacherProfilesService],
})
export class TeacherProfilesModule {}
