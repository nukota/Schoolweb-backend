import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentDashboardDTO } from '../dto/student-dashboard.dto';
import { GradeType, EnrollmentStatus } from '../../common/enums';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';
import { Class } from '../../classes/entities/class.entity';
import { getCurrentSemester, getAverageScore } from '../../common/utils';

@Injectable()
export class DashboardStudentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
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
      current_semester: currentSemester,
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
      date: this.getNextClassDate(enrollment.class),
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
}
