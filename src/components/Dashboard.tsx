"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "../store/useStore";
import { mockCourses } from "../data/mockCourses";
import {
  Play, Square, LogOut, CheckCircle2, Clock, Activity,
  Loader2, Search, AlertTriangle, Trash2,
} from "lucide-react";
import clsx from "clsx";

/** Parse "T2 07:30-11:10" → { day: 2, start: 450, end: 670 } (minutes since midnight) */
function parseSchedule(lich: string): { day: number; start: number; end: number } | null {
  if (!lich || !lich.trim()) return null;
  const match = lich.trim().match(/^T(\d+)\s+(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return null;
  const day = parseInt(match[1]!, 10);
  const start = parseInt(match[2]!, 10) * 60 + parseInt(match[3]!, 10);
  const end = parseInt(match[4]!, 10) * 60 + parseInt(match[5]!, 10);
  return { day, start, end };
}

/** Two schedules conflict if same day and time ranges overlap */
function schedulesConflict(a: string, b: string): boolean {
  const pa = parseSchedule(a);
  const pb = parseSchedule(b);
  if (!pa || !pb) return false;
  if (pa.day !== pb.day) return false;
  return pa.start < pb.end && pb.start < pa.end;
}

export default function Dashboard() {
  const {
    logout,
    botActive,
    toggleBot,
    targetCourse,
    setTargetCourse,
    logs,
    addLog,
    clearLogs,
    pollSpeed,
    setPollSpeed,
    attemptCount,
    registeredCourses,
    markRegistered,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");

  // --- Conflicts between selected course and others ---
  const conflicts = useMemo(() => {
    if (!targetCourse || !targetCourse.LichHocLT) return new Set<string>();
    return new Set(
      mockCourses
        .filter((c) => c.Id !== targetCourse.Id)
        .filter((c) => schedulesConflict(targetCourse.LichHocLT!, c.LichHocLT))
        .map((c) => c.Id),
    );
  }, [targetCourse]);

  // --- Filtered courses ---
  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return mockCourses;
    return mockCourses.filter(
      (c) =>
        c.KyHieu.toLowerCase().includes(q) ||
        c.TenMH.toLowerCase().includes(q) ||
        c.TenTA.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // --- Success simulation ---
  const successThresholdRef = useRef<number>(0);
  const hasSucceededRef = useRef(false);

  // Reset threshold when bot starts with new target
  useEffect(() => {
    if (botActive && targetCourse) {
      successThresholdRef.current = Math.floor(Math.random() * 7) + 5; // 5–11
      hasSucceededRef.current = false;
    }
  }, [botActive, targetCourse]);

  // Main bot polling loop
  useEffect(() => {
    if (!botActive || !targetCourse) return;

    const statusMessages = [
      `Pinging portal API... [Latency: ${Math.floor(Math.random() * 50 + 20)}ms]`,
      `Checking availability for ${targetCourse.KyHieu}...`,
      `Course ${targetCourse.KyHieu} is currently full (0 slots). Retrying...`,
      `Bypassing portal rate limits...`,
      `Received 403 Forbidden, waiting 1s before retry...`,
      `Session refreshed successfully. Resuming polling.`,
      `Parsing registration form for ${targetCourse.KyHieu}...`,
      `Submitting registration payload...`,
      `Server returned 503 — retrying with exponential backoff.`,
    ];

    addLog(`[System] Initializing bot for course: ${targetCourse.KyHieu} - ${targetCourse.TenMH}...`);

    const interval = setInterval(() => {
      // Stop if already registered
      if (hasSucceededRef.current) {
        clearInterval(interval);
        return;
      }

      const randomStatus = statusMessages[Math.floor(Math.random() * statusMessages.length)];
      addLog(randomStatus);

      // After reaching threshold, simulate success
      const currentCount = useStore.getState().attemptCount;
      if (currentCount >= successThresholdRef.current && !hasSucceededRef.current) {
        hasSucceededRef.current = true;
        clearInterval(interval);
        addLog(`[SUCCESS] Registered for ${targetCourse.KyHieu} - ${targetCourse.TenMH}!`, "success");
        markRegistered(targetCourse.Id);
      }
    }, pollSpeed);

    return () => clearInterval(interval);
  }, [botActive, targetCourse, pollSpeed, addLog, markRegistered]);

  // When bot stops via toggle, log it (unless success already handled)
  useEffect(() => {
    if (!botActive && targetCourse && !hasSucceededRef.current && logs.length > 0) {
      const lastLog = logs[0];
      if (lastLog && !lastLog.message.includes("Bot halted") && !lastLog.message.includes("SUCCESS")) {
        addLog(`[System] Bot halted.`);
      }
    }
  }, [botActive, targetCourse, logs, addLog]);

  const isCourseRegistered = targetCourse ? registeredCourses.includes(targetCourse.Id) : false;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Registration Bot Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Logged in as: 23127676 (AkusA)</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-900/30 hover:text-red-400 text-gray-300 border border-gray-700 hover:border-red-900/50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                Available Courses
              </h2>
              <span className="text-xs text-gray-500">
                {filteredCourses.length}{searchQuery ? ` / ${mockCourses.length}` : ""} courses
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by code, name, or English name..."
                className="w-full bg-gray-900 border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No courses match &quot;{searchQuery}&quot;</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredCourses.map((course) => {
                  const isTarget = targetCourse?.Id === course.Id;
                  const hasConflict = targetCourse && conflicts.has(course.Id);
                  const isRegistered = registeredCourses.includes(course.Id);

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={!botActive && !isRegistered ? { scale: 1.01 } : undefined}
                      key={course.Id}
                      onClick={() => !botActive && !isRegistered && setTargetCourse(course)}
                      className={clsx(
                        "p-5 rounded-xl border transition-all duration-200 relative",
                        isTarget
                          ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                          : hasConflict && !isTarget
                            ? "bg-red-900/10 border-red-500/40 cursor-pointer"
                            : "bg-gray-900 border-gray-800",
                        !isTarget && !isRegistered && !botActive && "hover:border-gray-700 cursor-pointer",
                        isRegistered && "bg-emerald-900/10 border-emerald-500/30",
                        botActive && !isTarget && "opacity-50 pointer-events-none",
                        isRegistered && "cursor-default",
                      )}
                    >
                      {/* Registered badge */}
                      {isRegistered && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Registered
                          </span>
                        </div>
                      )}

                      {/* Conflict badge */}
                      {hasConflict && !isTarget && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded-full border border-red-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Conflict
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-gray-800 text-gray-300 rounded-md">
                          {course.KyHieu}
                        </span>
                        <span className="text-xs font-medium text-gray-400">
                          {course.SoSVTT}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-100 line-clamp-1">{course.TenMH}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-1">{course.TenTA}</p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Clock className="w-4 h-4" />
                          {course.LichHocLT || "N/A"}
                        </div>
                        <span className="bg-gray-800 text-gray-300 font-medium px-2 py-0.5 rounded-full text-xs border border-gray-700">
                          {course.SoTinChi} TC
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Bot Control Panel */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Bot Control
            </h2>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center">
              <div className="text-center mb-6 w-full">
                <span className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Target</span>
                <div className="mt-2 p-3 bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
                  {targetCourse ? (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-medium truncate">
                        {targetCourse.KyHieu} - {targetCourse.TenMH}
                      </span>
                      {conflicts.size > 0 && (
                        <AlertTriangle
                          className="w-4 h-4 text-red-400 flex-shrink-0"
                          aria-label="Schedule conflict detected"
                        />
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">None Selected</span>
                  )}
                </div>

                {/* Conflict warning */}
                {targetCourse && conflicts.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg text-xs text-red-300 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      Schedule conflict with {conflicts.size} course{conflicts.size > 1 ? "s" : ""}
                    </span>
                  </motion.div>
                )}

                {/* Already registered notice */}
                {isCourseRegistered && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-2 bg-emerald-900/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Successfully registered!</span>
                  </motion.div>
                )}
              </div>

              {/* Poll Speed Control */}
              <div className="mb-6 w-full">
                <label className="block text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">
                  Poll Speed
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 flex-shrink-0">Slow</span>
                  <input
                    type="range"
                    min="1000"
                    max="5000"
                    step="1500"
                    value={pollSpeed}
                    onChange={(e) => setPollSpeed(parseInt(e.target.value, 10))}
                    disabled={botActive}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-xs text-gray-500 flex-shrink-0">Fast</span>
                </div>
                <div className="flex justify-between mt-1">
                  {[1000, 2500, 5000].map((speed) => (
                    <button
                      key={speed}
                      disabled={botActive}
                      onClick={() => setPollSpeed(speed)}
                      className={clsx(
                        "text-xs px-2 py-0.5 rounded transition-colors",
                        pollSpeed === speed
                          ? "bg-blue-900/40 text-blue-400"
                          : "text-gray-600 hover:text-gray-400",
                        botActive && "cursor-not-allowed",
                      )}
                    >
                      {speed / 1000}s
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!targetCourse || isCourseRegistered}
                onClick={toggleBot}
                className={clsx(
                  "relative w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3",
                  !targetCourse || isCourseRegistered
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                    : botActive
                      ? "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25",
                )}
              >
                {botActive ? (
                  <>
                    <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping opacity-75"></span>
                    <Square className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">Stop Bot</span>
                  </>
                ) : isCourseRegistered ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Registered
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    Commence Attack
                  </>
                )}
              </button>

              {botActive && (
                <div className="mt-6 w-full flex items-center gap-3 text-sm text-blue-400 bg-blue-900/10 p-3 rounded-lg border border-blue-900/30">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    Polling every {pollSpeed / 1000}s{attemptCount > 0 ? ` (attempt #${attemptCount})` : ""}...
                  </span>
                </div>
              )}
            </div>

            {/* Logs Window */}
            <div className="bg-[#0c0f17] border border-gray-800 flex flex-col rounded-xl overflow-hidden h-[300px]">
              <div className="bg-gray-900 p-3 border-b border-gray-800 text-xs font-mono text-gray-400 flex justify-between items-center">
                <span>Terminal Output{logs.length > 0 ? ` (${logs.length})` : ""}</span>
                <div className="flex items-center gap-2">
                  {logs.length > 0 && (
                    <button
                      onClick={clearLogs}
                      className="flex items-center gap-1 text-gray-600 hover:text-red-400 transition-colors"
                      title="Clear logs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                  </div>
                </div>
              </div>
              <div className="p-4 font-mono text-xs overflow-y-auto flex flex-col-reverse h-full">
                <AnimatePresence>
                  {logs.map((log, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="mb-2 break-all"
                    >
                      <span className="text-gray-500 mr-2">[{log.time}]</span>
                      <span className={clsx(
                        "text-gray-300",
                        log.type === "success" && "text-emerald-400 font-semibold",
                        log.message.includes("403") && "text-red-400",
                        (log.message.includes("API") || log.message.includes("Pinging")) && "text-blue-400",
                        log.message.includes("System") && "text-purple-400",
                        log.message.includes("SUCCESS") && "text-emerald-400 font-semibold",
                      )}>
                        {log.message}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {logs.length === 0 && (
                  <div className="text-gray-600 italic">Waiting for bot initialization...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}