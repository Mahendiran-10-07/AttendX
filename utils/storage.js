import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SETTINGS: '@attetrack_settings',
  SUBJECTS: '@attetrack_subjects',
  TIMETABLE: '@attetrack_timetable',
  ATTENDANCE: '@attetrack_attendance',
  SEMESTERS: '@attetrack_semesters',
  ARCHIVED: '@attetrack_archived_',
};

// ─── Settings ───────────────────────────────────────────────
export const getSettings = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { theme: 'light', targetPercent: 75, currentSemesterId: 'sem_1' };
  } catch { return { theme: 'light', targetPercent: 75, currentSemesterId: 'sem_1' }; }
};

export const saveSettings = async (settings) => {
  try { await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)); }
  catch (e) { console.error('saveSettings', e); }
};

// ─── Subjects ────────────────────────────────────────────────
export const getSubjects = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SUBJECTS);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

export const saveSubjects = async (subjects) => {
  try { await AsyncStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects)); }
  catch (e) { console.error('saveSubjects', e); }
};

// ─── Timetable ───────────────────────────────────────────────
export const getTimetable = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.TIMETABLE);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

export const saveTimetable = async (timetable) => {
  try { await AsyncStorage.setItem(KEYS.TIMETABLE, JSON.stringify(timetable)); }
  catch (e) { console.error('saveTimetable', e); }
};

// ─── Attendance ──────────────────────────────────────────────
export const getAllAttendance = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
};

export const saveAllAttendance = async (attendance) => {
  try { await AsyncStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(attendance)); }
  catch (e) { console.error('saveAllAttendance', e); }
};

export const getAttendanceForDate = async (dateStr) => {
  const all = await getAllAttendance();
  return all[dateStr] || {};
};

export const markAttendance = async (dateStr, subjectId, hour, status) => {
  const all = await getAllAttendance();
  if (!all[dateStr]) all[dateStr] = {};
  const key = `${subjectId}_h${hour}`;
  all[dateStr][key] = status;
  await saveAllAttendance(all);
  return all;
};

export const markDayAttendance = async (dateStr, records) => {
  // records: { subjectId_h1: 'present', ... }
  const all = await getAllAttendance();
  all[dateStr] = records;
  await saveAllAttendance(all);
  return all;
};

// ─── Semesters ───────────────────────────────────────────────
export const getSemesters = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.SEMESTERS);
    if (data) return JSON.parse(data);
    // Default first semester
    const defaultSems = [{ id: 'sem_1', label: 'Semester 1', startDate: new Date().toISOString(), archived: false }];
    await AsyncStorage.setItem(KEYS.SEMESTERS, JSON.stringify(defaultSems));
    return defaultSems;
  } catch { return []; }
};

export const saveSemesters = async (semesters) => {
  try { await AsyncStorage.setItem(KEYS.SEMESTERS, JSON.stringify(semesters)); }
  catch (e) { console.error('saveSemesters', e); }
};

export const archiveCurrentSemester = async (currentSemesterId, newSemesterLabel) => {
  try {
    // Snapshot everything
    const currentAttendance = await getAllAttendance();
    const currentSubjects = await getSubjects();
    const currentTimetable = await getTimetable();
    const archiveData = {
      attendance: currentAttendance,
      subjects: currentSubjects,
      timetable: currentTimetable,
      archivedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(KEYS.ARCHIVED + currentSemesterId, JSON.stringify(archiveData));

    // Mark old semester as archived
    const semesters = await getSemesters();
    const idx = semesters.findIndex(s => s.id === currentSemesterId);
    if (idx !== -1) {
      semesters[idx].archived = true;
      semesters[idx].endDate = new Date().toISOString();
    }

    // Create new semester
    const newId = 'sem_' + Date.now();
    semesters.push({ id: newId, label: newSemesterLabel, startDate: new Date().toISOString(), archived: false });
    await saveSemesters(semesters);

    // Fresh start — clear all live data
    await saveAllAttendance({});
    await saveSubjects([]);
    await saveTimetable({});

    return newId;
  } catch (e) { console.error('archiveCurrentSemester', e); return null; }
};

export const getArchivedSemesterData = async (semesterId) => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ARCHIVED + semesterId);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
};

export const deleteArchivedSemester = async (semesterId) => {
  try {
    await AsyncStorage.removeItem(KEYS.ARCHIVED + semesterId);
    const semesters = await getSemesters();
    const filtered = semesters.filter(s => s.id !== semesterId);
    await saveSemesters(filtered);
    return filtered;
  } catch (e) { console.error('deleteArchivedSemester', e); return null; }
};

// ─── Full Reset (dev utility) ────────────────────────────────
export const clearAll = async () => {
  try { await AsyncStorage.clear(); } catch (e) { console.error('clearAll', e); }
};
