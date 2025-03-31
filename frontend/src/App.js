import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import UserManagement from './pages/UserManagement';
import GroupManagement from './pages/GroupManagement';
import Profile from './pages/Profile';

const App = () => {
  const { isAuthenticated, user } = useAuth();

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    if (adminOnly && !user?.is_staff) {
      return <Navigate to="/dashboard" />;
    }

    return children;
  };

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* App routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Admin routes */}
        <Route 
          path="/users" 
          element={
            <ProtectedRoute adminOnly>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/groups" 
          element={
            <ProtectedRoute adminOnly>
              <GroupManagement />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Not found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;