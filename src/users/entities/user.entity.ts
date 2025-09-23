import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { UserType } from '../../common/enums';
import { Class } from '../../classes/entities/class.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Request } from '../../requests/entities/request.entity';
import { StudentProfile } from '../../student-profiles/entities/student-profile.entity';
import { TeacherProfile } from '../../teacher-profiles/entities/teacher-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true, nullable: true })
  @Index()
  student_id?: number;

  @Column({ length: 255 })
  full_name: string;

  @Column({ length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserType,
  })
  user_type: UserType;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Class, (classEntity) => classEntity.teacher)
  taught_classes: Class[];

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];

  @OneToMany(() => Request, (request) => request.student)
  requests: Request[];

  @OneToOne(() => StudentProfile, (profile) => profile.user, { cascade: true })
  student_profile?: StudentProfile;

  @OneToOne(() => TeacherProfile, (profile) => profile.user, { cascade: true })
  teacher_profile?: TeacherProfile;
}
