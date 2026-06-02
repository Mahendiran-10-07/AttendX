/**
 * Attendance calculation utilities for AtteTrack
 */

/**
 * Calculate attendance stats for a single subject
 * @param {string} subjectId
 * @param {object} allAttendance - { dateStr: { subjectId_h1: 'present'|'absent'|'holiday' } }
 * @param {number} targetPercent
 * @returns {{ attended, total, percentage, canSkip, mustAttend }}
 */
export const calcSubjectStats = (subjectId, allAttendance, targetPercent = 75) => {
  let attended = 0;
  let total = 0;

  Object.values(allAttendance).forEach(dayRecord => {
    Object.entries(dayRecord).forEach(([key, status]) => {
      if (key.startsWith(subjectId + '_h')) {
        if (status === 'holiday') return; // Don't count holidays
        total++;
        if (status === 'present') attended++;
      }
    });
  });

  const percentage = total === 0 ? 0 : Math.round((attended / total) * 100);
  const target = targetPercent / 100;

  // Classes I can skip and still stay at/above target
  // attended / (total + x) >= target → x <= attended/target - total
  const canSkipFloat = total === 0 ? 0 : Math.floor(attended / target - total);
  const canSkip = Math.max(0, canSkipFloat);

  // Classes I must attend to reach target
  // (attended + y) / (total + y) >= target → y >= (target*total - attended) / (1 - target)
  let mustAttend = 0;
  if (percentage < targetPercent && target < 1) {
    mustAttend = Math.ceil((target * total - attended) / (1 - target));
    mustAttend = Math.max(0, mustAttend);
  }

  return { attended, total, percentage, canSkip, mustAttend };
};

/**
 * Calculate overall attendance across all subjects
 */
export const calcOverallStats = (subjects, allAttendance, globalTarget = 75) => {
  if (!subjects.length) return { percentage: 0, attended: 0, total: 0 };

  let totalAttended = 0;
  let totalClasses = 0;

  subjects.forEach(sub => {
    const target = sub.targetPercent ?? globalTarget;
    const stats = calcSubjectStats(sub.id, allAttendance, target);
    totalAttended += stats.attended;
    totalClasses += stats.total;
  });

  const percentage = totalClasses === 0 ? 0 : Math.round((totalAttended / totalClasses) * 100);
  return { percentage, attended: totalAttended, total: totalClasses };
};

/**
 * Get attendance status color category
 */
export const getStatusCategory = (percentage, target = 75) => {
  if (percentage >= target) return 'safe';
  if (percentage >= target - 10) return 'warning';
  return 'danger';
};

/**
 * Format a Date object as YYYY-MM-DD string (local time)
 */
export const toDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Get the day name (Mon, Tue...) from a Date
 */
export const getDayName = (date) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

/**
 * Get human-readable date label
 */
export const formatDateLabel = (date) => {
  const today = toDateString(new Date());
  const ds = toDateString(date);
  if (ds === today) return 'Today';
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  if (ds === toDateString(yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
