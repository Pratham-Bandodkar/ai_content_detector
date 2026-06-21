import React, { useState, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon, Music, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadZone({ 
  accept = 'text/*', 
  iconType = 'text', 
  label = 'Drag and drop your file here, or click to browse',
  sublabel = 'Supports TXT up to 10MB',
  onFileSelect 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      if (onFileSelect) {
        onFileSelect(selectedFile);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (onFileSelect) {
      onFileSelect(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderIcon = () => {
    const icons = {
      text: <FileText className="w-10 h-10 text-blue-400 group-hover:text-blue-300 transition-colors" />,
      image: <ImageIcon className="w-10 h-10 text-purple-400 group-hover:text-purple-300 transition-colors" />,
      audio: <Music className="w-10 h-10 text-pink-400 group-hover:text-pink-300 transition-colors" />,
      video: <Video className="w-10 h-10 text-teal-400 group-hover:text-teal-300 transition-colors" />
    };
    return icons[iconType] || <Upload className="w-10 h-10 text-blue-400" />;
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300 bg-[#121826]/30 backdrop-blur-md ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/5 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[0.99]' 
                : 'border-white/10 hover:border-blue-500/50 hover:bg-white/[0.02]'
            }`}
          >
            <div className="p-4 bg-white/5 rounded-full mb-4 border border-white/5 group-hover:border-blue-500/20 transition-all duration-300">
              {renderIcon()}
            </div>
            <p className="text-sm font-semibold text-gray-200 text-center max-w-xs leading-relaxed">
              {label}
            </p>
            <p className="text-xs text-gray-400 text-center mt-2 font-medium">
              {sublabel}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative border border-white/10 rounded-2xl p-6 bg-[#121826]/60 backdrop-blur-md flex items-center justify-between"
          >
            {/* File Info */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                {renderIcon()}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                  {file.name}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  {formatBytes(file.size)} • Ready to Scan
                </p>
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={clearFile}
              className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white border border-transparent hover:border-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Scanning Line overlay decoration */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
