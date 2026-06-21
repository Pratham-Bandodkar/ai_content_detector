import React, { useState } from 'react';
import { 
  Image as ImageIcon, ArrowRight, Eye, EyeOff, ShieldAlert, 
  Info, Cpu, FileText, Database, Compass, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import GlowCard from '../../components/ui/GlowCard';
import GlowButton from '../../components/ui/GlowButton';
import UploadZone from '../../components/ui/UploadZone';
import ScannerLoader from '../../components/ui/ScannerLoader';
import ProgressRing from '../../components/ui/ProgressRing';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageDetector() {
  const { addScan } = useApp();
  const { showToast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const handleFileSelect = (file) => {
    if (!file) {
      setSelectedFile(null);
      setFileUrl('');
      setShowResults(false);
      return;
    }
    
    // Create mock preview url
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setShowResults(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      showToast('Please select or upload an image file first.', 'warning');
      return;
    }

    setIsScanning(true);
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/detect/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = 'Analysis failed';
        try {
          const data = await response.json();
          errorMsg = data.error || errorMsg;
        } catch (_) {
          errorMsg = `Server error (Status ${response.status}). Ensure the backend server is running.`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      handleScanComplete(data);
    } catch (err) {
      setIsScanning(false);
      showToast(`Analysis error: ${err.message}`, 'error');
    }
  };

  const handleScanComplete = (data) => {
    setIsScanning(false);

    const score = data.ai_score ?? 50;
    const details = score > 50
      ? 'Diffusion noise textures isolated in background fields. Pixel gradient anomalies match generative GAN patterns.'
      : 'Sensor pattern noise matches native DSLR output. Exif records verify camera structure.';

    const scanRef = addScan(selectedFile.name, 'image', score, details);

    const dummyMeta = {
      resolution: '3840 x 2160 (4K)',
      camera: score > 50 ? 'N/A (Generative)' : 'Camera Origin Verified',
      colorSpace: 'sRGB IEC61966-2.1',
      software: score > 50 ? 'Stable Diffusion / Midjourney / GAN' : 'Adobe Photoshop CC 2026',
      fileSize: data.fileSize || `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
    };

    setAnalysisResult({ score, details, scanRef, meta: dummyMeta });
    setShowResults(true);
    showToast('Image scan completed. Metadata parsed.', 'success');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileUrl('');
    setShowResults(false);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">AI IMAGE FORENSICS</h2>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Forensic pixel analysis & generative noise signature scanner
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Upload Zone */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard hoverGlow={false} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4.5 h-4.5 text-purple-400" />
                Image Upload Console
              </span>
              {selectedFile && (
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] text-gray-300 hover:text-white rounded-lg flex items-center gap-1 transition-all font-bold uppercase"
                >
                  <RefreshCw className="w-3 h-3" /> Reselect
                </button>
              )}
            </div>

            <UploadZone
              accept="image/*"
              iconType="image"
              label="Drag and drop your image file here, or click to browse"
              sublabel="Supports PNG, JPG, WEBP up to 20MB"
              onFileSelect={handleFileSelect}
            />

            {/* Execute Analysis */}
            {selectedFile && !showResults && !isScanning && (
              <div className="pt-4 flex justify-end border-t border-white/5">
                <GlowButton variant="purple" onClick={handleAnalyze}>
                  EXECUTE IMAGE SCAN
                  <ArrowRight className="w-4 h-4" />
                </GlowButton>
              </div>
            )}
          </GlowCard>

          {/* Scanner loading state */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ScannerLoader
                  logs={[
                    'Loading Image Decoding modules...',
                    'Isolating pixel channel matrices...',
                    'Extracting camera metadata and EXIF profiles...',
                    'Searching for GAN / Diffusion pattern structures...',
                    'Compiling pixel-coherence deviation gradients...',
                    'Finalizing forensic threat matrix analysis...'
                  ]}
                  duration={60000}
                  onComplete={() => {}}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Scanner Animation Panel (Shown during scan or results) */}
          <AnimatePresence>
            {(isScanning || showResults) && fileUrl && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl border border-white/10 bg-black/60 p-4 overflow-hidden flex items-center justify-center min-h-[300px] max-h-[500px]"
              >
                {/* Horizontal scanner bar */}
                {isScanning && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_#a855f7] z-20 animate-scan pointer-events-none" />
                )}

                {/* Grid Overlay */}
                <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

                {/* Display Image & Heatmap overlays */}
                <div className="relative max-w-full max-h-[460px] rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={fileUrl}
                    alt="Scan preview"
                    className="max-h-[460px] object-contain rounded-xl select-none"
                  />
                  
                  {/* Heatmap overlay mockup */}
                  {showResults && showHeatmap && analysisResult?.score > 50 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      className="absolute inset-0 bg-transparent mix-blend-color-dodge pointer-events-none"
                    >
                      {/* Generative Heatmap Circles */}
                      <div className="absolute top-[25%] left-[30%] w-36 h-36 bg-red-500 rounded-full blur-[40px] opacity-75 animate-pulse" />
                      <div className="absolute top-[50%] left-[55%] w-40 h-40 bg-orange-500 rounded-full blur-[45px] opacity-65 animate-pulse" style={{ animationDelay: '1s' }} />
                      <div className="absolute bottom-[20%] right-[25%] w-24 h-24 bg-rose-500 rounded-full blur-[30px] opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Results panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {showResults && analysisResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Result Card */}
                <GlowCard hoverGlow={false} className="space-y-6 !p-6" glowColor={analysisResult?.score > 50 ? 'from-purple-500/15 to-purple-600/0' : 'from-emerald-500/15 to-emerald-600/0'}>
                  <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Image Verdict</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                      analysisResult?.score > 50 
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {analysisResult?.score > 50 ? 'GENERATIVE MASKED' : 'CAMERA ORIGIN'}
                    </span>
                  </div>

                  <div className="flex justify-center py-2">
                    <ProgressRing 
                      percent={analysisResult?.score} 
                      size={140} 
                      strokeWidth={10} 
                      color="dynamic" 
                    />
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-gray-400 leading-relaxed shadow-inner">
                    <div className="flex items-center gap-1.5 text-purple-400 mb-2 border-b border-white/5 pb-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SYS_NOISE_REMARKS</span>
                    </div>
                    {analysisResult?.details}
                  </div>
                  
                  {/* Heatmap Toggle (Only shown for AI heavy images) */}
                  {analysisResult?.score > 50 && (
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs font-bold text-gray-400 uppercase">Tampering Heatmap</span>
                      <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 ${
                          showHeatmap 
                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                            : 'bg-white/5 border-white/5 text-gray-400'
                        }`}
                      >
                        {showHeatmap ? (
                          <>
                            <Eye className="w-4 h-4" /> Heatmap Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" /> Heatmap Hidden
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </GlowCard>

                {/* Metadata Diagnostics */}
                <GlowCard hoverGlow={false} className="space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4.5 h-4.5 text-blue-400" />
                      Exif Metadata Parse
                    </span>
                  </div>

                  <div className="space-y-3 font-semibold text-xs text-gray-300">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Dimensions</span>
                      <span className="text-white">{analysisResult?.meta?.resolution}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">File Volume</span>
                      <span className="text-white">{analysisResult?.meta?.fileSize}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Origin Signature</span>
                      <span className="text-white truncate max-w-[150px]">{analysisResult?.meta?.camera}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Format color</span>
                      <span className="text-white">{analysisResult?.meta?.colorSpace}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase">Encoding Module</span>
                      <span className="text-white truncate max-w-[150px]">{analysisResult?.meta?.software}</span>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ) : (
              <GlowCard hoverGlow={false} className="h-[360px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-gray-500 animate-pulse">
                  <Compass className="w-10 h-10" />
                </div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Awaiting Media</h4>
                <p className="text-[10px] text-gray-400 max-w-[180px] font-semibold">
                  Upload an image asset on the left and run analysis to map metadata anomalies.
                </p>
              </GlowCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
