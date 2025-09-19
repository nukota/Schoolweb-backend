import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Department } from '../../common/enums';
import { Class } from '../../classes/entities/class.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  subject_id: number;

  @Column({ length: 255 })
  subject_name: string;

  @Column({ length: 20, unique: true })
  @Index()
  subject_code: string;

  @Column({
    type: 'enum',
    enum: Department,
  })
  department: Department;

  @Column()
  credits: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @OneToMany(() => Class, (classEntity) => classEntity.subject)
  classes: Class[];
}
