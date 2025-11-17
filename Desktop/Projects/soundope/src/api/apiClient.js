// New API client to replace Base44
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else if (options.body) {
      config.body = options.body;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Get error message from response
        const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        
        // Handle 401 (Unauthorized)
        if (response.status === 401) {
          // For /auth/me, return null (user not logged in)
          if (endpoint.includes('/auth/me')) {
            return null;
          }
          // For other auth endpoints (login, register), throw error
          if (endpoint.includes('/auth/')) {
            throw new Error(error.message || 'Authentication failed');
          }
          // For other endpoints, clear invalid token and return null
          this.setToken(null);
          return null;
        }
        
        throw new Error(error.message || `Request failed with status ${response.status}`);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth methods (replaces base44.auth.*)
  auth = {
    me: async () => {
      return this.request('/auth/me');
    },
    login: async (email, password) => {
      try {
        const data = await this.request('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        if (data && data.token) {
          this.setToken(data.token);
          return data;
        }
        // If no token, it's a failed login
        throw new Error(data?.message || 'Login failed');
      } catch (error) {
        // Re-throw with better error message
        if (error.message) {
          throw error;
        }
        throw new Error('Invalid email or password');
      }
    },
    logout: () => {
      this.setToken(null);
      window.location.href = '/';
    },
    register: async (email, password, fullName) => {
      const data = await this.request('/auth/register', {
        method: 'POST',
        body: { email, password, fullName },
      });
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    },
    updateMe: async (updates) => {
      return this.request('/auth/me', {
        method: 'PATCH',
        body: updates,
      });
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
    },
    isAuthenticated: async () => {
      if (!this.token) return false;
      try {
        await this.auth.me();
        return true;
      } catch {
        return false;
      }
    },
  };

  // Entity methods (replaces base44.entities.*)
  entities = {
    Track: {
      list: async (sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        const queryString = params.toString();
        return this.request(`/tracks${queryString ? `?${queryString}` : ''}`);
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            // Convert boolean to string explicitly
            if (typeof value === 'boolean') {
              params.append(key, value.toString());
            } else {
              params.append(key, value);
            }
          }
        });
        return this.request(`/tracks?${params.toString()}`);
      },
      get: async (id) => {
        return this.request(`/tracks/${id}`);
      },
      create: async (data) => {
        return this.request('/tracks', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/tracks/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
      delete: async (id) => {
        return this.request(`/tracks/${id}`, {
          method: 'DELETE',
        });
      },
    },
    Feedback: {
      list: async (sort = null) => {
        const params = sort ? `?sort=${sort}` : '';
        return this.request(`/feedback${params}`);
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/feedback?${params.toString()}`);
      },
      create: async (data) => {
        return this.request('/feedback', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/feedback/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
      delete: async (id) => {
        return this.request(`/feedback/${id}`, {
          method: 'DELETE',
        });
      },
    },
    CuratorSubmission: {
      list: async (sort = null) => {
        const params = sort ? `?sort=${sort}` : '';
        return this.request(`/curator-submissions${params}`);
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/curator-submissions?${params.toString()}`);
      },
      create: async (data) => {
        return this.request('/curator-submissions', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/curator-submissions/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
      delete: async (id) => {
        return this.request(`/curator-submissions/${id}`, {
          method: 'DELETE',
        });
      },
    },
    Comment: {
      list: async (sort = null) => {
        const params = sort ? `?sort=${sort}` : '';
        return this.request(`/comments${params}`);
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/comments?${params.toString()}`);
      },
      create: async (data) => {
        return this.request('/comments', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/comments/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
      delete: async (id) => {
        return this.request(`/comments/${id}`, {
          method: 'DELETE',
        });
      },
    },
    User: {
      list: async (sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        const query = params.toString();
        return this.request(`/users${query ? `?${query}` : ''}`);
      },
      get: async (id) => {
        return this.request(`/users/${id}`);
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/users?${params.toString()}`);
      },
    },
    Vote: {
      list: async () => {
        return this.request('/votes');
      },
      create: async (data) => {
        return this.request('/votes', {
          method: 'POST',
          body: data,
        });
      },
      delete: async (id) => {
        return this.request(`/votes/${id}`, {
          method: 'DELETE',
        });
      },
    },
    Notification: {
      list: async () => {
        return this.request('/notifications');
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/notifications?${params.toString()}`);
      },
      create: async (data) => {
        return this.request('/notifications', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/notifications/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
      delete: async (id) => {
        return this.request(`/notifications/${id}`, {
          method: 'DELETE',
        });
      },
    },
    Report: {
      list: async (sort = null) => {
        const params = sort ? `?sort=${sort}` : '';
        return this.request(`/reports${params}`);
      },
      filter: async (filters = {}, sort = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/reports?${params.toString()}`);
      },
      create: async (data) => {
        return this.request('/reports', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/reports/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
    },
    PlaylistSubmission: {
      list: async (sort = null) => {
        const params = sort ? `?sort=${sort}` : '';
        return this.request(`/playlist-submissions${params}`);
      },
      filter: async (filters = {}, sort = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/playlist-submissions?${params.toString()}`);
      },
      update: async (id, data) => {
        return this.request(`/playlist-submissions/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
      create: async (data) => {
        return this.request('/playlist-submissions', {
          method: 'POST',
          body: data,
        });
      },
    },
    Message: {
      list: async () => {
        return this.request('/messages');
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/messages?${params.toString()}`);
      },
      create: async (data) => {
        return this.request('/messages', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/messages/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
    },
    CollabRequest: {
      list: async () => {
        return this.request('/collab-requests');
      },
      create: async (data) => {
        return this.request('/collab-requests', {
          method: 'POST',
          body: data,
        });
      },
      update: async (id, data) => {
        return this.request(`/collab-requests/${id}`, {
          method: 'PATCH',
          body: data,
        });
      },
    },
    Boost: {
      create: async (data) => {
        return this.request('/boosts', {
          method: 'POST',
          body: data,
        });
      },
    },
    ArchiveLog: {
      create: async (data) => {
        return this.request('/archive-logs', {
          method: 'POST',
          body: data,
        });
      },
      filter: async (filters = {}, sort = null, limit = null) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (limit) params.append('limit', limit);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, value);
          }
        });
        return this.request(`/archive-logs?${params.toString()}`);
      },
    },
    Block: {
      create: async (data) => {
        return this.request('/blocks', {
          method: 'POST',
          body: data,
        });
      },
      delete: async (id) => {
        return this.request(`/blocks/${id}`, {
          method: 'DELETE',
        });
      },
    },
    TrackClaim: {
      filter: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === 'object' && value.$in) {
              value.$in.forEach(v => params.append(key, v));
            } else {
              params.append(key, value);
            }
          }
        });
        return this.request(`/track-claims?${params.toString()}`);
      },
    },
    ModeratorView: {
      list: async () => {
        return this.request('/moderator-views');
      },
    },
    SupporterUnlock: {
      create: async (data) => {
        return this.request('/supporter-unlocks', {
          method: 'POST',
          body: data,
        });
      },
    },
  };

  // File upload (replaces base44.integrations.Core.UploadFile)
  uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  };

  // Functions (replaces base44.functions.invoke)
  functions = {
    invoke: async (functionName, data = {}) => {
      return this.request(`/functions/${functionName}`, {
        method: 'POST',
        body: data,
      });
    },
    stripeCheckout: async (data) => {
      return this.request('/functions/stripe-checkout', {
        method: 'POST',
        body: data,
      });
    },
    cyaniteAnalyze: async (data) => {
      return this.request('/functions/cyanite-analyze', {
        method: 'POST',
        body: data,
      });
    },
    generateSocialPreview: async (data) => {
      return this.request('/functions/generate-social-preview', {
        method: 'POST',
        body: data,
      });
    },
    spotifyPlaylist: async (data) => {
      return this.request('/functions/spotify-playlist', {
        method: 'POST',
        body: data,
      });
    },
    validateDevPassword: async (data) => {
      return this.request('/functions/validate-dev-password', {
        method: 'POST',
        body: data,
      });
    },
  };
}

export const api = new ApiClient();

// Export as default for backward compatibility during migration
export default api;

