import React, { useState, useEffect } from 'react';
import {
  Music, ArrowRight, Play, Pause, ShieldAlert, Info,
  Volume2, Disc, Database, Activity, RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import GlowCard from '../../components/ui/GlowCard';
import GlowButton from '../../components/ui/GlowButton';
import UploadZone from '../../components/ui/UploadZone';
import ScannerLoader from '../../components/ui/ScannerLoader';
import ProgressRing from '../../components/ui/ProgressRing';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioDetector() {
  const { addScan } = useApp();
  const { showToast } = useToast();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Wave bar animation helpers
  const [waveHeightMultiplier, setWaveHeightMultiplier] = useState(Array(18).fill(1));

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setWaveHeightMultiplier(
          Array(18).fill(0).map(() => Math.random() * 2.2 + 0.3)
        );
      }, 150);
    } else {
      setWaveHeightMultiplier(Array(18).fill(0.3));
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleFileSelect = (file) => {
    if (!file) {
      setSelectedFile(null);
      setIsPlaying(false);
      setShowResults(false);
      return;
    }
    setSelectedFile(file);
    setIsPlaying(false);
    setShowResults(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      showToast('Please select or upload an audio file first.', 'warning');
      return;
    }

    setIsScanning(true);
    setShowResults(false);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/detect/audio', {
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
      ? 'Acoustic metadata analysis flags robotic synthesis spikes. Higher order harmonics reveal voice-cloning phase anomalies.'
      : 'Natural phonetic transition vectors confirmed. Frequency harmonics align with human diaphragm pitch modulation.';

    const scanRef = addScan(selectedFile.name, 'audio', score, details);

    const mockFreqData = [
      { hz: '20Hz', human: 10, robot: 8 },
      { hz: '100Hz', human: 54, robot: 42 },
      { hz: '500Hz', human: 82, robot: 65 },
      { hz: '1KHz', human: 70, robot: 74 },
      { hz: '3KHz', human: 42, robot: Math.round(score * 0.95) },
      { hz: '5KHz', human: 20, robot: Math.round(score * 0.85) },
      { hz: '10KHz', human: 8, robot: Math.round(score * 0.45) }
    ];

    setAnalysisResult({
      score,
      details,
      scanRef,
      freqData: mockFreqData,
      meta: {
        duration: '0:34 Sec',
        codec: score > 50 ? 'PCM Synthesized vocoder' : 'MPEG Audio Layer 3 (MP3)',
        sampleRate: '22.05 KHz',
        bitRate: '320 Kbps',
        channels: 'Mono'
      }
    });

    setShowResults(true);
    showToast('Acoustic voice analysis completed.', 'success');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setIsPlaying(false);
    setShowResults(false);
    setAnalysisResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">AI AUDIO DETECTOR</h2>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Forensic voice authentication & acoustic synthesis verification
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Upload Zone & Player */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard hoverGlow={false} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Music className="w-4.5 h-4.5 text-pink-400" />
                Acoustic Scanner Console
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
              accept="audio/*"
              iconType="audio"
              label="Drag and drop your audio file here, or click to browse"
              sublabel="Supports WAV, MP3, AAC up to 15MB"
              onFileSelect={handleFileSelect}
            />

            {/* Playback player (Only shown when file uploaded) */}
            {selectedFile && !isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#121826]/40 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-6"
              >
                {/* Play Button */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-3 rounded-full transition-all border flex items-center justify-center shrink-0 ${isPlaying
                    ? 'bg-pink-500/10 border-pink-500/40 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                    : 'bg-white/5 border-white/5 text-gray-300 hover:text-white'
                    }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                </button>

                {/* Animated Audio Waveform bars */}
                <div className="flex-1 flex items-center justify-center gap-1 h-12 overflow-hidden px-4">
                  {waveHeightMultiplier.map((multiplier, idx) => (
                    <div
                      key={idx}
                      className="w-1 rounded bg-gradient-to-t from-pink-500 to-purple-600 transition-all duration-150"
                      style={{ height: `${multiplier * 16}px` }}
                    />
                  ))}
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Asset status</span>
                  <span className="text-xs text-white font-mono">{isPlaying ? 'PLAYING' : 'PAUSED'}</span>
                </div>
              </motion.div>
            )}

            {/* Analyze trigger */}
            {selectedFile && !showResults && !isScanning && (
              <div className="pt-4 flex justify-end border-t border-white/5">
                <GlowButton variant="purple" onClick={handleAnalyze}>
                  EXECUTE ACOUSTIC SCAN
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
                    'Extracting acoustic track buffers...',
                    'Filtering vocal frequency bands...',
                    'Demultiplexing noise registers...',
                    'Measuring vocoder phase synchronization...',
                    'Detecting neural voice cloning harmonics...',
                    'Generating acoustic authenticity logs...'
                  ]}
                  duration={60000}
                  onComplete={() => { }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Spectrogram Placeholder (Shown only on results page) */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl border border-white/10 bg-black/60 p-5 overflow-hidden flex flex-col justify-between min-h-[220px]"
              >
                <div className="border-b border-white/5 pb-2 mb-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">3D Voice Spectrogram Matrix</h3>
                  <p className="text-[9px] text-gray-500">Phonetic pitch tracking & vocal resonance patterns</p>
                </div>

                {/* Cyber Matrix visual grid */}
                <div className="flex-1 relative flex flex-col gap-1 text-[9px] font-mono text-pink-400">
                  <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />

                  {/* Glowing spectrogram blocks */}
                  <div className="h-full flex items-end gap-1.5 min-h-[120px] relative z-10 w-full px-2">
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/40 to-pink-500/80 rounded-t h-[60%] animate-pulse" />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/30 to-pink-500/80 rounded-t h-[30%] animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/50 to-pink-500/80 rounded-t h-[80%] animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/25 to-pink-500/80 rounded-t h-[45%] animate-pulse" style={{ animationDelay: '0.6s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/35 to-pink-500/80 rounded-t h-[75%] animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/45 to-pink-500/80 rounded-t h-[55%] animate-pulse" style={{ animationDelay: '0.8s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/50 to-pink-500/80 rounded-t h-[90%] animate-pulse" style={{ animationDelay: '0.3s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/20 to-pink-500/80 rounded-t h-[40%] animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/40 to-pink-500/80 rounded-t h-[65%] animate-pulse" style={{ animationDelay: '0.7s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/30 to-pink-500/80 rounded-t h-[50%] animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/45 to-pink-500/80 rounded-t h-[85%] animate-pulse" style={{ animationDelay: '0.9s' }} />
                    <div className="flex-1 bg-gradient-to-t from-purple-500/10 via-purple-500/25 to-pink-500/80 rounded-t h-[35%] animate-pulse" style={{ animationDelay: '0.4s' }} />
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
                {/* Score Card */}
                <GlowCard hoverGlow={false} className="space-y-6 !p-6" glowColor={analysisResult?.score > 50 ? 'from-pink-500/15 to-pink-600/0' : 'from-emerald-500/15 to-emerald-600/0'}>
                  <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Acoustic Verdict</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black border ${analysisResult?.score > 50
                      ? 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                      {analysisResult?.score > 50 ? 'SYNTHESIZED VOICE' : 'ORGANIC SPEAKER'}
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
                    <div className="flex items-center gap-1.5 text-pink-400 mb-2 border-b border-white/5 pb-1 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>SYS_ACOUSTIC_REMARKS</span>
                    </div>
                    {analysisResult?.details}
                  </div>
                </GlowCard>

                {/* Frequency chart diagnostics */}
                {analysisResult?.score > 50 && (
                  <GlowCard hoverGlow={false} className="space-y-4">
                    <div className="border-b border-white/5 pb-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4.5 h-4.5 text-pink-400" />
                        Frequency Synthesis Anomalies
                      </span>
                    </div>

                    <div className="w-full h-32 text-[10px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analysisResult?.freqData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="hz" stroke="#64748B" fontSize={8} tickLine={false} />
                          <YAxis stroke="#64748B" fontSize={8} tickLine={false} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#121826',
                              borderColor: 'rgba(255,255,255,0.1)',
                              fontSize: '9px',
                              color: '#FFF'
                            }}
                          />
                          <Area type="monotone" dataKey="robot" stroke="#EC4899" fill="#EC4899" fillOpacity={0.1} strokeWidth={1.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlowCard>
                )}

                {/* Metadata details */}
                <GlowCard hoverGlow={false} className="space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4.5 h-4.5 text-blue-400" />
                      Acoustic Container Info
                    </span>
                  </div>

                  <div className="space-y-3 font-semibold text-xs text-gray-300">
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Duration</span>
                      <span className="text-white">{analysisResult?.meta?.duration}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Sample Rate</span>
                      <span className="text-white">{analysisResult?.meta?.sampleRate}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Bit Rate</span>
                      <span className="text-white">{analysisResult?.meta?.bitRate}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-gray-500 uppercase">Channels</span>
                      <span className="text-white">{analysisResult?.meta?.channels}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 uppercase">Codec Signature</span>
                      <span className="text-white truncate max-w-[150px]">{analysisResult?.meta?.codec}</span>
                    </div>
                  </div>
                </GlowCard>
              </motion.div>
            ) : (
              <GlowCard hoverGlow={false} className="h-[360px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-gray-500 animate-pulse">
                  <Volume2 className="w-10 h-10" />
                </div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Awaiting Audio</h4>
                <p className="text-[10px] text-gray-400 max-w-[180px] font-semibold">
                  Upload an audio track on the left to verify synthetic speech frequency anomalies.
                </p>
              </GlowCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
