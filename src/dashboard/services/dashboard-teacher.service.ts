import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherDashboardDTO } from '../dto/teacher-dashboard.dto';
import { Department, EnrollmentStatus } from '../../common/enums';
import { Class } from '../../classes/entities/class.entity';
import { getCurrentSemester, getAverageScore } from '../../common/utils';

@Injectable()
export class DashboardTeacherService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

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
        if (enrollment.status !== EnrollmentStatus.DROPPED) {
          currentStudentIds.add(enrollment.student_id);
        }
      }
    }

    for (const classEntity of allClasses) {
      for (const enrollment of classEntity.enrollments) {
        if (enrollment.status !== EnrollmentStatus.DROPPED) {
          allStudentIds.add(enrollment.student_id);
        }
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
        ? (currentAvgScore - overallAvgScore) / overallAvgScore
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
      current_semester: currentSemester,
    };
  }

  private async getTeacherUpcomingClasses(userId: number) {
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get upcoming classes for the teacher (no semester check)
    const upcomingClasses = await this.classRepository.find({
      where: {
        teacher_id: userId,
      },
      relations: ['subject'],
      order: { start_date: 'ASC', start_time: 'ASC' },
      take: 4,
    });

    // Filter classes that haven't ended yet (include classes that haven't started yet)
    const filteredClasses = upcomingClasses.filter(
      (classEntity) =>
        !classEntity.end_date || classEntity.end_date >= currentDateStr,
    );

    // Map to DTO and sort by actual next class date and time
    const result = filteredClasses.map((classEntity) => ({
      class_name: classEntity.subject.subject_name,
      class_code: classEntity.class_code,
      department: classEntity.subject.department,
      date: this.getNextClassDate(classEntity),
      time: classEntity.start_time || '09:00 AM',
    }));

    // Sort by date and time
    result.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    return result;
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

  private getNextClassDate(classEntity: Class): string {
    const currentDate = new Date();
    const currentDateStr = currentDate.toISOString().split('T')[0];

    // If class has a recurring day, calculate next occurrence
    if (classEntity.day && classEntity.start_date && classEntity.end_date) {
      const dayMap: { [key: string]: number } = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const targetDay = dayMap[classEntity.day];
      if (targetDay !== undefined) {
        // Start from today or class start date, whichever is later
        const startFrom = new Date(
          Math.max(
            new Date(classEntity.start_date).getTime(),
            currentDate.getTime(),
          ),
        );

        // Find the next occurrence of the target day
        const current = new Date(startFrom);
        const daysToAdd = (targetDay - current.getDay() + 7) % 7;
        if (
          daysToAdd === 0 &&
          current.toISOString().split('T')[0] === currentDateStr
        ) {
          // If it's today and matches the day, but we want the next occurrence
          current.setDate(current.getDate() + 7);
        } else {
          current.setDate(current.getDate() + daysToAdd);
        }

        // Check if the calculated date is within the class end date
        const endDate = new Date(classEntity.end_date);
        if (current <= endDate) {
          return current.toISOString().split('T')[0];
        }
      }
    }

    // Fallback to start_date if no recurring day or calculation failed
    return classEntity.start_date || currentDateStr;
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
