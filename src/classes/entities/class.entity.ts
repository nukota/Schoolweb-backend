import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../users/entities/user.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Request } from '../../requests/entities/request.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  class_id: number;

  @Column({ length: 20, unique: true })
  @Index()
  class_code: string;

  @Column()
  @Index()
  subject_id: number;

  @Column()
  @Index()
  teacher_id: number;

  @Column({ length: 20, nullable: true })
  room?: string;

  @Column({ type: 'date', nullable: true })
  start_date?: string; // ISO date string (YYYY-MM-DD)

  @Column({ type: 'date', nullable: true })
  end_date?: string; // ISO date string (YYYY-MM-DD)

  @Column({ length: 20, nullable: true })
  day?: string; // e.g., "Monday"

  @Column({ type: 'time', nullable: true })
  start_time?: string; // e.g., "09:00"

  @Column({ type: 'time', nullable: true })
  end_time?: string; // e.g., "10:30"

  @Column()
  max_size: number;

  @Column({ length: 50 })
  semester: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Subject, (subject) => subject.classes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'subject_id',
    referencedColumnName: 'subject_id',
    foreignKeyConstraintName: 'FK_classes_subject_id',
  })
  subject: Subject;

  @ManyToOne(() => User, (user) => user.taught_classes, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'teacher_id',
    referencedColumnName: 'user_id',
    foreignKeyConstraintName: 'FK_classes_teacher_id',
  })
  teacher: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.class)
  enrollments: Enrollment[];

  @OneToMany(() => Request, (request) => request.class)
  requests: Request[];
}
