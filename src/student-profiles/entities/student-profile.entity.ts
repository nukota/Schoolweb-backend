import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryColumn()
  user_id: number;

  @Column()
  student_id: number;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ length: 500, nullable: true })
  avatar_url?: string;

  @Column({
    type: 'enum',
    enum: Department,
  })
  department: Department;

  @Column({ nullable: true })
  enrollment_year?: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.student_profile, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'user_id',
    foreignKeyConstraintName: 'FK_student_profiles_user_id',
  })
  user: User;
}
