import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import RoomList from './components/RoomList';
import UserList from './components/UserList';
import ChatHeader from './components/layout/ChatHeader';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('username');
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}

// Auth Layout component
function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{title}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginWrapper() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLoginSuccess = () => {
    navigate('/rooms');
  };

  return (
    <AuthLayout 
      title="Welcome back!"
      subtitle="Sign in to continue to Chat App"
      key={location.pathname}
    >
      <Login 
        onLoginSuccess={handleLoginSuccess}
        key="login-form"
      />
    </AuthLayout>
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  
  const handleRegisterSuccess = () => {
    navigate('/');
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Join Chat App today"
    >
      <Register onRegisterSuccess={handleRegisterSuccess} />
    </AuthLayout>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Clear any stale cache on app load
      localStorage.removeItem('vite-app-cache');
      setIsLoading(false);
    };
    checkAuth();

    // Clear cache when component mounts
    if (import.meta.hot) {
      import.meta.hot.dispose(() => {
        localStorage.removeItem('vite-app-cache');
      });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginWrapper />} />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <div className="h-screen overflow-hidden">
                <ChatHeader />
                <div className="flex-1 bg-gray-50 pt-16">
                  <RoomList />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/direct-messages"
          element={
            <ProtectedRoute>
              <div className="h-screen overflow-hidden">
                <ChatHeader />
                <div className="flex-1 bg-gray-50 pt-16">
                  <UserList />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
