import React, { useState, useEffect } from 'react';
import { fetchWithCsrf } from '../utils/api';
import { API_BASE_URL, endpoints } from '../config';
import DirectMessage from './DirectMessage';

function UserList() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = localStorage.getItem('username');

  const fetchUsers = async () => {
    try {
      const data = await fetchWithCsrf(endpoints.users);
      setUsers(data.filter(user => user.username !== currentUser));
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // Poll for online status every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* User List Sidebar */}
      <div className="w-80 flex flex-col bg-white shadow-lg">
        <div className="fixed w-80 z-40 top-16 bg-white">
          <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700">
            <h1 className="text-2xl font-bold text-white mb-2">Direct Messages</h1>
            <p className="text-purple-100 text-sm">
              {isLoading ? 'Loading users...' : `${users.length} users available`}
            </p>
          </div>
        </div>

        <div className="mt-24">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="overflow-y-auto h-[calc(100vh-11rem)]">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p>No other users available</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-100 ${
                      selectedUser?.id === user.id
                        ? 'bg-purple-50 text-purple-700 font-medium shadow-sm'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        user.is_online ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-gray-500">
                          {user.is_online ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}            
          </div>
        </div>
      </div>

      {/* Direct Message Content */}
      <div className="flex-1">
        {selectedUser ? (
          <DirectMessage recipient={selectedUser} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <h3 className="text-xl font-medium mb-2">Direct Messages</h3>
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserList;
