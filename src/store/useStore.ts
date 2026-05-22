import { create } from 'zustand';

interface StoreState {
  isLoggedIn: boolean;
  login: (id: string, pass: string) => boolean;
  logout: () => void;
  botActive: boolean;
  toggleBot: () => void;
  targetCourse: any | null;
  setTargetCourse: (course: any) => void;
  logs: Array<{ time: string; message: string }>;
  addLog: (message: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  isLoggedIn: false,
  login: (id, pass) => {
    if (id === '23127676' && pass === 'sixseven67') {
      set({ isLoggedIn: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isLoggedIn: false, botActive: false, targetCourse: null, logs: [] }),
  botActive: false,
  toggleBot: () => set((state) => {
    const newState = !state.botActive;
    if (newState && state.targetCourse) {
       // logic could simulate starting 
    }
    return { botActive: newState };
  }),
  targetCourse: null,
  setTargetCourse: (course) => set({ targetCourse: course, botActive: false }),
  logs: [],
  addLog: (message) => set((state) => ({ 
    logs: [{ time: new Date().toLocaleTimeString(), message }, ...state.logs].slice(0, 50)
  }))
}));
