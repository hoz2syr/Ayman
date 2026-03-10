import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Setup from './pages/Setup';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import EngineeringDocs from './pages/EngineeringDocs';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import Contractors from './pages/Contractors';
import Sales from './pages/Sales';
import Settings from './pages/Settings';
import DocViewer from './pages/DocViewer';
import { ToastProvider } from './components/shared/Toast';
import { isCompanySetup, getCompanyInfo } from './utils/storage';

function App() {
  const companyInfo = useMemo(() => getCompanyInfo(), []);
  const needsSetup = useMemo(() => !isCompanySetup(), []);

  if (!companyInfo) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-white">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Setup route - only shown if company not setup */}
          {needsSetup && (
            <Route path="/" element={<Setup />} />
          )}

          {/* Public document viewer - without layout */}
          <Route path="/view/:docType/:docNumber" element={<DocViewer />} />

          {/* Main app routes with Layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/engineering" element={<EngineeringDocs />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/contractors" element={<Contractors />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Redirect to setup or home based on company setup */}
          <Route path="/" element={<Navigate to={needsSetup ? '/' : '/home'} replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
