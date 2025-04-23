import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { WS_BASE_URL, endpoints } from '../config';
import { fetchWithCsrf } from '../utils/api';

const ChatRoom = ({ user, room }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  const fetchMessages = async () => {
    if (!room) return;
    
    try {
      const response = await fetchWithCsrf(endpoints.messages(room.id));
      // Sort messages by timestamp in ascending order (oldest first)
      const sortedMessages = response.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.message || 'Failed to fetch messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!room) return null;

    const ws = new WebSocket(`${WS_BASE_URL}${endpoints.websocket.room(room.id)}`);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
      setError('');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          console.error('WebSocket error:', data.error);
          setError(data.error);
          return;
        }
        if (data.type === 'connection_established') {
          console.log(data.message);
          setError('');
          return;
        }
        // Add a check to prevent duplicate messages
        setMessages((prevMessages) => {
          // Check if message with same content and timestamp already exists
          const isDuplicate = prevMessages.some(
            msg => msg.content === data.message && 
                  msg.user.username === data.user_id &&
                  Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000
          );
          if (isDuplicate) return prevMessages;

          const newMessage = {
            id: Date.now(),
            content: data.message,
            user: { username: data.user_id },
            timestamp: data.timestamp || new Date().toISOString()
          };

          // Add new message and sort by timestamp
          const updatedMessages = [...prevMessages, newMessage].sort((a, b) => 
            new Date(a.timestamp) - new Date(b.timestamp)
          );

          return updatedMessages;
        });
        scrollToBottom();
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Attempting to reconnect...');
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setTimeout(() => {
        if (room) {
          const newWs = connectWebSocket();
          if (newWs) setSocket(newWs);
        }
      }, 3000);
    };

    return ws;
  };

  useEffect(() => {
    if (!user?.username) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    if (room) {
      fetchMessages();
      const ws = connectWebSocket();
      if (ws) setSocket(ws);

      // Scroll to bottom without animation when loading initial messages
      scrollToBottom(false);

      return () => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    }
  }, [room, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.username) {
      setError('User not authenticated');
      return;
    }

    if (!newMessage.trim() || !socket || socket.readyState !== WebSocket.OPEN) {
      setError('Connection not ready. Please try again.');
      return;
    }

    try {
      const messageData = {
        message: newMessage.trim(),
        user_id: user.username,
        room_id: room.id
      };
      socket.send(JSON.stringify(messageData));
      setNewMessage('');
      setError('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (!user?.username) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        Please log in to access the chat room
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Select a chat room to start messaging
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="fixed top-16 left-80 right-0 bg-white border-b px-6 py-4 shadow-sm z-40">
        <h2 className="text-xl font-semibold text-gray-800">{room.name}</h2>
        {room.description && (
          <p className="text-sm text-gray-600 mt-1">{room.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 mt-16" style={{ scrollbarWidth: 'thin' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex animate-fade-in ${
                message.user.username === user?.username ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex flex-col ${
                message.user.username === user?.username ? 'items-end' : 'items-start'
              }`}>
                <span className="text-xs text-gray-500 mb-1 px-2">
                  {message.user.username}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.user.username === user?.username
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className="text-xs opacity-75 mt-1">
                    {moment(message.timestamp).fromNow()}
                  </div>
                </div>
              </div>
            </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="mx-6 mb-4">
          <div className="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg border-t">
        <div className="max-w-screen-xl mx-auto flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-gray-300 text-gray-700 transition-colors duration-200"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim() || !socket || !user?.username}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 w-24 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
