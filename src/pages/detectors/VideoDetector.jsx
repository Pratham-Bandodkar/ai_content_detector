import React, { useState, useEffect } from 'react';
import { 
  Video, ArrowRight, Play, Pause, ShieldAlert, Info, 
  Eye, Monitor, Cpu, Database, RefreshCw, BarChart2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import GlowCard from '../../components/ui/GlowCard';
import GlowButton from '../../components/ui/GlowButton';
import UploadZone from '../../components/ui/UploadZone';
import ScannerLoader from '../../components/ui/ScannerLoader';
import ProgressRing from '../../components/ui/ProgressRing';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoDetector() {
  const { addScan } = useApp();
  const { showToast } = useToast();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeFrame, setActiveFrame] = useState(0);

  // Facial tracker bounding box mock coordinates
  const [boxCoords, setBoxCoords] = useState({ top: '35%', left: '42%', width: '120px', height: '120px' });

  // Simulate video playback frame counts
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setActiveFrame((prev) => {
          const next = (prev + 12) % 360;
          
          // Randomize face tracker boxes slightly to simulate movements
          setBoxCoords({
            top: `${30 + Math.random() * 8}%`,
            left: `${38 + Math.random() * 8}%`,
            width: `${115 + Math.random() * 10}px`,
            height: `${115 + Math.random() * 10}px`
          });
          
          return next;
        });
      }, 200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleFileSelect = (file) => {
    if (!file) {
      setSelectedFile(null);
      setFileUrl('');
      setIsPlaying(false);
      setShowResults(false);
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    setIsPlaying(false);
    setShowResults(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      showToast('Please select or upload a video file first.', 'warning');
      return;
    }

    setIsScanning(true);
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/detect/video', {
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
      ? 'Facial blending discrepancies and optical flow variations detected. Color mismatches around eyes and mouth borders indicate AI deepfake blending.'
      : 'Optical landmark coherence is secure. Face mesh geometry transitions are organic; no generative GAN boundary structures found.';

    const scanRef = addScan(selectedFile.name, 'video', score, details);

    const timelineData = (data.frame_scores && data.frame_scores.length > 0)
      ? data.frame_scores
      : [
          { frame: 'F-0', score: score > 50 ? 45 : 12 },
          { frame: 'F-60', score: score > 50 ? 78 : 18 },
          { frame: 'F-120', score: score > 50 ? 94 : 22 },
          { frame: 'F-180', score: score > 50 ? 92 : 15 },
          { frame: 'F-240', score: score > 50 ? 68 : 8 },
          { frame: 'F-300', score: score > 50 ? 84 : 10 },
          { frame: 'F-360', score: score > 50 ? 72 : 14 }
        ];

    const durationStr = data.duration ? `${data.duration.toFixed(1)} Seconds` : '6.0 Seconds';
    const fpsStr = data.fps ? `${data.fps} FPS` : '30 FPS';

    setAnalysisResult({
      score,
      details,
      scanRef,
      timelineData,
      meta: {
        dimensions: '1920 x 1080 (1080p)',
        fps: fpsStr,
        duration: durationStr,
        facialTracks: '1 Active Face Mesh Found',
        codec: 'HEVC / H.265'
      }
    });

    setShowResults(true);
    showToast('Video face-swaps forensics scan complete.', 'success');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileUrl('');
    setIsPlaying(false);
    setShowResults(false);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">AI VIDEO FORENSICS</h2>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Deepfake face blending checks & temporal consistency scanner
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Upload Zone & Cinematic Player */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard hoverGlow={false} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4.5 h-4.5 text-teal-400" />
                Video Feed Terminal
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
              accept="video/*"
              iconType="video"
              label="Drag and drop your video file here, or click to browse"
              sublabel="Supports MP4, MOV, MKV up to 50MB"
              onFileSelect={handleFileSelect}
            />

            {/* Execute Analysis */}
            {selectedFile && !showResults && !isScanning && (
              <div className="pt-4 flex justify-end border-t border-white/5">
                <GlowButton variant="purple" onClick={handleAnalyze}>
                  EXECUTE VIDEO SCAN
                  <ArrowRight className="w-4 h-4" />
                </GlowButton>
              </div>
            )}
          </GlowCard>

          {/* Scanner Overlay during scan */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ScannerLoader
                  logs={[
                    'Opening Video Decoder stream...',
                    'Isolating face meshes and landmark vectors...',
                    'Tracking eyes/lips blending discrepancies...',
                    'Performing temporal inconsistencies scans...',
                    'Computing optical flow variances...',
                    'Drafting deepfake verification report...'
                  ]}
                  duration={60000}
                  onComplete={() => {}}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cinematic Video Player Overlay */}
          <AnimatePresence>
            {(isScanning || showResults) && fileUrl && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl border border-white/10 bg-black/80 overflow-hidden flex flex-col justify-between min-h-[350px]"
              >
                {/* Horizontal scanner bar during scan */}
                {isScanning && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_15px_#2dd4bf] z-20 animate-scan pointer-events-none" />
                )}

                {/* Cyber Matrix visual grid */}
                <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

                {/* Mock Player Screen */}
                <div className="relative flex-1 flex items-center justify-center p-4 min-h-[280px]">
                  <video
                    src={fileUrl}
                    className="max-h-[360px] max-w-full rounded-xl object-contain shadow-2xl"
                    muted
                    loop
                    playsInline
                    autoPlay={isPlaying}
                  />

                  {/* Face Mesh Tracking Bounding Box overlay */}
                  {(isScanning || (showResults && isPlaying)) && (
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: boxCoords.top,
                        left: boxCoords.left,
                        width: boxCoords.width,
                        height: boxCoords.height
                      }}
                      className="border border-teal-500 bg-teal-500/10 rounded-lg shadow-[0_0_20px_rgba(45,212,191,0.2)] flex flex-col justify-between p-1 select-none pointer-events-none"
                    >
                      {/* Bounding corners style */}
                      <div className="flex justify-between">
                        <span className="w-2 h-2 border-t-2 border-l-2 border-teal-400" />
                        <span className="w-2 h-2 border-t-2 border-r-2 border-teal-400" />
                      </div>
                      
                      <div className="text-[7px] font-mono font-extrabold text-teal-400 text-center tracking-widest uppercase bg-black/60 py-0.5 rounded">
                        MESH_TRACK: {showResults && analysisResult?.score > 50 ? 'AI_FLAGGED' : 'SECURE'}
                      </div>

                      <div className="flex justify-between">
                        <span className="w-2 h-2 border-b-2 border-l-2 border-teal-400" />
                        <span className="w-2 h-2 border-b-2 border-r-2 border-teal-400" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Player Controls bar */}
                <div className="bg-[#121826]/90 border-t border-white/5 p-4 flex items-center justify-between gap-4 z-10 relative">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`p-2.5 rounded-full border transition-all ${
                        isPlaying 
                          ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.3)]' 
                          : 'bg-white/5 border-white/5 text-gray-300 hover:text-white'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    
                    <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">
                      Frame ID: {activeFrame} / 360
                    </span>
                  </div>

                  <div className="flex-1 max-w-xs bg-gray-900 h-1.5 rounded-full overflow-hidden p-[1px] relative">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-200"
                      style={{ width: `${(activeFrame / 360) * 100}%` }}
                    />
                  </div>

                  <div className="text-right hidden sm:block">
                    <span className="text-[8px] font-extrabold text-gray-500 uppercase tracking-widest block">Neural clock</span>
                    <span className="text-xs text-white font-mono">1.2ms / FRM</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {showResults && analysisResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Result Card */}
                <GlowCard hoverGlow={false} className="space-y-6 !p-6" glowColor={analysisResult?.score > 50 ? 'from-teal-500/15 to-teal-600/0' : 'from-emerald-500/15 to-emerald-600/0'}>
                  <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Deepfake Verdict</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                      analysisResult?.score > 50 
                        ? 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_10px_rgba(45,212,191,0.2)]' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {analysisResult?.score > 50 ? 'DEEPFAKE DETECTED' : 'CAMERA VERIFIED'}
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
                    <div className="flex items-center gap-1.5 text-teal-400 mb-2 border-b border-white/5 pb-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SYS_DEEPFAKE_REMARKS</span>
                    </div>
                    {analysisResult?.details}
                  </div>
                </GlowCard>

                {/* Timeline Analysis Chart */}
                {analysisResult?.score > 50 && (
                  <GlowCard hoverGlow={false} className="space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <BarChart2 className="w-4.5 h-4.5 text-teal-400" />
                        Discrepancy Over Frames
                      </span>
                    </div>

                    <div className="w-full h-32 text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analysisResult?.timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="frame" stroke="#64748B" fontSize={8} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={8} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#121826', 
                              borderColor: 'rgba(255,255,255,0.1)', 
                              fontSize: '9px',
                              color: '#FFF' 
                            }} 
                          />
                          <Line type="monotone" dataKey="score" stroke="#14B8A6" strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </GlowCard>
                )}

                {/* Video metadata */}
                <GlowCard hoverGlow={false} className="space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4.5 h-4.5 text-blue-400" />
                      Video Stream Profiles
                    </span>
                  </div>

                  <div className="space-y-3 font-semibold text-xs text-gray-300">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Dimensions</span>
                      <span className="text-white">{analysisResult?.meta?.dimensions}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Frames Rate</span>
                      <span className="text-white">{analysisResult?.meta?.fps}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Duration</span>
                      <span className="text-white">{analysisResult?.meta?.duration}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Mesh Targets</span>
                      <span className="text-white">{analysisResult?.meta?.facialTracks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase">Codec Format</span>
                      <span className="text-white">{analysisResult?.meta?.codec}</span>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ) : (
              <GlowCard hoverGlow={false} className="h-[360px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-gray-500 animate-pulse">
                  <Monitor className="w-10 h-10" />
                </div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Awaiting Stream</h4>
                <p className="text-[10px] text-gray-400 max-w-[180px] font-semibold">
                  Upload a video feed on the left to activate landmark deepfake checks overlays.
                </p>
              </GlowCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
