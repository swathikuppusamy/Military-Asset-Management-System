import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center">
          <button
            className="text-gray-500 hover:text-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-4 text-xl font-semibold text-gray-800">
            Military Asset Management
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <div className="text-sm text-gray-600">Welcome, {user?.name}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
          <div className="relative">
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;