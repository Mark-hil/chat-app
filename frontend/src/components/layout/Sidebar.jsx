import React from 'react';
import { UserCircleIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

function Sidebar({ rooms, currentRoom, onRoomSelect, onCreateRoom, onLogout }) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
            <div>
              <h2 className="text-sm font-semibold">Welcome back!</h2>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Create Room Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateRoom}
          className="w-full flex items-center justify-center space-x-2 btn-primary"
        >
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span>New Chat Room</span>
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto p-2">
        <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Chat Rooms
        </h3>
        <div className="mt-2 space-y-1">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${
                  currentRoom?.id === room.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftIcon className="h-5 w-5" />
                <div className="flex-1 truncate">
                  <span className="block truncate">{room.name}</span>
                  {room.last_message && (
                    <span className="block text-xs text-gray-500 truncate">
                      {room.last_message.content}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
