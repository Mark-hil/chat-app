export const API_BASE_URL = 'http://localhost:8000';
export const WS_BASE_URL = 'ws://localhost:8000';

export const endpoints = {
  login: '/api/login/',
  register: '/api/register/',
  rooms: '/api/rooms/',
  users: '/api/users/',
  messages: (roomId) => `/api/messages/?room=${roomId}`,
  directMessages: (userId) => `/api/messages/direct/${userId}/`,
  websocket: {
    room: (roomId) => `/ws/chat/room/${roomId}/`,
    direct: (userId) => `/ws/chat/direct/${userId}/`
  }
};
