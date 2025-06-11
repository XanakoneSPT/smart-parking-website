// src/services/api.js
import axios from 'axios';

// Make sure this URL matches your backend server
export const API_URL = 'http://localhost:8000/';

// Add authorization header to requests
const getHeaders = () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  console.log('Current auth token:', token);
  return {
    Authorization: token ? `Bearer ${token}` : '',
  };
};

// Add axios interceptor to handle token expiration
const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error);
      // Handle 401 Unauthorized errors
      if (error.response && error.response.status === 401) {
        console.log('Phát hiện truy cập không được ủy quyền, đang xóa dữ liệu xác thực');
        // Clear auth data on token expiration
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        sessionStorage.removeItem('user_info');
        
        // Redirect to login page
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Initialize interceptors
setupAxiosInterceptors();

console.log('API Service initialized with URL:', API_URL);

export const apiService = {
  get: (endpoint, config = {}) => axios.get(`${API_URL}${endpoint}`, { 
    headers: getHeaders(),
    ...config 
  }),
  post: (endpoint, data) => axios.post(`${API_URL}${endpoint}`, data, { headers: getHeaders() }),
  put: (endpoint, data) => axios.put(`${API_URL}${endpoint}`, data, { headers: getHeaders() }),
  delete: (endpoint) => axios.delete(`${API_URL}${endpoint}`, { headers: getHeaders() }),
  
  // Login method based on the backend implementation
  login: async (username, password) => {
    console.log('Đang đăng nhập với tài khoản:', { username });
    
    try {
      // Check if attempting to log in as admin (frontend only allows admin login)
      if (!username.toLowerCase().startsWith('qtv')) {
        return Promise.reject({
          response: {
            status: 403,
            data: { error: 'Truy cập bị từ chối. Chỉ tài khoản quản trị viên được phép đăng nhập.' }
          }
        });
      }
      
      const response = await axios.post(`${API_URL}api_login/`, {
        ma_sv: username,     // Backend uses ma_sv parameter for both admins and students
        password: password
      });
      
      // Check if login was successful and user is admin
      if (response.status === 200) {
        const data = response.data;
        
        // Verify that the user is an admin
        if (data.user_type !== 'admin') {
          return Promise.reject({
            response: {
              status: 403,
              data: { error: 'Truy cập bị từ chối. Chỉ tài khoản quản trị viên được phép đăng nhập.' }
            }
          });
        }
        
        // Format user data for the auth context
        const userData = {
          username: data.user_info.ma_qtv,
          fullName: data.user_info.ho_ten,
          role: data.user_info.vai_tro,
          is_admin: true
        };
        
        // Generate a token with timestamp
        const token = `admin_session_${Date.now()}`;
        
        return {
          data: {
            message: data.message,
            user: userData,
            token: token
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  }
};