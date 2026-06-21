import React from 'react';
import { motion } from 'framer-motion';

export default function GlowButton({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary', 
  className = '', 
  disabled = false,
  fullWidth = false
}) {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none px-6 py-3 text-sm';
  
  const widthStyle = fullWidth ? 'w-full' : '';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] hover:brightness-110 border border-white/10',
    secondary: 'bg-[#121826]/80 text-blue-400 hover:text-white border border-blue-500/30 hover:border-blue-500/80 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]',
    purple: 'bg-[#121826]/80 text-purple-400 hover:text-white border border-purple-500/30 hover:border-purple-500/80 shadow-[inset_0_0_12px_rgba(139,92,246,0.1)] hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
