import axios from 'axios';

// Create API instance with base URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Function to dispatch auth change event
const notifyAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

// Add request interceptor to include JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ensure token format is correct with Bearer prefix
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      console.log('Request with token to:', config.url);
    } else {
      console.log('Request without token to:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle authentication errors (401, 422)
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      console.log('Authentication error, redirecting to login');
      // Only clear storage and redirect for token-related errors, not login failures
      const isLoginEndpoint = error.config && (
        error.config.url.includes('/auth/police/login') || 
        error.config.url.includes('/auth/send-otp') || 
        error.config.url.includes('/auth/verify-otp')
      );
      
      if (!isLoginEndpoint) {
        console.log('Authentication error: clearing token and redirecting');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        notifyAuthChange();
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response Error:', error.request);
      
      // Check if CORS issue
      if (error.message && error.message.includes('Network Error')) {
        console.error('Possible CORS issue or server is down');
      }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/police/login', { email, password });
      if (response.data.token) {
        // Store token and user
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Log the stored token for debugging
        console.log('Token stored successfully');
        
        notifyAuthChange();
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  sendOTP: (phone: string) => 
    api.post('/api/auth/send-otp', { phone }),
  
  verifyOTP: async (phone: string, code: string, name?: string, additional_info?: any) => {
    const response = await api.post('/api/auth/verify-otp', { phone, code, name, additional_info });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      notifyAuthChange();
    }
    return response;
  },
  
  registerVictim: (victimData: any) =>
    api.post('/api/auth/police/register-victim', victimData),
    
  getUser: () => api.get('/api/auth/user'),
  
  logout: () => {
    console.log('Logging out, clearing storage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Ensure the auth-change event is dispatched
    setTimeout(() => {
      notifyAuthChange();
    }, 0);
  },
  
  // Verify if token is valid
  verifyToken: async () => {
    try {
      const response = await api.get('/api/auth/verify-token');
      return response.data.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }
};

// Complaints API calls
export const complaintsAPI = {
  getAll: () => {
    const token = localStorage.getItem('token');
    console.log('Fetching complaints with token');
    return api.get('/api/complaints');
  },
  get: (id: string) => api.get(`/api/complaints/${id}`),
  create: (data: any) => api.post('/api/complaints', data),
  update: (id: string, data: any) => api.patch(`/api/complaints/${id}`, data),
  analyze: (text: string, language: string) => 
    api.post('/api/complaints/analyze', { text, language })
};

// Police API calls
export const policeAPI = {
  getStations: () => api.get('/api/police/stations'),
  getIPCSections: () => api.get('/api/police/ipc-sections'),
  getLegalRights: () => api.get('/api/police/legal-rights')
};

export default api;
