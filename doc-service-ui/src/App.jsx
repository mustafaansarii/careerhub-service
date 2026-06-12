import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';

import PrivateRoute from './components/route-manage/PrivateRoute';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Footer from './components/footer/Footer';
import DocEditor from './pages/DocEditor';
import ResumeBuilder from './pages/ResumeBuilder';
import NotFound from './components/not-found/NotFound';
import authService from './services/auth.service';
import ContactUsPage from './pages/contact-us';
import PricingPage from './pages/pricing';
import DocTemplates from './pages/DocTemplates';
import MyTemplates from './pages/MyTemplates';
import SettingsPage from './pages/SettingsPage';

function App() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/doc-editor') || location.pathname.startsWith('/resume-builder');
  const noFooterPaths = ['/login', '/signup'];
  const hideFooter = isEditor || noFooterPaths.includes(location.pathname);

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    authService.verifyAuth().finally(() => setAuthReady(true));
  }, []);

  if (!authReady) return null;

  return (
    <div className="min-h-screen text-black dark:text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '10px',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/contact-us" element={<ContactUsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/resume-builder" element={<ResumeBuilder />} />
        <Route path="/resume-builder/:code" element={<ResumeBuilder />} />

        <Route
          path="/templates"
          element={
            <PrivateRoute>
              <DocTemplates />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-templates"
          element={
            <PrivateRoute>
              <MyTemplates />
            </PrivateRoute>
          }
        />
        <Route
          path="/doc-editor/:id"
          element={
            <PrivateRoute>
              <DocEditor />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App;
