// store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CinematicProfile, Movie } from '@/types';
import { removeToken, setToken } from '@/lib/api';

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Profile
  profile: CinematicProfile | null;

  // Onboarding
  selectedMovies: Movie[];
  movieRatings: Record<number, number>;

  // UI
  currentMovieId: number | null;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setProfile: (profile: CinematicProfile) => void;
  toggleMovieSelection: (movie: Movie) => void;
  setMovieRating: (movieId: number, rating: number) => void;
  clearOnboarding: () => void;
  setCurrentMovie: (id: number | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      profile: null,
      selectedMovies: [],
      movieRatings: {},
      currentMovieId: null,

      login: (user, token) => {
        setToken(token);
        set({ user, token, isAuthenticated: true });
      },

      logout: () => {
        removeToken();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          profile: null,
          selectedMovies: [],
          movieRatings: {},
        });
      },

      setProfile: (profile) => set({ profile }),

      toggleMovieSelection: (movie) => {
        const { selectedMovies } = get();
        const exists = selectedMovies.find(m => m.id === movie.id);
        if (exists) {
          set({ selectedMovies: selectedMovies.filter(m => m.id !== movie.id) });
        } else if (selectedMovies.length < 20) {
          set({ selectedMovies: [...selectedMovies, movie] });
        }
      },

      setMovieRating: (movieId, rating) => {
        set(state => ({
          movieRatings: { ...state.movieRatings, [movieId]: rating },
        }));
      },

      clearOnboarding: () => set({ selectedMovies: [], movieRatings: {} }),

      setCurrentMovie: (id) => set({ currentMovieId: id }),
    }),
    {
      name: 'cinematch-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
