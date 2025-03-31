import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if the given path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white fixed h-full">
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">User Management</h1>
        </div>

        <nav className="mt-4 px-2">
          <Link
            to="/dashboard"
            className={`block px-4 py-2 mb-1 rounded ${
              isActive('/dashboard') ? 'bg-blue-900' : 'hover:bg-blue-700'
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/profile"
            className={`block px-4 py-2 mb-1 rounded ${
              isActive('/profile') ? 'bg-blue-900' : 'hover:bg-blue-700'
            }`}
          >
            Profile
          </Link>

          {user?.is_staff && (
            <>
              <Link
                to="/users"
                className={`block px-4 py-2 mb-1 rounded ${
                  isActive('/users') ? 'bg-blue-900' : 'hover:bg-blue-700'
                }`}
              >
                User Management
              </Link>

              <Link
                to="/groups"
                className={`block px-4 py-2 mb-1 rounded ${
                  isActive('/groups') ? 'bg-blue-900' : 'hover:bg-blue-700'
                }`}
              >
                Group Management
              </Link>
            </>
          )}

          <div className="pt-4 mt-4 border-t border-blue-700">
            <h4 className="px-4 py-2 text-sm font-semibold uppercase">System Information</h4>
            <div className="px-4 py-2 text-sm">
              <p>User Status: {user?.is_active ? 'Active' : 'Inactive'}</p>
              <p className="mt-1">Role: {user?.is_staff ? 'Administrator' : 'Regular User'}</p>
              <p className="mt-1">Last Login: {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Top navbar */}
        <header className="bg-white shadow">
          <div className="flex justify-between items-center h-16 px-6">
            <h1 className="text-xl font-semibold text-gray-900">
              {location.pathname === '/dashboard' && 'Dashboard'}
              {location.pathname === '/profile' && 'My Profile'}
              {location.pathname === '/users' && 'User Management'}
              {location.pathname === '/groups' && 'Group Management'}
            </h1>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-6">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} User Management System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;