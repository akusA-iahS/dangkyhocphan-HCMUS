import { create } from 'zustand';

interface Course {
  Id: string;
  MaDKHP: number;
  MaMG: number;
  MaMH: number;
  KyHieu: string;
  TenMH: string;
  TenTA: string;
  SoTinChi: number;
  MaLopSH: string;
  SoSVDK: number;
  SoSVTT: string;
  LichHocLT: string;
}

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error";
}

interface StoreState {
  isLoggedIn: boolean;
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  botActive: boolean;
  toggleBot: () => void;
  targetCourse: Course | null;
  setTargetCourse: (course: Course) => void;
  logs: LogEntry[];
  addLog: (message: string, type?: "info" | "success" | "error") => void;
  clearLogs: () => void;
  pollSpeed: number;
  setPollSpeed: (speed: number) => void;
  attemptCount: number;
  resetAttempts: () => void;
  registeredCourses: string[];
  markRegistered: (courseId: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  isLoggedIn: false,
  login: (id, pass) => {
    if (id === "23127676" && pass === "sixseven67") {
      set({ isLoggedIn: true });
      return true;
    }
    return false;
  },
  logout: () => set({
    isLoggedIn: false,
    botActive: false,
    targetCourse: null,
    logs: [],
    attemptCount: 0,
    registeredCourses: [],
  }),
  botActive: false,
  toggleBot: () => set((state) => {
    const newState = !state.botActive;
    if (newState && state.targetCourse) {
      // Bot starting — reset attempts for fresh session
      return { botActive: newState, attemptCount: 0 };
    }
    return { botActive: newState };
  }),
  targetCourse: null,
  setTargetCourse: (course) => set({
    targetCourse: course,
    botActive: false,
    attemptCount: 0,
  }),
  logs: [],
  addLog: (message, type = "info") => set((state) => ({
    logs: [{ time: new Date().toLocaleTimeString(), message, type }, ...state.logs].slice(0, 50),
    attemptCount: state.botActive ? state.attemptCount + 1 : state.attemptCount,
  })),
  clearLogs: () => set({ logs: [] }),
  pollSpeed: 2500,
  setPollSpeed: (speed) => set({ pollSpeed: speed }),
  attemptCount: 0,
  resetAttempts: () => set({ attemptCount: 0 }),
  registeredCourses: [],
  markRegistered: (courseId) => set((state) => ({
    registeredCourses: state.registeredCourses.includes(courseId)
      ? state.registeredCourses
      : [...state.registeredCourses, courseId],
    botActive: false,
  })),
}));
