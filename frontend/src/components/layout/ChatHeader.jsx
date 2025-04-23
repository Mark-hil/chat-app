import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UsersIcon, ChatBubbleLeftRightIcon, ChatBubbleOvalLeftIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

function ChatHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const isActive = (path) => {
    return location.pathname.startsWith(path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50';
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="fixed top-0 left-0 right-0 border-b border-gray-200 bg-white shadow-sm z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo and App Name */}
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center group">
              <ChatBubbleOvalLeftIcon className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="ml-2 text-xl font-bold text-gray-900">Chat App</span>
            </Link>
            <nav className="flex space-x-8">
              <Link
                to="/rooms"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/rooms')}`}
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1.5" />
                Rooms
              </Link>
              <Link
                to="/direct-messages"
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive('/direct-messages')}`}
              >
                <UsersIcon className="h-5 w-5 mr-1.5" />
                Direct Messages
              </Link>
            </nav>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {username?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
