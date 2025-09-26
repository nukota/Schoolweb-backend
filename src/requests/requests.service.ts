import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestsPageDTO } from './dto/request-views.dto';
import { Request } from './entities/request.entity';
import { User } from '../users/entities/user.entity';
import { Class } from '../classes/entities/class.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { RequestStatus, RequestType, EnrollmentStatus } from '../common/enums';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async create(createRequestDto: CreateRequestDto): Promise<Request> {
    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { user_id: createRequestDto.student_id },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Verify class exists
    const classEntity = await this.classRepository.findOne({
      where: { class_id: createRequestDto.class_id },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Check if there's already a pending request for this student and class
    const existingRequest = await this.requestRepository.findOne({
      where: {
        student_id: createRequestDto.student_id,
        class_id: createRequestDto.class_id,
        status: RequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'A pending request already exists for this student and class',
      );
    }

    const request = this.requestRepository.create(createRequestDto);
    return await this.requestRepository.save(request);
  }

  async getAllRequests(): Promise<RequestsPageDTO> {
    const requests = await this.requestRepository.find({
      relations: [
        'student',
        'student.student_profile',
        'class',
        'class.subject',
      ],
    });

    const mappedRequests = requests.map((request) => ({
      request_id: request.request_id,
      student_id: request.student_id.toString(),
      student_name: request.student.full_name,
      email: request.student.email,
      phone: request.student.student_profile?.phone || '',
      request_type: request.request_type,
      class_code: request.class.class_code,
      class_name: request.class.subject.subject_name,
      status: request.status,
      submitted_date: request.created_at.toISOString(),
      reviewed_date: request.reviewed_date?.toISOString(),
      message: request.message,
      avatar_url: request.student.student_profile?.avatar_url,
    }));

    return { requests: mappedRequests };
  }

  async findOne(id: number): Promise<Request> {
    const request = await this.requestRepository.findOne({
      where: { request_id: id },
      relations: ['student', 'class', 'class.subject'],
    });

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`);
    }

    return request;
  }

  async approveRequest(id: number): Promise<Request> {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new ConflictException('Request has already been processed');
    }

    // Handle enrollment logic based on request type
    if (request.request_type === RequestType.ENROLL) {
      // Check if student is already enrolled
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: {
          student_id: request.student_id,
          class_id: request.class_id,
        },
      });

      if (existingEnrollment) {
        throw new ConflictException(
          'Student is already enrolled in this class',
        );
      }

      // Create new enrollment
      const enrollment = this.enrollmentRepository.create({
        student_id: request.student_id,
        class_id: request.class_id,
        status: EnrollmentStatus.ENROLLED,
        scores: [],
      });
      await this.enrollmentRepository.save(enrollment);
    } else if (request.request_type === RequestType.DROP) {
      // Find and update enrollment status to DROPPED
      const enrollment = await this.enrollmentRepository.findOne({
        where: {
          student_id: request.student_id,
          class_id: request.class_id,
          status: EnrollmentStatus.ENROLLED,
        },
      });

      if (!enrollment) {
        throw new NotFoundException(
          'Active enrollment not found for this student and class',
        );
      }

      enrollment.status = EnrollmentStatus.DROPPED;
      await this.enrollmentRepository.save(enrollment);
    }

    // Update request status
    request.status = RequestStatus.APPROVED;
    request.reviewed_date = new Date();
    return await this.requestRepository.save(request);
  }

  async rejectRequest(id: number): Promise<Request> {
    const request = await this.findOne(id);

    if (request.status !== RequestStatus.PENDING) {
      throw new ConflictException('Request has already been processed');
    }

    request.status = RequestStatus.REJECTED;
    request.reviewed_date = new Date();
    return await this.requestRepository.save(request);
  }

  async remove(id: number): Promise<void> {
    const request = await this.findOne(id);
    await this.requestRepository.remove(request);
  }
}
