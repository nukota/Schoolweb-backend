export enum UserType {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
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
  AVAILABLE = 'available',
  FULL = 'full',
  REQUESTED = 'requested',
  ENROLLED = 'enrolled',
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

export enum GradeType {
  MIDTERM = 'Midterm',
  FINAL_EXAM = 'Final Exam',
  COURSEWORK = 'CourseWork',
  LAB = 'Lab',
}
