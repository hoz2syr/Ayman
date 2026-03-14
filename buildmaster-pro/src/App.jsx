import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Login from './pages/Login';
import { ToastProvider } from './components/shared/Toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { isCompanySetup, getCompanyInfo } from './utils/storage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/home'} replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const [companyInfo, setCompanyInfo] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkCompanySetup = async () => {
      try {
        const setup = await isCompanySetup();
        setNeedsSetup(!setup);
        
        if (setup) {
          const info = await getCompanyInfo();
          setCompanyInfo(info);
        }
      } catch (error) {
        console.error('Error checking company setup:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkCompanySetup();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!companyInfo && !needsSetup) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Setup route - only shown if company not setup - NO authentication required */}
      {needsSetup && (
        <Route path="/" element={<Setup />} />
      )}

      {/* Login Route */}
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />

      {/* Public document viewer - without layout */}
      <Route path="/view/:docType/:docNumber" element={<DocViewer />} />

      {/* Main app routes with Layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
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

      {/* Redirect to login, setup or home based on company setup */}
      <Route path="/" element={<Navigate to={needsSetup ? '/' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
