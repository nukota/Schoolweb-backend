import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherDashboardDTO } from './dto/teacher-dashboard.dto';
import { StudentDashboardDTO } from './dto/student-dashboard.dto';
import { Department, GradeType, EnrollmentStatus } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Class } from '../classes/entities/class.entity';
import { Subject } from '../subjects/entities/subject.entity';
import { getCurrentSemester, getAverageScore } from '../common/utils';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
  ) {}

  async getStudentDashboard(userId: number): Promise<StudentDashboardDTO> {
    const currentSemester = getCurrentSemester();

    // Get all enrollments for the student with related data
    const allEnrollments = await this.enrollmentRepository.find({
      where: { student_id: userId },
      relations: ['class', 'class.subject'],
      order: { created_at: 'ASC' },
    });

    // Get current semester enrollments
    const currentEnrollments = allEnrollments.filter(
      (enrollment) => enrollment.class.semester === currentSemester,
    );

    // Calculate current semester GPA
    const currentSemesterScores = currentEnrollments
      .map((e) => getAverageScore(e.scores))
      .filter((score) => score > 0);

    const currentGPA =
      currentSemesterScores.length > 0
        ? currentSemesterScores.reduce((sum, score) => sum + score, 0) /
          currentSemesterScores.length
        : 0;

    // Calculate cumulative GPA
    const allScores = allEnrollments
      .map((e) => getAverageScore(e.scores))
      .filter((score) => score > 0);

    const cumulativeGPA =
      allScores.length > 0
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
        : 0;

    // Calculate credits (assuming each class is 3 credits)
    const creditsCompleted =
      allEnrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED)
        .length * 3;

    const creditsInProgress =
      currentEnrollments.filter((e) => e.status === EnrollmentStatus.ENROLLED)
        .length * 3;

    // Get upcoming classes (next 3 closest classes)
    const upcomingClasses = await this.getUpcomingClasses(userId);

    // Get current class scores (latest score from each current enrollment)
    const currentClassScores =
      await this.getCurrentClassScores(currentEnrollments);

    // Generate bar chart data (GPA through semesters)
    const barChartData = await this.generateGPABarChart(allEnrollments);

    // Generate pie chart data (grade distribution)
    const pieChartData = this.generateGradeDistributionPieChart(allScores);

    // Calculate changes (mock implementation - you might want to store historical data)
    const previousGPA = cumulativeGPA * 0.95; // Mock previous GPA
    const gpaChange = ((currentGPA - previousGPA) / previousGPA) * 100 || 0;

    return {
      current_semester_gpa: {
        stat: Math.round(currentGPA * 100) / 100,
        change: Math.round(gpaChange * 100) / 100,
      },
      cumulative_gpa: {
        stat: Math.round(cumulativeGPA * 100) / 100,
        change: Math.round(gpaChange * 0.5 * 100) / 100,
      },
      credits_completed: {
        stat: creditsCompleted,
        change: creditsInProgress,
      },
      credits_in_progress: {
        stat: creditsInProgress,
        change: 0,
      },
      upcoming_classes: upcomingClasses,
      current_class_scores: currentClassScores,
      bar_chart_data: barChartData,
      pie_chart_data: pieChartData,
    };
  }

  private async getUpcomingClasses(userId: number) {
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get enrolled classes for current semester that haven't ended yet
    const upcomingClassesQuery = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.class', 'class')
      .leftJoinAndSelect('class.subject', 'subject')
      .where('enrollment.student_id = :userId', { userId })
      .andWhere('enrollment.status = :status', {
        status: EnrollmentStatus.ENROLLED,
      })
      .andWhere('class.semester = :semester', {
        semester: getCurrentSemester(),
      })
      .andWhere('(class.end_date IS NULL OR class.end_date >= :currentDate)', {
        currentDate: currentDateStr,
      })
      .orderBy('class.start_date', 'ASC')
      .addOrderBy('class.start_time', 'ASC')
      .limit(3)
      .getMany();

    return upcomingClassesQuery.map((enrollment) => ({
      class_name: enrollment.class.subject.subject_name,
      class_code: enrollment.class.class_code,
      department: enrollment.class.subject.department,
      date: enrollment.class.start_date || currentDateStr,
      time: enrollment.class.start_time || '09:00 AM',
    }));
  }

  private async getCurrentClassScores(currentEnrollments: Enrollment[]) {
    const classScores: {
      class_name: string;
      class_code: string;
      score: number;
      type: GradeType;
    }[] = [];

    for (const enrollment of currentEnrollments.slice(0, 4)) {
      // Max 4 classes
      const scores = enrollment.scores;

      if (scores && scores.length > 0) {
        // Determine the latest score type based on available scores
        // Order: coursework < lab < midterm < final exam
        let latestScore: number;
        let scoreType: GradeType;

        if (scores.length >= 4 && scores[3] > 0) {
          latestScore = scores[3]; // Final exam
          scoreType = GradeType.FINAL_EXAM;
        } else if (scores.length >= 3 && scores[2] > 0) {
          latestScore = scores[2]; // Midterm
          scoreType = GradeType.MIDTERM;
        } else if (scores.length >= 2 && scores[1] > 0) {
          latestScore = scores[1]; // Lab
          scoreType = GradeType.LAB;
        } else if (scores.length >= 1 && scores[0] > 0) {
          latestScore = scores[0]; // Coursework
          scoreType = GradeType.COURSEWORK;
        } else {
          continue; // Skip if no valid scores
        }

        classScores.push({
          class_name: enrollment.class.subject.subject_name,
          class_code: enrollment.class.class_code,
          score: latestScore,
          type: scoreType,
        });
      }
    }

    return classScores;
  }

  private async generateGPABarChart(allEnrollments: Enrollment[]) {
    // Group enrollments by semester
    const semesterGPAs = new Map<string, number[]>();

    for (const enrollment of allEnrollments) {
      const semester = enrollment.class.semester;
      const score = getAverageScore(enrollment.scores);

      if (score > 0) {
        if (!semesterGPAs.has(semester)) {
          semesterGPAs.set(semester, []);
        }
        semesterGPAs.get(semester)!.push(score);
      }
    }

    // Calculate average GPA for each semester and convert to 4.0 scale
    const semesters: string[] = [];
    const gpas: number[] = [];

    for (const [semester, scores] of semesterGPAs.entries()) {
      if (scores.length > 0) {
        const avgScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const gpa = (avgScore / 10) * 4; // Convert to 4.0 scale

        semesters.push(semester);
        gpas.push(Math.round(gpa * 100) / 100);
      }
    }

    return {
      x_axis: semesters,
      data: gpas,
    };
  }

  private generateGradeDistributionPieChart(allScores: number[]) {
    if (allScores.length === 0) {
      return [{ label: 'No Data', value: 100 }];
    }

    let gradeF = 0,
      gradeD = 0,
      gradeC = 0,
      gradeB = 0,
      gradeA = 0;

    for (const score of allScores) {
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

    const total = allScores.length;
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

  async getTeacherDashboard(userId: number): Promise<TeacherDashboardDTO> {
    const currentSemester = getCurrentSemester();

    // Get all classes taught by the teacher in current semester
    const currentClasses = await this.classRepository.find({
      where: {
        teacher_id: userId,
        semester: currentSemester,
      },
      relations: ['subject', 'enrollments'],
    });

    // Get all classes taught by the teacher (for historical data)
    const allClasses = await this.classRepository.find({
      where: { teacher_id: userId },
      relations: ['subject', 'enrollments'],
      order: { created_at: 'ASC' },
    });

    // Calculate total students (unique students across all current classes)
    const currentStudentIds = new Set<number>();
    const allStudentIds = new Set<number>();

    for (const classEntity of currentClasses) {
      for (const enrollment of classEntity.enrollments) {
        currentStudentIds.add(enrollment.student_id);
      }
    }

    for (const classEntity of allClasses) {
      for (const enrollment of classEntity.enrollments) {
        allStudentIds.add(enrollment.student_id);
      }
    }

    // Calculate student average scores for current semester
    const currentEnrollments = currentClasses.flatMap((c) => c.enrollments);
    const currentScores = currentEnrollments
      .map((e) => getAverageScore(e.scores))
      .filter((score) => score > 0);

    const currentAvgScore =
      currentScores.length > 0
        ? currentScores.reduce((sum, score) => sum + score, 0) /
          currentScores.length
        : 0;

    // Calculate previous semester average for comparison
    const allEnrollments = allClasses.flatMap((c) => c.enrollments);
    const allScores = allEnrollments
      .map((e) => getAverageScore(e.scores))
      .filter((score) => score > 0);

    const overallAvgScore =
      allScores.length > 0
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
        : 0;

    // Get unique subjects
    const currentSubjects = new Set(
      currentClasses.map((c) => c.subject.subject_id),
    );
    const allSubjects = new Set(allClasses.map((c) => c.subject.subject_id));

    // Calculate changes (comparison with previous data)
    const previousStudentCount = Math.max(0, allStudentIds.size - 5); // Mock previous count
    const previousClassCount = Math.max(0, allClasses.length - 1); // Mock previous count
    const studentChange =
      previousStudentCount > 0
        ? ((currentStudentIds.size - previousStudentCount) /
            previousStudentCount) *
          100
        : 0;
    const classChange =
      previousClassCount > 0
        ? ((currentClasses.length - previousClassCount) / previousClassCount) *
          100
        : 0;
    const scoreChange =
      overallAvgScore > 0
        ? ((currentAvgScore - overallAvgScore) / overallAvgScore) * 100
        : 0;

    // Get upcoming classes (next 4 classes)
    const upcomingClasses = await this.getTeacherUpcomingClasses(userId);

    // Get calendar dates for current and next month
    const calendarDates = await this.getTeacherCalendarDates(userId);

    // Generate bar chart data (classes amount by subject)
    const barChartData = this.generateTeacherSubjectBarChart(currentClasses);

    // Generate pie chart data (proportion of classes by department)
    const pieChartData = this.generateTeacherDepartmentPieChart(currentClasses);

    return {
      total_students: {
        stat: currentStudentIds.size,
        change: Math.round(studentChange * 100) / 100,
      },
      total_classes: {
        stat: currentClasses.length,
        change: Math.round(classChange * 100) / 100,
      },
      student_avg_score: {
        stat: Math.round(currentAvgScore * 100) / 100,
        change: Math.round(scoreChange * 100) / 100,
      },
      subjects: {
        stat: currentSubjects.size,
        change: currentSubjects.size - allSubjects.size,
      },
      calendar_dates: calendarDates,
      upcoming_classes: upcomingClasses,
      bar_chart_data: barChartData,
      pie_chart_data: pieChartData,
    };
  }

  private async getTeacherUpcomingClasses(userId: number) {
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentSemester = getCurrentSemester();

    // Get upcoming classes for the teacher
    const upcomingClasses = await this.classRepository.find({
      where: {
        teacher_id: userId,
        semester: currentSemester,
      },
      relations: ['subject'],
      order: { start_date: 'ASC', start_time: 'ASC' },
      take: 4,
    });

    // Filter classes that haven't ended yet
    const filteredClasses = upcomingClasses.filter(
      (classEntity) =>
        !classEntity.end_date || classEntity.end_date >= currentDateStr,
    );

    return filteredClasses.map((classEntity) => ({
      class_name: classEntity.subject.subject_name,
      class_code: classEntity.class_code,
      department: classEntity.subject.department,
      date: classEntity.start_date || currentDateStr,
      time: classEntity.start_time || '09:00 AM',
    }));
  }

  private async getTeacherCalendarDates(userId: number) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Get start and end dates for current and next month
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 2, 0); // Last day of next month

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get all classes for the teacher within the date range
    const classes = await this.classRepository.find({
      where: {
        teacher_id: userId,
      },
      relations: ['subject'],
    });

    // Filter classes that fall within the current and next month
    const calendarDates = new Set<string>();

    for (const classEntity of classes) {
      if (
        classEntity.start_date &&
        classEntity.start_date >= startDateStr &&
        classEntity.start_date <= endDateStr
      ) {
        calendarDates.add(classEntity.start_date);
      }

      // If class has recurring schedule (e.g., weekly), generate dates
      if (classEntity.day && classEntity.start_date && classEntity.end_date) {
        const classDates = this.generateRecurringDates(
          classEntity.start_date,
          classEntity.end_date,
          classEntity.day,
          startDateStr,
          endDateStr,
        );
        classDates.forEach((date) => calendarDates.add(date));
      }
    }

    return Array.from(calendarDates).sort();
  }

  private generateRecurringDates(
    classStartDate: string,
    classEndDate: string,
    dayOfWeek: string,
    rangeStart: string,
    rangeEnd: string,
  ): string[] {
    const dates: string[] = [];
    const dayMap: { [key: string]: number } = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDay = dayMap[dayOfWeek];
    if (targetDay === undefined) return dates;

    const start = new Date(
      Math.max(
        new Date(classStartDate).getTime(),
        new Date(rangeStart).getTime(),
      ),
    );
    const end = new Date(
      Math.min(new Date(classEndDate).getTime(), new Date(rangeEnd).getTime()),
    );

    // Find the first occurrence of the target day
    const current = new Date(start);
    const daysToAdd = (targetDay - current.getDay() + 7) % 7;
    current.setDate(current.getDate() + daysToAdd);

    // Generate weekly occurrences
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 7); // Add one week
    }

    return dates;
  }

  private generateTeacherSubjectBarChart(classes: Class[]) {
    // Group classes by subject name and count them
    const subjectCount = new Map<string, number>();

    for (const classEntity of classes) {
      const subjectName = classEntity.subject.subject_name;
      subjectCount.set(subjectName, (subjectCount.get(subjectName) || 0) + 1);
    }

    const subjects = Array.from(subjectCount.keys());
    const counts = Array.from(subjectCount.values());

    return {
      x_axis: subjects,
      data: counts,
    };
  }

  private generateTeacherDepartmentPieChart(classes: Class[]) {
    if (classes.length === 0) {
      return [{ label: 'No Classes', value: 100 }];
    }

    // Group classes by department and count them
    const departmentCount = new Map<Department, number>();

    for (const classEntity of classes) {
      const department = classEntity.subject.department;
      departmentCount.set(
        department,
        (departmentCount.get(department) || 0) + 1,
      );
    }

    const total = classes.length;
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
}
