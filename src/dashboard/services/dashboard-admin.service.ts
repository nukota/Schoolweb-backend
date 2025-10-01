import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminDashboardDTO } from '../dto/admin-dashboard.dto';
import { Department, UserType } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { Class } from '../../classes/entities/class.entity';
import { Subject } from '../../subjects/entities/subject.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { getAverageScore } from '../../common/utils';

@Injectable()
export class DashboardAdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
  ) {}

  async getAdminDashboard(): Promise<AdminDashboardDTO> {
    // Get total counts
    const [totalTeachers, totalStudents, totalClasses] = await Promise.all([
      this.userRepository.count({ where: { user_type: UserType.TEACHER } }),
      this.userRepository.count({ where: { user_type: UserType.STUDENT } }),
      this.classRepository.count(),
    ]);

    // Calculate total attendance (mock implementation - you might want to track actual attendance)
    const totalAttendance = await this.calculateTotalAttendance();

    // Generate bar chart data (number of classes by department)
    const barChartData = await this.generateClassesByDepartmentBarChart();

    // Generate three pie chart data
    const pieChartData = await this.generateAdminPieCharts();

    // Calculate changes (mock implementation)
    const previousTeachers = Math.max(0, totalTeachers - 2);
    const previousStudents = Math.max(0, totalStudents - 10);
    const previousClasses = Math.max(0, totalClasses - 5);
    const previousAttendance = Math.max(0, totalAttendance - 50);

    const teacherChange =
      previousTeachers > 0
        ? ((totalTeachers - previousTeachers) / previousTeachers) * 100
        : 0;
    const studentChange =
      previousStudents > 0
        ? ((totalStudents - previousStudents) / previousStudents) * 100
        : 0;
    const classChange =
      previousClasses > 0
        ? ((totalClasses - previousClasses) / previousClasses) * 100
        : 0;
    const attendanceChange =
      previousAttendance > 0
        ? ((totalAttendance - previousAttendance) / previousAttendance) * 100
        : 0;

    return {
      total_teachers: {
        stat: totalTeachers,
        change: Math.round(teacherChange * 100) / 100,
      },
      total_students: {
        stat: totalStudents,
        change: Math.round(studentChange * 100) / 100,
      },
      total_classes: {
        stat: totalClasses,
        change: Math.round(classChange * 100) / 100,
      },
      total_attendance: {
        stat: totalAttendance,
        change: Math.round(attendanceChange * 100) / 100,
      },
      bar_chart_data: barChartData,
      pie_chart_data: pieChartData,
    };
  }

  private async calculateTotalAttendance(): Promise<number> {
    // Mock implementation - in a real system, you'd have an attendance table
    // For now, we'll estimate based on enrollments
    const enrollments = await this.enrollmentRepository.find({
      relations: ['class'],
    });

    // Assume 80% attendance rate
    return Math.round(enrollments.length * 0.8);
  }

  private async generateClassesByDepartmentBarChart() {
    // Get all classes with subject relations
    const classes = await this.classRepository.find({
      relations: ['subject'],
    });

    // Group classes by department
    const departmentCount = new Map<Department, number>();

    for (const classEntity of classes) {
      const department = classEntity.subject.department;
      departmentCount.set(
        department,
        (departmentCount.get(department) || 0) + 1,
      );
    }

    const departments = Array.from(departmentCount.keys());
    const counts = Array.from(departmentCount.values());

    return {
      x_axis: departments,
      data: counts,
    };
  }

  private async generateAdminPieCharts() {
    const pieCharts: { label: string; value: number }[][] = [];

    // First pie chart: teachers by department
    const teacherByDepartment =
      await this.generateTeachersByDepartmentPieChart();
    pieCharts.push(teacherByDepartment);

    // Second pie chart: subjects by department
    const subjectsByDepartment =
      await this.generateSubjectsByDepartmentPieChart();
    pieCharts.push(subjectsByDepartment);

    // Third pie chart: grade proportions of enrollments
    const gradeProportions = await this.generateGradeProportionsPieChart();
    pieCharts.push(gradeProportions);

    return pieCharts;
  }

  private async generateTeachersByDepartmentPieChart(): Promise<
    { label: string; value: number }[]
  > {
    // Get all teachers with their profiles to get department info
    const teachers = await this.userRepository.find({
      where: { user_type: UserType.TEACHER },
      relations: ['teacher_profile'],
    });

    if (teachers.length === 0) {
      return [{ label: 'No Teachers', value: 100 }];
    }

    // Group teachers by department
    const departmentCount = new Map<Department, number>();

    for (const teacher of teachers) {
      if (teacher.teacher_profile?.department) {
        const department = teacher.teacher_profile.department;
        departmentCount.set(
          department,
          (departmentCount.get(department) || 0) + 1,
        );
      }
    }

    const total = teachers.length;
    const pieData: { label: string; value: number }[] = [];

    for (const [department, count] of departmentCount.entries()) {
      const percentage = Math.round((count / total) * 100 * 100) / 100;
      pieData.push({
        label: department,
        value: percentage,
      });
    }

    return pieData.length > 0 ? pieData : [{ label: 'No Data', value: 100 }];
  }

  private async generateSubjectsByDepartmentPieChart(): Promise<
    { label: string; value: number }[]
  > {
    // Get all subjects
    const subjects = await this.subjectRepository.find();

    if (subjects.length === 0) {
      return [{ label: 'No Subjects', value: 100 }];
    }

    // Group subjects by department
    const departmentCount = new Map<Department, number>();

    for (const subject of subjects) {
      const department = subject.department;
      departmentCount.set(
        department,
        (departmentCount.get(department) || 0) + 1,
      );
    }

    const total = subjects.length;
    const pieData: { label: string; value: number }[] = [];

    for (const [department, count] of departmentCount.entries()) {
      const percentage = Math.round((count / total) * 100 * 100) / 100;
      pieData.push({
        label: department,
        value: percentage,
      });
    }

    return pieData.length > 0 ? pieData : [{ label: 'No Data', value: 100 }];
  }

  private async generateGradeProportionsPieChart(): Promise<
    { label: string; value: number }[]
  > {
    // Get all enrollments with scores
    const enrollments = await this.enrollmentRepository.find();

    if (enrollments.length === 0) {
      return [{ label: 'No Enrollments', value: 100 }];
    }

    // Calculate average scores for all enrollments
    const scores = enrollments
      .map((e) => getAverageScore(e.scores))
      .filter((score) => score > 0);

    if (scores.length === 0) {
      return [{ label: 'No Grades', value: 100 }];
    }

    // Group by grade ranges (same as student dashboard)
    let gradeF = 0,
      gradeD = 0,
      gradeC = 0,
      gradeB = 0,
      gradeA = 0;

    for (const score of scores) {
      if (score < 5) {
        gradeF++;
      } else if (score < 6) {
        gradeD++;
      } else if (score < 7) {
        gradeC++;
      } else if (score < 8) {
        gradeB++;
      } else {
        gradeA++;
      }
    }

    const total = scores.length;
    const pieData: { label: string; value: number }[] = [];

    if (gradeF > 0)
      pieData.push({
        label: 'F (<5)',
        value: Math.round((gradeF / total) * 100 * 100) / 100,
      });
    if (gradeD > 0)
      pieData.push({
        label: 'D (<6)',
        value: Math.round((gradeD / total) * 100 * 100) / 100,
      });
    if (gradeC > 0)
      pieData.push({
        label: 'C (<7)',
        value: Math.round((gradeC / total) * 100 * 100) / 100,
      });
    if (gradeB > 0)
      pieData.push({
        label: 'B (<8)',
        value: Math.round((gradeB / total) * 100 * 100) / 100,
      });
    if (gradeA > 0)
      pieData.push({
        label: 'A (8-10)',
        value: Math.round((gradeA / total) * 100 * 100) / 100,
      });

    return pieData.length > 0 ? pieData : [{ label: 'No Grades', value: 100 }];
  }
}
