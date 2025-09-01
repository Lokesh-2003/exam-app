import api from './api';

export const register = (username, password) => {
  return api.post('/register', { username, password });
};

export const login = (username, password) => {
  return api.post('/login', { username, password });
};
