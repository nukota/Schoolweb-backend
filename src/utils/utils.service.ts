import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { StudentProfile } from '../student-profiles/entities/student-profile.entity';
import { TeacherProfile } from '../teacher-profiles/entities/teacher-profile.entity';
import { Class } from '../classes/entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Request } from '../requests/entities/request.entity';

@Injectable()
export class UtilsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(StudentProfile)
    private readonly studentProfileRepository: Repository<StudentProfile>,
    @InjectRepository(TeacherProfile)
    private readonly teacherProfileRepository: Repository<TeacherProfile>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  async clearAllData(): Promise<{ message: string }> {
    try {
      // Clear data in order to respect foreign key constraints
      // Delete in reverse order of dependencies

      // 1. Delete requests (depends on users and classes)
      await this.requestRepository.query('DELETE FROM "requests"');

      // 2. Delete enrollments (depends on users and classes)
      await this.enrollmentRepository.query('DELETE FROM "enrollments"');

      // 3. Delete classes (depends on subjects and users)
      await this.classRepository.query('DELETE FROM "classes"');

      // 4. Delete subjects (independent)
      await this.subjectRepository.query('DELETE FROM "subjects"');

      // 5. Delete student profiles (depends on users)
      await this.studentProfileRepository.query(
        'DELETE FROM "student_profiles"',
      );

      // 6. Delete teacher profiles (depends on users)
      await this.teacherProfileRepository.query(
        'DELETE FROM "teacher_profiles"',
      );

      // 7. Delete users (independent, but profiles depend on it)
      await this.userRepository.query('DELETE FROM "users"');

      return {
        message:
          'All data has been cleared successfully. Database schema is preserved.',
      };
    } catch (error) {
      throw new Error(`Failed to clear database: ${error.message}`);
    }
  }
}
