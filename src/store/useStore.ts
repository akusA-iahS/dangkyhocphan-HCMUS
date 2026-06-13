import { create } from 'zustand';
import type { AuthErrorCode, LoginSuccess } from '../types/auth';

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
  /** Student display name returned by the auth server on success */
  studentName: string;
  /** Student ID returned by the auth server on success */
  studentId: string;
  login: (id: string, pass: string) => Promise<{ ok: boolean; errorCode?: AuthErrorCode; errorMessage?: string }>;
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

const AUTH_URL = "https://hcmus.online/api/auth/login";

export const useStore = create<StoreState>((set) => ({
  isLoggedIn: false,
  studentName: "",
  studentId: "",

  login: async (id, pass) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000); // 15 s timeout

      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: id, password: pass }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        // Map HTTP status codes to error codes
        let code: AuthErrorCode = "UNKNOWN";
        if (res.status === 401) code = "INVALID_CREDENTIALS";
        else if (res.status === 423) code = "ACCOUNT_LOCKED";
        else if (res.status === 429) code = "RATE_LIMITED";
        else if (res.status === 409) code = "SESSION_EXISTS";
        else if (res.status >= 500) code = "SERVER_ERROR";

        // Try to parse a JSON error body
        let bodyCode: AuthErrorCode | undefined;
        try {
          const body = await res.json() as { error?: { code?: string } };
          const codes: AuthErrorCode[] = [
            "INVALID_CREDENTIALS", "ACCOUNT_LOCKED", "ACCOUNT_EXPIRED",
            "RATE_LIMITED", "SESSION_EXISTS", "SERVER_ERROR",
            "NETWORK_ERROR", "TIMEOUT", "UNKNOWN",
          ];
          if (body?.error?.code && codes.includes(body.error.code as AuthErrorCode)) {
            bodyCode = body.error.code as AuthErrorCode;
          }
        } catch {
          // no JSON body — keep the HTTP-derived code
        }

        return { ok: false, errorCode: bodyCode ?? code };
      }

      // Success — parse response
      const data: LoginSuccess = await res.json() as LoginSuccess;
      set({
        isLoggedIn: true,
        studentId: data.user.studentId,
        studentName: data.user.name,
      });
      return { ok: true };
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return { ok: false, errorCode: "TIMEOUT" as AuthErrorCode };
      }
      if (err instanceof TypeError) {
        // fetch() throws TypeError on network failures
        return { ok: false, errorCode: "NETWORK_ERROR" as AuthErrorCode };
      }
      return { ok: false, errorCode: "NETWORK_ERROR" as AuthErrorCode };
    }
  },

  logout: () => set({
    isLoggedIn: false,
    studentName: "",
    studentId: "",
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
