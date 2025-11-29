import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/useAuthStore';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ProfilePage from './pages/ProfilePage';
import DashboardLayout from './components/layout/DashboardLayout';
import ChatWindow from './components/chat/ChatWindow';
import DashboardHome from './components/dashboard/DashboardHome';
import LoginAnimation from './components/animations/LoginAnimation';
import LogoutAnimation from './components/animations/LogoutAnimation';

function App() {
  const {
    setSession,
    loading,
    user,
    showLoginAnimation,
    showLogoutAnimation,
    hideLoginAnimation,
    hideLogoutAnimation,
    triggerLoginAnimation,
    isNewUser,
  } = useAuthStore();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Trigger login animation only on actual login, not session restoration
      if (event === 'SIGNED_IN' && session) {
        const hasShownAnimation = sessionStorage.getItem('login_animation_shown');

        if (!hasShownAnimation) {
          sessionStorage.setItem('login_animation_shown', 'true');
          triggerLoginAnimation();
        }
      }

      // Clear flag on logout so animation shows on next login
      if (event === 'SIGNED_OUT') {
        sessionStorage.removeItem('login_animation_shown');
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, triggerLoginAnimation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
          <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}>
            <Route index element={<DashboardHome />} />
            <Route path="chat" element={<ChatWindow />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Animations */}
      <AnimatePresence>
        {showLoginAnimation && (
          <LoginAnimation
            onComplete={hideLoginAnimation}
            username={user?.user_metadata?.name}
            isNewUser={isNewUser}
          />
        )}
        {showLogoutAnimation && (
          <LogoutAnimation onComplete={hideLogoutAnimation} />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
