import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('student_profiles')
export class StudentProfile {
  @PrimaryColumn()
  user_id: number;

  @Column()
  student_id: number;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ nullable: true })
  enrollment_year?: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.student_profile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
