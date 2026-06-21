import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScannerLoader({ 
  logs = [
    'Initializing Multi-Modal Deep Neural Networks...',
    'Extracting semantic features & token counts...',
    'Evaluating sentence perplexity & burstiness...',
    'Performing cross-dataset probability comparisons...',
    'Checking for adversarial perturbations...',
    'Generating final authenticity report...'
  ], 
  duration = 4000, 
  onComplete 
}) {
  const [progress, setProgress] = useState(0);
  const [currentLogIdx, setCurrentLogIdx] = useState(0);
  const [logHistory, setLogHistory] = useState([]);

  useEffect(() => {
    const totalSteps = 100;
    const intervalTime = duration / totalSteps;
    const logTriggerSteps = Math.floor(totalSteps / logs.length);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          if (onComplete) onComplete();
          return 100;
        }

        const nextProgress = prev + 1;

        // Check if we need to show the next log
        const nextLogIdx = Math.min(
          Math.floor(nextProgress / logTriggerSteps),
          logs.length - 1
        );

        if (nextLogIdx > currentLogIdx) {
          setCurrentLogIdx(nextLogIdx);
          setLogHistory((prevLogs) => [...prevLogs, logs[currentLogIdx]]);
        }

        return nextProgress;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, logs, currentLogIdx, onComplete]);

  // Initial log setup
  useEffect(() => {
    if (logHistory.length === 0 && logs.length > 0) {
      setLogHistory([logs[0]]);
    }
  }, [logs]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#121826]/40 backdrop-blur-xl border border-white/5 rounded-2xl max-w-lg w-full mx-auto relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
      {/* Laser Scanning Grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
      
      {/* Neon Cyber Scan Lines */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_10px_#3b82f6] animate-bounce pointer-events-none" style={{ animationDuration: '3s' }} />

      {/* Spinner Graphic */}
      <div className="relative mb-6 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="w-16 h-16 border-2 border-dashed border-blue-500/30 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="absolute w-12 h-12 border-2 border-dotted border-purple-500/50 rounded-full"
        />
        <div className="absolute p-2 bg-[#121826] border border-blue-500/30 rounded-xl shadow-lg">
          <Cpu className="w-6 h-6 text-blue-400 animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-white tracking-wide mb-1 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-blue-400" />
        Threat Matrix Scanning
      </h3>
      <p className="text-xs text-gray-400 font-medium mb-6">
        Analyzing file vectors. Please do not close this window.
      </p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-900 border border-white/5 rounded-full h-3 overflow-hidden p-0.5 mb-6">
        <motion.div 
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(139,92,246,0.6)]"
          style={{ width: `${progress}%` }}
          layout
        />
      </div>
      
      <div className="w-full flex items-center justify-between text-xs text-gray-400 font-semibold mb-4 px-1">
        <span>PROGRESS: {progress}%</span>
      </div>

      {/* Terminal logs */}
      <div className="w-full bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-emerald-400/90 h-32 overflow-y-auto text-left shadow-inner flex flex-col gap-1.5 scrollbar-thin">
        <div className="flex items-center gap-1.5 text-gray-500 border-b border-white/5 pb-1 mb-1 font-semibold">
          <Terminal className="w-3.5 h-3.5" />
          <span>CYBER_MATRIX_LOG.SYS</span>
        </div>
        {logHistory.map((log, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-1"
          >
            <span className="text-blue-500 select-none">&gt;</span>
            <span>{log}</span>
          </motion.div>
        ))}
        {progress < 100 && (
          <div className="flex items-center gap-1">
            <span className="text-blue-500 select-none animate-pulse">&gt;</span>
            <span className="text-gray-400 animate-pulse">Running analysis cycle...</span>
          </div>
        )}
      </div>
    </div>
  );
}
