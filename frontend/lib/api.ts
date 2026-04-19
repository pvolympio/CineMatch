// lib/api.ts
// Centralized API client for all backend calls

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// =============================================
// TOKEN MANAGEMENT
// =============================================
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('cinematch_token');
};

export const setToken = (token: string) => {
  localStorage.setItem('cinematch_token', token);
};

export const removeToken = () => {
  localStorage.removeItem('cinematch_token');
  localStorage.removeItem('cinematch_user');
};

// =============================================
// BASE FETCH WRAPPER
// =============================================
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

// =============================================
// AUTH ENDPOINTS
// =============================================
export const auth = {
  register: (email: string, username: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<{ user: any }>('/auth/me'),
};

// =============================================
// MOVIES ENDPOINTS
// =============================================
export const movies = {
  search: (q: string, page = 1) =>
    apiFetch<{ results: any[]; total_results: number }>(`/movies/search?q=${encodeURIComponent(q)}&page=${page}`),

  popular: (page = 1) =>
    apiFetch<{ results: any[] }>(`/movies/popular?page=${page}`),

  trending: () =>
    apiFetch<{ results: any[] }>('/movies/trending'),

  genres: () =>
    apiFetch<{ genres: any[] }>('/movies/genres'),

  details: (id: number) =>
    apiFetch<{ movie: any; user_rating: any }>(`/movies/${id}`),

  similar: (id: number) =>
    apiFetch<{ results: any[] }>(`/movies/${id}/similar`),
};

// =============================================
// RATINGS ENDPOINTS
// =============================================
export const ratings = {
  rate: (data: {
    tmdb_movie_id: number;
    movie_title: string;
    movie_poster?: string;
    rating?: number;
    watched?: boolean;
    watchlist?: boolean;
  }) =>
    apiFetch<{ rating: any }>('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  batch: (ratingsList: any[]) =>
    apiFetch<{ profile: any; ratings_count: number }>('/ratings/batch', {
      method: 'POST',
      body: JSON.stringify({ ratings: ratingsList }),
    }),

  list: (page = 1) =>
    apiFetch<{ ratings: any[]; total: number }>(`/ratings?page=${page}`),

  remove: (movieId: number) =>
    apiFetch<{ success: boolean }>(`/ratings/${movieId}`, { method: 'DELETE' }),
};

// =============================================
// PROFILE ENDPOINTS
// =============================================
export const profile = {
  get: () =>
    apiFetch<{ profile: any; onboarding_needed?: boolean }>('/profile'),

  compute: () =>
    apiFetch<{ profile: any }>('/profile/compute', { method: 'POST' }),

  recommendations: (limit = 12) =>
    apiFetch<{ recommendations: any[] }>(`/profile/recommendations?limit=${limit}`),

  graph: (movieId: number) =>
    apiFetch<{ nodes: any[]; edges: any[]; center_movie: any }>(`/profile/graph/${movieId}`),

  stats: () =>
    apiFetch<{ stats: any }>('/profile/stats'),
};
