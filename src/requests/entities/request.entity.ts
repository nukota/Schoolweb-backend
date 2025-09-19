import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RequestType, RequestStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn()
  request_id: number;

  @Column()
  @Index()
  student_id: number;

  @Column()
  @Index()
  class_id: number;

  @Column({
    type: 'enum',
    enum: RequestType,
  })
  request_type: RequestType;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.requests, { eager: true })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => Class, (classEntity) => classEntity.requests, {
    eager: true,
  })
  @JoinColumn({ name: 'class_id' })
  class: Class;
}
