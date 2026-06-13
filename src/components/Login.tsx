'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, User, KeyRound, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AUTH_ERROR_MESSAGES, type AuthErrorCode } from '../types/auth';

export default function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await login(studentId, password);
      if (!result.ok) {
        const code: AuthErrorCode = result.errorCode ?? "UNKNOWN";
        setErrorMessage(AUTH_ERROR_MESSAGES[code]);
        // Auto-dismiss after 5 s
        setTimeout(() => setErrorMessage(null), 5000);
      }
      // On success the store sets isLoggedIn → Dashboard renders
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4 font-sans text-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
            <LogIn className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Portal Gateway</h2>
          <p className="text-gray-400 text-sm mt-2">Login with your hcmus.online account</p>
        </div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3 bg-red-900/40 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-200 text-sm"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Student ID</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ex: 23127676"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Authenticate"
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
