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
    return <Navigate to="/login" state={{ from: location }} replace />;
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

function LoginWrapper({ onRegisterClick }) {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    navigate('/rooms');
  };

  return (
    <AuthLayout 
      title="Welcome back!"
      subtitle="Sign in to continue to Chat App"
    >
      <Login 
        onLoginSuccess={handleLoginSuccess}
        onRegisterClick={onRegisterClick}
      />
    </AuthLayout>
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  
  const handleRegisterSuccess = () => {
    navigate('/login');
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
  const [showRegister, setShowRegister] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <LoginWrapper onRegisterClick={() => setShowRegister(true)} />
        } />
        <Route path="/register" element={<RegisterWrapper />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="h-screen overflow-hidden">
              <ChatHeader />
              <div className="flex-1 bg-gray-50 pt-16">
                <Routes>
                  <Route path="/rooms" element={<RoomList />} />
                  <Route path="/direct-messages" element={<UserList />} />
                  <Route path="/" element={<Navigate to="/rooms" replace />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
