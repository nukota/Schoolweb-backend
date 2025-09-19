import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { StudentProfilesModule } from './student-profiles/student-profiles.module';
import { TeacherProfilesModule } from './teacher-profiles/teacher-profiles.module';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [UsersModule, ClassesModule, SubjectsModule, EnrollmentsModule, StudentProfilesModule, TeacherProfilesModule, RequestsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
