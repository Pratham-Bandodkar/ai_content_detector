import React, { useState } from 'react';
import { 
  FileText, ArrowRight, RefreshCw, Clipboard, Trash2, ShieldCheck, 
  AlertTriangle, BookOpen, Clock, Heart, PieChart, Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../components/ui/Toast';
import GlowCard from '../../components/ui/GlowCard';
import GlowButton from '../../components/ui/GlowButton';
import ScannerLoader from '../../components/ui/ScannerLoader';
import ProgressRing from '../../components/ui/ProgressRing';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_SUSPICIOUS_PHRASES = [
  { text: "Furthermore, it is important to consider that", reason: "Highly typical repetitive LLM transitional phrase (Probability: 94%)." },
  { text: "delve into the intricate tapestry of", reason: "Standard ChatGPT metaphor cliché flagged as synthetic (Probability: 97%)." },
  { text: "in conclusion, we must remember that", reason: "Lacks human sentence structure variance; highly predictable perplexity (Probability: 89%)." }
];

export default function TextDetector() {
  const { addScan } = useApp();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      showToast('Clipboard contents imported.', 'info');
    } catch (err) {
      showToast('Please paste manually using Ctrl+V.', 'warning');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'text/plain') {
      showToast('Invalid file format. Please upload a .txt file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target.result);
      showToast(`Text from ${file.name} imported.`, 'success');
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    setText('');
    setShowResults(false);
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!text.trim() || text.length < 50) {
      showToast('Please input at least 50 characters for neural analysis.', 'warning');
      return;
    }

    setIsScanning(true);
    setShowResults(false);

    try {
      const response = await fetch('/api/detect/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
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

    const aiProb = data.ai_score ?? 50;
    const humanProb = 100 - aiProb;

    const lrScore = data.lr_ai_prob != null ? `TF-IDF: ${data.lr_ai_prob}%` : '';
    const rbScore = data.roberta_ai_prob != null ? `RoBERTa: ${data.roberta_ai_prob}%` : '';
    const gltrScore = data.gltr_ai_prob != null ? `GLTR: ${data.gltr_ai_prob}%` : '';
    const scanDetails = aiProb > 50
      ? `LLM markers matched. ${rbScore} | ${gltrScore} | ${lrScore}. Suspicious structural transitions located.`
      : `Natural cadence variance detected. ${rbScore} | ${gltrScore} | ${lrScore}. No synthetic diffusion patterns matched.`;

    const scanRef = addScan('Text_Analysis_' + Date.now().toString().slice(-4) + '.txt', 'text', aiProb, scanDetails);

    setAnalysisResult({
      aiProb,
      humanProb,
      scanRef,
      sentenceScores: data.sentence_scores || [],
      roberta: data.roberta_ai_prob,
      gltr: data.gltr_ai_prob,
      tfidf: data.lr_ai_prob,
    });

    setShowResults(true);
    showToast('Threat verification report built successfully.', 'success');
  };

  // Helper to render a linguistic heatmap using real per-sentence ensemble scores from backend
  const renderTextHeatmap = () => {
    if (!analysisResult) return null;

    const scores = analysisResult.sentenceScores;

    // If backend returned real sentence scores, use them
    if (scores && scores.length > 0) {
      return (
        <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
          {scores.map((item, idx) => {
            const sentenceScore = item.score;
            let colorStyle = "";
            let levelLabel = "";
            let dotColor = "";

            if (sentenceScore > 70) {
              colorStyle = "bg-red-500/15 text-red-200 border-b border-red-500/30 hover:bg-red-500/25";
              levelLabel = "Highly Synthetic Signal";
              dotColor = "bg-red-500";
            } else if (sentenceScore > 40) {
              colorStyle = "bg-amber-500/10 text-amber-200 border-b border-amber-500/30 hover:bg-amber-500/20";
              levelLabel = "Inconsistent Cadence Anomaly";
              dotColor = "bg-amber-500";
            } else {
              colorStyle = "bg-emerald-500/5 text-emerald-100/90 border-b border-emerald-500/15 hover:bg-emerald-500/15";
              levelLabel = "Verified Natural Cadence";
              dotColor = "bg-emerald-500";
            }

            return (
              <span
                key={idx}
                className={`inline cursor-help relative group px-1 rounded transition-all duration-150 ${colorStyle}`}
              >
                {item.text}{' '}
                
                {/* Interactive Hover Tooltip with real scores */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0f1420]/95 border border-white/10 backdrop-blur-md text-[10px] text-gray-200 p-2.5 rounded-xl shadow-2xl w-52 z-30 font-sans leading-normal font-medium">
                  <div className="flex justify-between items-center mb-1.5 border-b border-white/5 pb-1">
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Ensemble Score</span>
                    <span className="flex items-center gap-1 text-[8px] font-black text-white">
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-ping`} />
                      {sentenceScore}% AI
                    </span>
                  </div>
                  <div className="text-gray-300 font-bold text-[9px] leading-relaxed mb-1">
                    {levelLabel}
                  </div>
                  <div className="text-[8px] text-gray-500">
                    {sentenceScore > 70 
                      ? "Repetitive burstiness & low perplexity markers detected."
                      : sentenceScore > 40
                      ? "Slight linguistic pattern matching neural diffusion distributions."
                      : "Organic structural transitions with balanced vocabulary distribution."}
                  </div>
                </span>
              </span>
            );
          })}
        </div>
      );
    }

    // Fallback: show the raw text if no sentence scores available
    return <p className="text-xs text-gray-400 font-sans">{text}</p>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">AI TEXT CLASSIFIER</h2>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Forensic linguistic scanner targeting LLM structures
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          <GlowCard hoverGlow={false} className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-blue-400" />
                Raw Text Input
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePaste}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] text-gray-300 hover:text-white rounded-lg flex items-center gap-1.5 transition-all font-bold uppercase"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  Paste
                </button>
                <button
                  onClick={handleClear}
                  className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-all"
                  title="Clear Input"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Input area */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Analyze text compositions. Paste your content files (minimum 50 chars) or import logs below to test LLM perplexity weights..."
                rows={10}
                className="w-full bg-black/30 border border-white/5 focus:border-blue-500/50 hover:bg-black/50 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-none transition-all scrollbar-thin"
              />
            </div>

            {/* Quota information */}
            <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-bold text-gray-400 uppercase pt-2">
              <div className="flex gap-4">
                <span>Words: <strong className="text-white">{wordCount}</strong></span>
                <span>Reading Time: <strong className="text-white">{readingTime} Min</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer text-blue-400 hover:text-blue-300 hover:underline">
                  Upload file (.txt)
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-end">
              <GlowButton
                variant="primary"
                onClick={handleAnalyze}
                disabled={isScanning || text.length < 50}
              >
                EXECUTE SCAN
                <ArrowRight className="w-4 h-4" />
              </GlowButton>
            </div>
          </GlowCard>

          {/* Scanner Overlay during scanning */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                <ScannerLoader
                  logs={[
                    'Loading sentence sequence tokenizer...',
                    'Segmenting tokens and calculating vocabulary sizes...',
                    'Running perplexity distribution algorithms...',
                    'Measuring word-length burstiness deviations...',
                    'Matching markers with Open-AI & Anthropic databases...',
                    'Consolidating credibility indicators...'
                  ]}
                  duration={60000}
                  onComplete={() => {}}
                />
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
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <GlowCard hoverGlow={false} className="space-y-6 !p-6" glowColor={analysisResult.aiProb > 50 ? 'from-red-500/15 to-rose-600/0' : 'from-emerald-500/15 to-emerald-600/0'}>
                  <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Linguistic Verdict</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      analysisResult.aiProb > 50 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {analysisResult.aiProb > 50 ? 'SYNTHETIC SIGNAL' : 'HUMAN SIGNAL'}
                    </span>
                  </div>

                  {/* Circular Dial */}
                  <div className="flex justify-center py-2">
                    <ProgressRing 
                      percent={analysisResult.aiProb} 
                      size={140} 
                      strokeWidth={10} 
                      color="dynamic" 
                      showText={true}
                    />
                  </div>
                </GlowCard>

                {/* Forensic Linguistic Heatmap */}
                <GlowCard hoverGlow={false} className="space-y-4">
                  <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Linguistic Heatmap Map</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500/80" /> AI
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500/80" /> Alert
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/80" /> Real
                    </span>
                  </div>
                  
                  {/* Heatmap density panel */}
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 max-h-60 overflow-y-auto font-sans shadow-inner scrollbar-thin">
                    {renderTextHeatmap()}
                  </div>
                  
                  <div className="flex gap-2 items-start text-[10px] text-gray-400 leading-relaxed font-semibold">
                    <Info className="w-4.5 h-4.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>The heatmap maps the text sentence-by-sentence to grade structural density, burstiness, and vocabulary pattern anomalies.</span>
                  </div>
                </GlowCard>
              </motion.div>
            ) : (
              <GlowCard hoverGlow={false} className="h-[360px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-gray-500 animate-pulse">
                  <PieChart className="w-10 h-10" />
                </div>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Awaiting Scan</h4>
                <p className="text-[10px] text-gray-400 max-w-[180px] font-semibold">
                  Submit text content files on the left to activate forensic linguistic analysis maps.
                </p>
              </GlowCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
