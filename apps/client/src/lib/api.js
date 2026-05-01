import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect if unauthorized
      localStorage.removeItem("token");
      // Keep the UI state in sync with the auth state
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  },
);

export const loginApi = {
  login: (data) => api.post("/login", data),
};

export const blogsApi = {
  create: (data) => api.post("/blogs", data),
  like: (id) => api.post(`/blogs/${id}/likes`),
  getAll: () => api.get("/blogs"),
  getById: (id) => api.get(`/blogs/${id}`),
  update: (id, data) => api.patch(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
  unlike: (id) => api.delete(`/blogs/${id}/likes`),
};

export const usersApi = {
  register: (data) => api.post("/users", data),
  getAll: () => api.get("/users"),
};
