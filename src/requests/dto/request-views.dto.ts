import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus, RequestType } from '../../common/enums';

//DTO for Requests Page
export class RequestDTO {
  @ApiProperty({ example: 1, description: 'Request ID' })
  request_id: number;

  @ApiProperty({ example: '12345', description: 'Student ID' })
  student_id: string;

  @ApiProperty({ example: 'John Doe', description: 'Student name' })
  student_name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Student email' })
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'Student phone' })
  phone: string;

  @ApiProperty({
    enum: RequestType,
    description: 'Type of request',
  })
  request_type: RequestType;

  @ApiProperty({ example: 'CS101', description: 'Class code' })
  class_code: string;

  @ApiProperty({
    example: 'Introduction to Programming',
    description: 'Class name',
  })
  class_name: string;

  @ApiProperty({
    enum: RequestStatus,
    description: 'Request status',
  })
  status: RequestStatus;

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Submission date',
  })
  submitted_date: string;

  @ApiProperty({
    example: '2024-01-16T14:20:00Z',
    description: 'Review date',
    required: false,
  })
  reviewed_date?: string;

  @ApiProperty({
    example: 'Request message from student',
    description: 'Request message',
  })
  message: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
    required: false,
  })
  avatar_url?: string;
}

export class RequestsPageDTO {
  @ApiProperty({
    type: [RequestDTO],
    description: 'List of requests',
  })
  requests: RequestDTO[];
}
