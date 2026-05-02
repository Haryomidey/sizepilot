import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AICommandPage from './pages/AICommandPage';
import CompressImagePage from './pages/CompressImagePage';
import CompressVideoPage from './pages/CompressVideoPage';
import CompressPDFPage from './pages/CompressPDFPage';
import BatchPage from './pages/BatchPage';
import CheckerPage from './pages/CheckerPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import ConvertPage from './pages/ConvertPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* App Routes with MainLayout */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="ai-command" element={<AICommandPage />} />
                <Route path="compress-image" element={<CompressImagePage />} />
                <Route path="compress-video" element={<CompressVideoPage />} />
                <Route path="compress-pdf" element={<CompressPDFPage />} />
                <Route path="convert" element={<ConvertPage />} />
                <Route path="batch" element={<BatchPage />} />
                <Route path="checker" element={<CheckerPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="settings" element={<SettingsPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}