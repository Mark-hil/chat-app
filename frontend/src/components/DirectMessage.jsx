import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { fetchWithCsrf } from '../utils/api';
import { WS_BASE_URL, endpoints } from '../config';

function DirectMessage({ recipient }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const currentUser = localStorage.getItem('username');

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end'
    });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await fetchWithCsrf(endpoints.directMessages(recipient.id));
        // Sort messages by timestamp in ascending order (oldest first)
        const sortedMessages = data.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
        setError('');
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    // Connect to WebSocket
    const ws = new WebSocket(`${WS_BASE_URL}${endpoints.websocket.direct(recipient.id)}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setSocket(ws);
      setError('');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          setError(data.error);
        } else if (!data.is_direct_message || 
                  (data.user_id !== recipient.id && data.recipient_id !== recipient.id)) {
          return;
        } else {
          setMessages(prev => [...prev, {
            id: Date.now(),
            content: data.message,
            timestamp: data.timestamp,
            user: {
              id: data.user_id,
              username: data.username
            }
          }]);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        setError('Error processing message');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    fetchMessages();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [recipient.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !currentUser) return;

    try {
      socket.send(JSON.stringify({
        type: 'direct_message',
        message: newMessage.trim(),
        recipient_id: recipient.id
      }));
      setNewMessage('');
      setError('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="fixed top-16 left-80 right-0 bg-white border-b px-6 py-4 shadow-sm z-40">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            recipient.is_online ? 'bg-green-500' : 'bg-gray-300'
          }`} />
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {recipient.username}
            </h2>
            <p className="text-sm text-gray-500">
              {recipient.is_online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 mt-16" style={{ scrollbarWidth: 'thin' }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex animate-fade-in ${message.user.username === currentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${message.user.username === currentUser ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1 px-2">
                    {message.user.username}
                  </span>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${message.user.username === currentUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${message.user.username === currentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {moment(message.timestamp).format('LT')}
                    </p>
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
              placeholder={`Message ${recipient.username}...`}
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
            disabled={!newMessage.trim() || !socket || !currentUser}
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
}

export default DirectMessage;
