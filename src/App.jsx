import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/ui/Toast';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/dashboard/Dashboard';
import TextDetector from './pages/detectors/TextDetector';
import ImageDetector from './pages/detectors/ImageDetector';
import AudioDetector from './pages/detectors/AudioDetector';
import VideoDetector from './pages/detectors/VideoDetector';


export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Dashboard Secure Operational Console Nested Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/text" element={<TextDetector />} />
              <Route path="/dashboard/image" element={<ImageDetector />} />
              <Route path="/dashboard/audio" element={<AudioDetector />} />
              <Route path="/dashboard/video" element={<VideoDetector />} />

            </Route>

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}
