export function getCurrentSemester(date?: Date): string {
  const currentDate = date || new Date();
  const month = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
  const year = currentDate.getFullYear();
  // First semester: September to January (next year)
  if (month >= 9 && month <= 12) {
    return `First ${year + 1}`;
  }
  // First semester continues in January
  else if (month === 1) {
    return `First ${year}`;
  }
  // Second semester: February to June
  else if (month >= 2 && month <= 6) {
    return `Second ${year}`;
  }
  // Third semester: July to August (remaining 2 months)
  else {
    return `Third ${year}`;
  }
}

/**
 * Calculate average score for an enrollment based on the scores array
 * The scores array can contain up to 5 scores in order:
 * [coursework, lab, midterm, final_exam, avg_scores]
 *
 * Weights:
 * - Coursework: 10%
 * - Lab: 20%
 * - Midterm: 30%
 * - Final Exam: 40%
 * - The 5th element (avg_scores) is not used in calculation but stored for reference
 *
 * @param scores Array of scores (can be partial)
 * @returns Calculated average score rounded to 2 decimal places, or 0 if no valid scores
 */
export function getAverageScore(scores: number[]): number {
  if (!scores || scores.length === 0) {
    return 0;
  }
  const coursework = scores[0] ?? 0;
  const lab = scores[1] ?? 0;
  const midterm = scores[2] ?? 0;
  const finalExam = scores[3] ?? 0;

  // Calculate weighted sum based on available scores
  let weightedSum = 0;
  let totalWeight = 0;

  if (scores.length > 0 && coursework >= 0) {
    weightedSum += coursework * 0.1;
    totalWeight += 0.1;
  }
  if (scores.length > 1 && lab >= 0) {
    weightedSum += lab * 0.2;
    totalWeight += 0.2;
  }
  if (scores.length > 2 && midterm >= 0) {
    weightedSum += midterm * 0.3;
    totalWeight += 0.3;
  }
  if (scores.length > 3 && finalExam >= 0) {
    weightedSum += finalExam * 0.4;
    totalWeight += 0.4;
  }

  if (totalWeight === 0) {
    return 0;
  }
  const weightedAverage = weightedSum / totalWeight;
  return Math.round(weightedAverage * 100) / 100;
}

export function buildRegistrationSemesters(enrollments: any[]): any[] {
  // Group enrollments by semester
  const semesterMap = new Map<string, typeof enrollments>();

  enrollments.forEach((enrollment) => {
    const semester = enrollment.class.semester;
    if (!semesterMap.has(semester)) {
      semesterMap.set(semester, []);
    }
    semesterMap.get(semester)!.push(enrollment);
  });

  // Convert to DTO format
  const semesters = Array.from(semesterMap.entries()).map(
    ([semesterName, semesterEnrollments]) => {
      const classes = semesterEnrollments.map((enrollment) => {
        return {
          class_code: enrollment.class.class_code,
          class_name: enrollment.class.subject.subject_name,
          department: enrollment.class.subject.department,
          teacher_name: enrollment.class.teacher.full_name,
          credits: enrollment.class.subject.credits,
          registration_status: enrollment.status,
        };
      });

      // Calculate total credits for the semester
      const semesterCredits = classes.reduce((sum, classItem) => {
        // Only count credits for enrolled or completed classes
        if (
          classItem.registration_status === 'enrolled' ||
          classItem.registration_status === 'completed'
        ) {
          return sum + classItem.credits;
        }
        return sum;
      }, 0);

      return {
        semester: semesterName,
        total_credits: semesterCredits,
        classes,
      };
    },
  );

  return semesters;
}
