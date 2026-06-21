import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Image as ImageIcon, Music, Video, ArrowRight, Shield, Cpu, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import GlowCard from '../../components/ui/GlowCard';
import { motion } from 'framer-motion';

const detectors = [
  {
    title: 'Text Detection',
    description: 'Analyze articles, essays, and written content for AI-generated patterns using advanced linguistic fingerprinting.',
    icon: FileText,
    path: '/dashboard/text',
    gradient: 'from-blue-500 to-cyan-400',
    glowColor: 'from-blue-500/15 to-cyan-400/0',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    iconColor: 'text-blue-400',
    tag: 'NLP Engine',
  },
  {
    title: 'Image Detection',
    description: 'Detect AI-generated or manipulated images through pixel-level forensic analysis and GAN artifact scanning.',
    icon: ImageIcon,
    path: '/dashboard/image',
    gradient: 'from-purple-500 to-pink-400',
    glowColor: 'from-purple-500/15 to-pink-400/0',
    iconBg: 'bg-purple-500/10 border-purple-500/20',
    iconColor: 'text-purple-400',
    tag: 'Vision Model',
  },
  {
    title: 'Audio Detection',
    description: 'Identify synthetic speech, voice clones, and AI-generated audio through spectral pattern recognition.',
    icon: Music,
    path: '/dashboard/audio',
    gradient: 'from-pink-500 to-rose-400',
    glowColor: 'from-pink-500/15 to-rose-400/0',
    iconBg: 'bg-pink-500/10 border-pink-500/20',
    iconColor: 'text-pink-400',
    tag: 'Audio Classifier',
  },
  {
    title: 'Video Detection',
    description: 'Scan video content for deepfakes, AI-generated frames, and synthetic media through temporal analysis.',
    icon: Video,
    path: '/dashboard/video',
    gradient: 'from-teal-500 to-emerald-400',
    glowColor: 'from-teal-500/15 to-emerald-400/0',
    iconBg: 'bg-teal-500/10 border-teal-500/20',
    iconColor: 'text-teal-400',
    tag: 'DeepScan Engine',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, user } = useApp();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            DETECTION HUB
          </h2>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
            Select a detection module to begin scanning • Welcome, {user.name}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 bg-black/40 border border-white/5 px-3.5 py-1.5 rounded-xl">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>All systems online</span>
          </div>
        </div>
      </div>



      {/* Detector Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {detectors.map((detector) => {
          const Icon = detector.icon;
          return (
            <motion.div key={detector.path} variants={cardVariants}>
              <GlowCard
                hoverGlow={true}
                glowColor={detector.glowColor}
                className="group cursor-pointer relative overflow-hidden min-h-[180px] flex flex-col justify-between"
                onClick={() => navigate(detector.path)}
              >
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${detector.gradient} opacity-40 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 ${detector.iconBg} border rounded-xl ${detector.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                          {detector.title}
                        </h3>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${detector.iconColor}`}>
                          {detector.tag}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {detector.description}
                    </p>
                  </div>
                </div>

                {/* Launch button */}
                <div className="flex items-center justify-end mt-4">
                  <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${detector.iconColor} group-hover:gap-2.5 transition-all duration-300`}>
                    <span>Launch Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Background decorative icon */}
                <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none">
                  <Icon className="w-32 h-32" />
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
