import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { EnrollmentStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn()
  enrollment_id: number;

  @Column()
  @Index()
  student_id: number;

  @Column()
  @Index()
  class_id: number;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ENROLLED,
  })
  status: EnrollmentStatus;

  @Column('float', { array: true, default: () => 'ARRAY[]::float[]' })
  scores: number[];

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.enrollments, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Class, (classEntity) => classEntity.enrollments, {
    eager: true,
  })
  @JoinColumn({ name: 'class_id' })
  class: Class;
}
