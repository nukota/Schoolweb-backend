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

@Entity('teacher_profiles')
export class TeacherProfile {
  @PrimaryColumn()
  user_id: number;

  @Column()
  teacher_id: string;

  @Column({ type: 'text', nullable: true })
  position?: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({ length: 500, nullable: true })
  avatar_url?: string;

  @Column({
    type: 'enum',
    enum: Department,
  })
  department: Department;

  @Column({ type: 'date', nullable: true })
  hire_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToOne(() => User, (user) => user.teacher_profile, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'user_id',
    foreignKeyConstraintName: 'FK_teacher_profiles_user_id',
  })
  user: User;
}
