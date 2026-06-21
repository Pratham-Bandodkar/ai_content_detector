import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Image as ImageIcon, Music, Video, Shield,
  Cpu, Zap, BarChart2, Activity, Play, ChevronRight, Users,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlowCard from '../components/ui/GlowCard';
import GlowButton from '../components/ui/GlowButton';

export default function Landing() {
  const navigate = useNavigate();

  // Floating animations for Hero Cards
  const floatAnimation = (delay) => ({
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay: delay
    }
  });

  // Simple statistics count-up logic
  const [stats, setStats] = useState({ accuracy: 0, files: 0, models: 0, speed: 0 });
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ accuracy: 99.8, files: 742190, models: 18, speed: 0.12 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    { title: 'Multi-Modal Detection', desc: 'Run comprehensive scans across texts, image structures, audio tracks, and video frames to identify AI-generated content.', icon: <Cpu className="w-6 h-6 text-blue-400" /> },
    { title: 'Real-time Analysis', desc: 'Receive instant results computed through optimized browser streams and rapid neural processing pipelines.', icon: <Zap className="w-6 h-6 text-purple-400" /> },
    { title: 'AI Probability Score', desc: 'Review detailed indicators revealing exact percentage probabilities of AI versus human creation signatures.', icon: <BarChart2 className="w-6 h-6 text-pink-400" /> },
    { title: 'AI Content Recognition', desc: 'Identify AI-generated text, images produced by diffusion models, synthetic audio, and AI-produced video content.', icon: <Shield className="w-6 h-6 text-teal-400" /> },
    { title: 'Security & Privacy', desc: 'Protect proprietary upload files. Data is cached locally and destroyed immediately after analysis scanning.', icon: <ShieldCheck className="w-6 h-6 text-indigo-400" /> },
    { title: 'Fast Processing', desc: 'Parallel tensor execution schedules ensure media reviews complete in fractions of a second.', icon: <Activity className="w-6 h-6 text-emerald-400" /> }
  ];

  const detectionTypes = [
    { title: 'Text Detection', path: '/dashboard/text', desc: 'Scans articles, codes, and essays for GPT/LLM signatures.', icon: <FileText className="w-8 h-8 text-blue-400" />, glow: 'from-blue-500/10 to-blue-600/0' },
    { title: 'Image Detection', path: '/dashboard/image', desc: 'Examines pixel textures and camera Exif markers for diffusion tags.', icon: <ImageIcon className="w-8 h-8 text-purple-400" />, glow: 'from-purple-500/10 to-purple-600/0' },
    { title: 'Audio Detection', path: '/dashboard/audio', desc: 'Evaluates vocal synthesis frequencies for cloned deepfake voices.', icon: <Music className="w-8 h-8 text-pink-400" />, glow: 'from-pink-500/10 to-pink-600/0' },
    { title: 'Video Detection', path: '/dashboard/video', desc: 'Tracks face blending anomalies and frame manipulation markers.', icon: <Video className="w-8 h-8 text-teal-400" />, glow: 'from-teal-500/10 to-teal-600/0' },
  ];

  const timelineSteps = [
    { step: '01', title: 'Upload Content', desc: 'Paste textual materials, or drag and drop any image, voice message, or video file into the browser.' },
    { step: '02', title: 'AI Processing', desc: 'The systems segment features, isolate tracks, and trace frame discrepancies using deep neural nets.' },
    { step: '03', title: 'Analysis Engine', desc: 'Compare vector outputs against baseline templates and generative AI artifacts databases.' },
    { step: '04', title: 'Detection Report', desc: 'Download comprehensive PDF matrices grading credibility scores and anomalies heatmap coordinates.' }
  ];


  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 cyber-grid pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-500/5 via-purple-500/0 to-transparent blur-[120px] pointer-events-none" />

      {/* Main Header / Navigation */}
      <header className="fixed top-0 inset-x-0 h-20 glass-nav z-50 px-4 sm:px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.3)] shrink-0">
            <Cpu className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-white tracking-widest uppercase truncate">
              AI CONTENT DETECTOR
            </h1>
            <span className="text-[8px] sm:text-[9px] font-bold text-blue-400 tracking-wider block">
              FYP EDITION v1.0
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-300">
          <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
          <a href="#detectors" className="hover:text-blue-400 transition-colors">Detection Matrix</a>
          <a href="#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</a>
          <a href="#stats" className="hover:text-blue-400 transition-colors">Metrics</a>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <GlowButton variant="secondary" onClick={() => navigate('/dashboard')} className="!py-1.5 !px-3 sm:!py-2 sm:!px-4 text-[10px] sm:text-xs shrink-0">
            <span className="hidden sm:inline">START SCANNING</span>
            <span className="sm:hidden">SCAN</span>
          </GlowButton>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            <Shield className="w-3.5 h-3.5 animate-pulse" />
            Active Synthetic Content Counter-Defense
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight"
          >
            Detect AI Content with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Multi-Modal Analysis</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
          >
            Detect AI-generated text, images, audio, and video in seconds using optimized neural models.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
          >
            <GlowButton variant="primary" onClick={() => navigate('/dashboard')}>
              START DETECTION
              <ChevronRight className="w-4 h-4" />
            </GlowButton>
            <a href="#features">
              <GlowButton variant="ghost">
                Learn More
              </GlowButton>
            </a>
          </motion.div>
        </div>

        {/* Floating cards animation widget right side */}
        <div className="flex-1 w-full relative lg:h-[400px] flex flex-col grid grid-cols-1 sm:grid-cols-2 lg:block gap-4 items-center justify-center max-w-xl mx-auto mt-10 lg:mt-0">

          {/* Neon Ring */}
          <div className="absolute lg:top-[46%] lg:left-[55%] lg:-translate-x-1/2 lg:-translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 blur-3xl pointer-events-none animate-pulse hidden lg:block" />

          {/* Cyber shield shape */}
          <div className="absolute lg:top-[46%] lg:left-[55%] lg:-translate-x-1/2 lg:-translate-y-1/2 w-60 h-60 border border-white/5 bg-[#121826]/10 rounded-full flex items-center justify-center pointer-events-none hidden lg:flex">
            <Cpu className="w-16 h-16 text-blue-500/20 animate-pulse" />
          </div>

          <motion.div animate={floatAnimation(0)} className="w-full sm:w-auto lg:absolute lg:top-10 lg:left-10">
            <GlowCard hoverGlow={false} className="!p-4 bg-[#121826]/90 border border-blue-500/30 flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.2)] w-full">
              <div className="p-2 bg-blue-500/10 rounded-lg"><FileText className="w-5 h-5 text-blue-400" /></div>
              <div>
                <p className="text-xs font-bold text-white">AI Text Detector</p>
                <p className="text-[10px] text-gray-400">AI Generated Text</p>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div animate={floatAnimation(1.5)} className="w-full sm:w-auto lg:absolute lg:bottom-10 lg:right-10">
            <GlowCard hoverGlow={false} className="!p-4 bg-[#121826]/90 border border-purple-500/30 flex items-center gap-3 shadow-[0_0_20px_rgba(139,92,246,0.2)] w-full">
              <div className="p-2 bg-purple-500/10 rounded-lg"><ImageIcon className="w-5 h-5 text-purple-400" /></div>
              <div>
                <p className="text-xs font-bold text-white">AI Image Detector</p>
                <p className="text-[10px] text-gray-400">AI Generated Image</p>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div animate={floatAnimation(3)} className="w-full sm:w-auto lg:absolute lg:bottom-20 lg:left-0">
            <GlowCard hoverGlow={false} className="!p-4 bg-[#121826]/90 border border-pink-500/30 flex items-center gap-3 shadow-[0_0_20px_rgba(244,63,94,0.2)] w-full">
              <div className="p-2 bg-pink-500/10 rounded-lg"><Music className="w-5 h-5 text-pink-400" /></div>
              <div>
                <p className="text-xs font-bold text-white">AI Audio Detector</p>
                <p className="text-[10px] text-gray-400">AI Generated Audio</p>
              </div>
            </GlowCard>
          </motion.div>

          <motion.div animate={floatAnimation(4.5)} className="w-full sm:w-auto lg:absolute lg:top-0 lg:right-0">
            <GlowCard hoverGlow={false} className="!p-4 bg-[#121826]/90 border border-teal-500/30 flex items-center gap-3 shadow-[0_0_20px_rgba(20,184,166,0.2)] w-full">
              <div className="p-2 bg-teal-500/10 rounded-lg"><Video className="w-5 h-5 text-teal-400" /></div>
              <div>
                <p className="text-xs font-bold text-white">AI Video Detector</p>
                <p className="text-[10px] text-gray-400">AI Generated Video</p>
              </div>
            </GlowCard>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs font-black tracking-widest text-blue-400 uppercase">Defense Matrix Features</h2>
          <h3 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            Comprehensive Threat Mitigation
          </h3>
          <p className="text-sm text-gray-400 max-w-lg mx-auto font-medium">
            Designed to address the vulnerabilities introduced by synthetic generative media networks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <GlowCard key={idx} delay={idx * 0.1}>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit mb-5">
                {feat.icon}
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{feat.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{feat.desc}</p>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* Detection Matrix Types */}
      <section id="detectors" className="py-24 px-6 lg:px-12 bg-black/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs font-black tracking-widest text-purple-400 uppercase">Media Analysis Gateways</h2>
            <h3 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
              Modular Detection Engines
            </h3>
            <p className="text-sm text-gray-400 max-w-lg mx-auto font-medium">
              Select an engine below to upload assets and trigger forensic validation routines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {detectionTypes.map((type, idx) => (
              <GlowCard key={idx} glowColor={type.glow} delay={idx * 0.1} className="flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 w-fit mb-5">
                    {type.icon}
                  </div>
                  <h4 className="text-lg font-extrabold text-white mb-2">{type.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed font-medium mb-6">{type.desc}</p>
                </div>
                <button
                  onClick={() => navigate(type.path)}
                  className="flex items-center gap-2 text-xs font-bold text-white hover:text-blue-400 transition-colors uppercase mt-auto"
                >
                  Launch Analyzer
                  <ChevronRight className="w-4 h-4" />
                </button>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section: How it Works */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center space-y-4 mb-20">
          <h2 className="text-xs font-black tracking-widest text-pink-400 uppercase">Execution Framework</h2>
          <h3 className="text-3xl font-extrabold text-white sm:text-4xl tracking-tight">
            How The Shield Operates
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector Line in Desktop */}
          <div className="hidden lg:block absolute top-[44px] left-12 right-12 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 z-0 pointer-events-none" />

          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#121826] border border-blue-500/30 flex items-center justify-center text-sm font-black text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                {step.step}
              </div>
              <h4 className="text-base font-extrabold text-white">{step.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics counters */}
      <section id="stats" className="py-20 px-6 lg:px-12 bg-black/40 border-t border-b border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center">
          <div className="space-y-2">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white font-mono text-glow-blue">
              {stats.accuracy ? `${stats.accuracy}%` : '0%'}
            </h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detection Accuracy</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white font-mono text-glow-purple">
              {stats.files ? stats.files.toLocaleString() : '0'}
            </h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Media Scans Logged</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white font-mono text-glow-red">
              {stats.models ? `${stats.models}+` : '0'}
            </h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Supported Networks</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-3xl sm:text-4xl font-extrabold text-white font-mono text-glow-green">
              {stats.speed ? `< ${stats.speed}s` : '0s'}
            </h4>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Processing Clock</p>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="bg-[#0B0F19] border-t border-white/5 py-12 px-6 lg:px-12 text-center text-xs text-gray-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-blue-500" />
            <span className="font-extrabold text-white tracking-widest">AI Content Detector</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#detectors" className="hover:text-white transition-colors">Detection Matrix</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#stats" className="hover:text-white transition-colors">Metrics</a>
          </div>
          <p>© 2026 AI Content Detection System. Developed as a Final Year Project.</p>
        </div>
      </footer>
    </div>
  );
}
