'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { mockCourses } from '../data/mockCourses';
import { Play, Square, LogOut, CheckCircle2, Clock, Activity, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function Dashboard() {
  const { 
    logout, 
    botActive, 
    toggleBot, 
    targetCourse, 
    setTargetCourse, 
    logs, 
    addLog 
  } = useStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (botActive && targetCourse) {
      addLog(`[System] Initializing bot for course: ${targetCourse.KyHieu} - ${targetCourse.TenMH}...`);
      interval = setInterval(() => {
        const statuses = [
          `Pinging portal API... [Latency: ${Math.floor(Math.random() * 50 + 20)}ms]`,
          `Checking availability for ${targetCourse.KyHieu}...`,
          `Course ${targetCourse.KyHieu} is currently full (0 slots). Retrying...`,
          `Bypassing portal rate limits...`,
          `Received 403 Forbidden, waiting 1s before retry...`,
          `Session refreshed successfully. Resuming polling.`
        ];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        addLog(randomStatus);
      }, 2500);
    } else if (!botActive && targetCourse) {
       addLog(`[System] Bot halted.`);
    }

    return () => clearInterval(interval);
  }, [botActive, targetCourse, addLog]);

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
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
              Available Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCourses.map((course) => (
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  key={course.Id}
                  onClick={() => !botActive && setTargetCourse(course)}
                  className={clsx(
                    "p-5 rounded-xl border cursor-pointer transition-all duration-200",
                    targetCourse?.Id === course.Id
                      ? "bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                      : "bg-gray-900 border-gray-800 hover:border-gray-700",
                    botActive && targetCourse?.Id !== course.Id && "opacity-50 pointer-events-none"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-gray-800 text-gray-300 rounded-md">
                      {course.KyHieu}
                    </span>
                    <span className="text-xs font-medium text-gray-400">
                      Settings: {course.SoSVTT} 
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
              ))}
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
                <div className="mt-2 p-3 bg-gray-950 rounded-lg border border-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
                  {targetCourse ? (
                    <span className="text-blue-400 font-medium">{targetCourse.KyHieu} - {targetCourse.TenMH}</span>
                  ) : (
                    <span className="text-gray-500">None Selected</span>
                  )}
                </div>
              </div>

              <button
                disabled={!targetCourse}
                onClick={toggleBot}
                className={clsx(
                  "relative w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3",
                  !targetCourse ? "bg-gray-800 text-gray-600 cursor-not-allowed" :
                  botActive 
                    ? "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20" 
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500 shadow-blue-500/25"
                )}
              >
                {botActive ? (
                  <>
                    <span className="absolute inset-0 rounded-xl bg-red-500/20 animate-ping opacity-75"></span>
                    <Square className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">Stop Bot</span>
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
                   Polling portal every 2.5s...
                </div>
              )}
            </div>

            {/* Logs Window */}
            <div className="bg-[#0c0f17] border border-gray-800 flex flex-col rounded-xl overflow-hidden h-[300px]">
              <div className="bg-gray-900 p-3 border-b border-gray-800 text-xs font-mono text-gray-400 flex justify-between items-center">
                <span>Terminal Output</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
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
                        log.message.includes("403") && "text-red-400",
                        log.message.includes("API") && "text-blue-400 text-purple-400",
                        log.message.includes("System") && "text-emerald-400"
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