import React, { createContext, useContext, useState, useMemo } from 'react';

const AppContext = createContext(null);

const initialHistory = [
  { id: 'scan-1', name: 'FYP_Project_Draft.docx', type: 'text', result: 'AI Generated', score: 87, date: '2026-05-28 11:24', size: '45 KB', details: 'Contains high occurrences of GPT-4 writing patterns.' },
  { id: 'scan-2', name: 'CEO_Profile_Photo.png', type: 'image', result: 'Human Content', score: 14, date: '2026-05-27 15:40', size: '2.4 MB', details: 'Exif signatures and noise pattern maps match standard Sony sensor.' },
  { id: 'scan-3', name: 'audio_voicemail_leak.wav', type: 'audio', result: 'AI Generated', score: 92, date: '2026-05-26 09:15', size: '8.1 MB', details: 'Voice cloning characteristics detected in higher harmonics.' },
  { id: 'scan-4', name: 'politician_speech_leak.mp4', type: 'video', result: 'AI Generated', score: 98, date: '2026-05-25 18:02', size: '42.0 MB', details: 'Facial blending discrepancies and frame jitter indicate deepfake.' },
  { id: 'scan-5', name: 'blog_post_crypto.txt', type: 'text', result: 'Human Content', score: 8, date: '2026-05-24 14:10', size: '12 KB', details: 'Natural sentence length distribution and burstiness levels.' },
  { id: 'scan-6', name: 'synthetic_landscape.jpg', type: 'image', result: 'AI Generated', score: 89, date: '2026-05-23 10:33', size: '1.8 MB', details: 'Diffusion pattern characteristics identified in background elements.' }
];

const initialNotifications = [
  { id: 1, message: 'Deepfake analysis report ready for politician_speech_leak.mp4', type: 'alert', time: '10 mins ago', read: false },
  { id: 2, message: 'Your API rate limit is at 65% capacity.', type: 'info', time: '2 hours ago', read: false },
  { id: 3, message: 'Security password changed successfully.', type: 'security', time: '1 day ago', read: true },
  { id: 4, message: 'Welcome to AI Content Detection System v1.0!', type: 'success', time: '2 days ago', read: true }
];

export function AppProvider({ children }) {
  const [history, setHistory] = useState(initialHistory);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [user, setUser] = useState({
    name: 'Alex Mercer',
    email: 'alex.mercer@cyberdyne.io',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'Security Analyst',
    plan: 'Premium Enterprise',
    scansLeft: 480,
    maxScans: 500
  });
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Add scan to database live
  const addScan = (name, type, score, details = '') => {
    const result = score > 50 ? 'AI Generated' : 'Human Content';
    const newScan = {
      id: `scan-${Date.now()}`,
      name,
      type,
      result,
      score,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      size: `${(Math.random() * 5 + 0.1).toFixed(1)} MB`,
      details: details || `Analysis completed with confidence rate of ${score}%.`
    };
    setHistory((prev) => [newScan, ...prev]);
    
    // Add dynamic notification
    const newNotif = {
      id: Date.now(),
      message: `Completed scan for ${name}. Result: ${result} (${score}%)`,
      type: score > 50 ? 'alert' : 'success',
      time: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
    
    // Deduct limit
    setUser(prev => ({
      ...prev,
      scansLeft: Math.max(0, prev.scansLeft - 1)
    }));

    return newScan;
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Dashboard Stats calculated dynamically
  const stats = useMemo(() => {
    const total = history.length;
    const aiCount = history.filter(item => item.result === 'AI Generated').length;
    const humanCount = total - aiCount;
    const aiPercent = total > 0 ? Math.round((aiCount / total) * 100) : 0;
    
    return {
      totalScans: total,
      aiDetected: aiCount,
      humanContent: humanCount,
      aiPercent,
      accuracyRate: 99.8 // Mock system rating
    };
  }, [history]);

  return (
    <AppContext.Provider value={{
      history,
      addScan,
      clearHistory,
      notifications,
      markAllNotificationsRead,
      clearNotifications,
      user,
      setUser,
      isDarkMode,
      setIsDarkMode,
      stats
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
