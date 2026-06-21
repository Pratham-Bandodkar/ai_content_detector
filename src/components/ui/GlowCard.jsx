import React from 'react';
import { motion } from 'framer-motion';

export default function GlowCard({ children, className = '', glowColor = 'from-blue-500/20 to-purple-600/20', hoverGlow = true, delay = 0, onClick, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverGlow ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={`relative group overflow-hidden rounded-2xl border border-white/5 bg-[#121826]/60 backdrop-blur-xl p-6 transition-all duration-300 ${
        hoverGlow ? 'hover:border-blue-500/30 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {/* Glow gradient overlay on hover */}
      {hoverGlow && (
        <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
      )}
      
      {/* Decorative corner light */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/0 rounded-full blur-2xl pointer-events-none group-hover:from-blue-500/20 transition-all duration-500" />
      
      {children}
    </motion.div>
  );
}
