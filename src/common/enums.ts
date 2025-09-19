export enum UserType {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export enum Department {
  COMPUTER_SCIENCE = 'Computer Science',
  INFORMATION_TECHNOLOGY = 'Information Technology',
  MATHEMATICS = 'Mathematics',
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  ENGLISH = 'English',
  ECONOMICS = 'Economics',
  BUSINESS_ADMINISTRATION = 'Business Administration',
  EDUCATION = 'Education',
  ELECTRICAL_ENGINEERING = 'Electrical Engineering',
  MECHANICAL_ENGINEERING = 'Mechanical Engineering',
  MEDICINE = 'Medicine',
  PHARMACY = 'Pharmacy',
}

export enum ClassStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  DROPPED = 'dropped',
  COMPLETED = 'completed',
}

export enum RequestType {
  ENROLL = 'enroll',
  DROP = 'drop',
}

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export type RegistrationStatus =
  | 'enrolled'
  | 'completed'
  | 'dropped'
  | 'requested';

export type GradeType = 'Midterm' | 'Final Exam' | 'CourseWork' | 'Lab';
