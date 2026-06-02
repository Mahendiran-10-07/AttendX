import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getSettings, saveSettings, getSubjects, saveSubjects,
  getTimetable, saveTimetable, getAllAttendance, saveAllAttendance,
  getSemesters, archiveCurrentSemester, getArchivedSemesterData, deleteArchivedSemester,
} from '../utils/storage';
import { generateId } from '../utils/uuid';

// ─── Two separate contexts ────────────────────────────────────────────────────
// SubjectsCtx  → subjects, timetable, settings, semesters (rarely changes)
// AttendanceCtx → attendance only (changes on every mark tap)
// This prevents Timetable/Subjects/Settings screens from re-rendering
// when you mark attendance.
const SubjectsCtx   = createContext(null);
const AttendanceCtx = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const [settings,   setSettings]   = useState({ targetPercent: 75, currentSemesterId: 'sem_1' });
  const [subjects,   setSubjects]   = useState([]);
  const [timetable,  setTimetable]  = useState({});
  const [attendance, setAttendance] = useState({});
  const [semesters,  setSemesters]  = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [s, sub, tt, att, sem] = await Promise.all([
      getSettings(), getSubjects(), getTimetable(), getAllAttendance(), getSemesters(),
    ]);
    setSettings(s); setSubjects(sub); setTimetable(tt);
    setAttendance(att); setSemesters(sem); setLoading(false);
  };

  // ── Settings (fire-and-forget writes) ──────────────────────────
  const updateSettings = useCallback((updates) => {
    setSettings(prev => { const n = { ...prev, ...updates }; saveSettings(n); return n; });
  }, []);

  // ── Subjects ───────────────────────────────────────────────────
  const addSubject = useCallback(({ name, code, targetPercent, id }) => {
    const s = { id: id ?? generateId(), name, code, targetPercent: targetPercent ?? null };
    setSubjects(prev => { const n = [...prev, s]; saveSubjects(n); return n; });
    return s;
  }, []);

  const editSubject = useCallback((id, updates) => {
    setSubjects(prev => { const n = prev.map(s => s.id === id ? { ...s, ...updates } : s); saveSubjects(n); return n; });
  }, []);

  const deleteSubject = useCallback((id) => {
    setSubjects(prev => { const n = prev.filter(s => s.id !== id); saveSubjects(n); return n; });
    setTimetable(prev => {
      const n = {};
      Object.entries(prev).forEach(([day, hrs]) => {
        n[day] = {};
        Object.entries(hrs).forEach(([hr, sid]) => { if (sid !== id) n[day][hr] = sid; });
      });
      saveTimetable(n); return n;
    });
  }, []);

  const reorderSubjects = useCallback((order) => { setSubjects(order); saveSubjects(order); }, []);

  const bulkImport = useCallback(async (importedSubs, importedTT, mode = 'replace') => {
    setSubjects(prev => {
      let next;
      if (mode === 'replace') {
        next = importedSubs.map(s => ({ id: s.id ?? generateId(), name: s.name, code: s.code, targetPercent: s.targetPercent ?? null }));
      } else {
        const codes = new Set(prev.map(s => s.code?.toUpperCase()));
        next = [...prev, ...importedSubs.filter(s => !codes.has(s.code?.toUpperCase()))
          .map(s => ({ id: s.id ?? generateId(), name: s.name, code: s.code, targetPercent: s.targetPercent ?? null }))];
      }
      saveSubjects(next); return next;
    });
    setTimetable(prev => {
      const next = mode === 'replace' ? (importedTT ?? {}) : (() => {
        const m = { ...prev };
        Object.entries(importedTT ?? {}).forEach(([d, h]) => { m[d] = { ...(m[d] || {}), ...h }; });
        return m;
      })();
      saveTimetable(next); return next;
    });
  }, []);

  // ── Timetable ──────────────────────────────────────────────────
  const setSlot = useCallback((day, hour, subjectId) => {
    setTimetable(prev => {
      const n = { ...prev, [day]: { ...(prev[day] || {}), [hour]: subjectId } };
      if (!subjectId) delete n[day][hour];
      saveTimetable(n); return n;
    });
  }, []);

  const saveTimetableDirectly = useCallback((tt) => { setTimetable(tt); saveTimetable(tt); }, []);

  const getSubjectsForDay = useCallback((day) => {
    if (!timetable[day]) return [];
    return Object.entries(timetable[day])
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([hr, sid]) => ({ hour: Number(hr), subject: subjects.find(s => s.id === sid) }))
      .filter(i => i.subject);
  }, [timetable, subjects]);

  // ── Attendance ─────────────────────────────────────────────────
  const markDay = useCallback((dateStr, records) => {
    setAttendance(prev => { const n = { ...prev, [dateStr]: records }; saveAllAttendance(n); return n; });
  }, []);

  const markSingle = useCallback((dateStr, subjectId, hour, status) => {
    setAttendance(prev => {
      const n = { ...prev, [dateStr]: { ...(prev[dateStr] || {}), [`${subjectId}_h${hour}`]: status } };
      saveAllAttendance(n); return n;
    });
  }, []);

  const getDateRecords = useCallback((dateStr) => attendance[dateStr] || {}, [attendance]);

  const deleteAttendanceEntry = useCallback((dateStr, subjectId, hour) => {
    setAttendance(prev => {
      const n = { ...prev };
      if (n[dateStr]) {
        n[dateStr] = { ...n[dateStr] };
        delete n[dateStr][`${subjectId}_h${hour}`];
        if (!Object.keys(n[dateStr]).length) delete n[dateStr];
      }
      saveAllAttendance(n); return n;
    });
  }, []);

  // ── Semesters ──────────────────────────────────────────────────
  const startNewSemester = useCallback(async (newLabel) => {
    const newId = await archiveCurrentSemester(settings.currentSemesterId, newLabel);
    if (newId) {
      const next = { ...settings, currentSemesterId: newId };
      setSettings(next); saveSettings(next);
      await loadAll();
    }
    return newId;
  }, [settings]);

  const removeArchivedSemester = useCallback(async (id) => {
    const updated = await deleteArchivedSemester(id);
    if (updated) setSemesters(updated);
  }, []);

  const getArchivedData = useCallback((id) => getArchivedSemesterData(id), []);

  // ── Memoized context values ────────────────────────────────────
  // SubjectsCtx only updates when subjects/timetable/settings/semesters change.
  // AttendanceCtx only updates when attendance changes.
  const subjectsValue = useMemo(() => ({
    settings, updateSettings,
    subjects, addSubject, editSubject, deleteSubject, reorderSubjects, bulkImport,
    timetable, setSlot, getSubjectsForDay, saveTimetableDirectly,
    semesters, startNewSemester, getArchivedData, removeArchivedSemester,
    loading, reload: loadAll,
  }), [
    settings, subjects, timetable, semesters, loading,
    updateSettings, addSubject, editSubject, deleteSubject, reorderSubjects, bulkImport,
    setSlot, getSubjectsForDay, saveTimetableDirectly,
    startNewSemester, getArchivedData, removeArchivedSemester,
  ]);

  const attendanceValue = useMemo(() => ({
    attendance, markDay, markSingle, getDateRecords, deleteAttendanceEntry,
  }), [attendance, markDay, markSingle, getDateRecords, deleteAttendanceEntry]);

  return (
    <SubjectsCtx.Provider value={subjectsValue}>
      <AttendanceCtx.Provider value={attendanceValue}>
        {children}
      </AttendanceCtx.Provider>
    </SubjectsCtx.Provider>
  );
};

// ── Hooks ───────────────────────────────────────────────────────
export const useSubjectsData = () => useContext(SubjectsCtx);
export const useAttendance   = () => useContext(AttendanceCtx);
