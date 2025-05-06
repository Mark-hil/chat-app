import React, { useState, useEffect } from 'react';
import { fetchWithCsrf } from '../utils/api';
import { API_BASE_URL, endpoints } from '../config';
import ChatRoom from './ChatRoom';

function RoomList() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchRooms = async () => {
    try {
      const data = await fetchWithCsrf(endpoints.rooms);
      setRooms(data);
      setError('');
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load chat rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await fetchWithCsrf(endpoints.rooms, {
        method: 'POST',
        body: JSON.stringify({
          name: newRoomName.trim(),
          description: newRoomDescription.trim()
        })
      });

      setRooms([...rooms, response]);
      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateForm(false);
      setError('');
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex flex-col bg-white shadow-lg">
        <div className="fixed w-80 z-40 top-16 bg-white">
          <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-2xl font-bold text-white mb-2">Chat Rooms</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full py-2 px-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>New Room</span>
            </button>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <p>No rooms available</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 hover:bg-gray-100 ${
                      selectedRoom?.id === room.id
                        ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="font-medium">{room.name}</div>
                        {room.description && (
                          <div className="text-xs text-gray-500 truncate">
                            {room.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
              <form onSubmit={handleCreateRoom}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                      Room Name
                    </label>
                    <input
                      type="text"
                      id="roomName"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      id="roomDescription"
                      value={newRoomDescription}
                      onChange={(e) => setNewRoomDescription(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Chat Room Content */}
      <div className="flex-1">
        {selectedRoom ? (
          <ChatRoom room={selectedRoom} user={{ username: localStorage.getItem('username') }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <h3 className="text-xl font-medium mb-2">Chat Rooms</h3>
            <p>Select a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomList;
