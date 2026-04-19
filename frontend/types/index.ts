// types/index.ts
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_url: string | null;
  backdrop_url: string | null;
  release_date: string;
  release_year: number;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  genres: Genre[];
  runtime?: number;
  director?: Director;
  cast?: CastMember[];
  keywords?: string[];
  similar?: Movie[];
  tagline?: string;
  recommendation_score?: number;
  reason?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Director {
  id: number;
  name: string;
  profile_url: string | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_url: string | null;
}

export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  onboarding_completed?: boolean;
  total_movies_rated?: number;
}

export interface UserRating {
  id: number;
  tmdb_movie_id: number;
  movie_title: string;
  movie_poster: string;
  rating: number;
  watched: boolean;
  watchlist: boolean;
  created_at: string;
}

export interface GenreWeight {
  id: number;
  name: string;
  weight: number;
  percentage: number;
}

export interface PersonalityType {
  name: string;
  icon: string;
  desc: string;
}

export interface NarrativeProfile {
  complex: number;
  emotional: number;
  action_driven: number;
  lighthearted: number;
}

export interface StyleProfile {
  sci_fi: number;
  drama: number;
  action: number;
  comedy: number;
  thriller: number;
  horror: number;
  animation: number;
  documentary: number;
}

export interface CinematicProfile {
  user: {
    username: string;
    email: string;
    member_since: string;
  };
  top_genres: GenreWeight[];
  narrative_profile: NarrativeProfile;
  style_profile: StyleProfile;
  avg_rating_given: number;
  total_movies_rated: number;
  onboarding_completed: boolean;
  personality: PersonalityType | null;
  computed_at: string;
}

export interface GraphNode {
  id: number;
  title: string;
  poster_url: string | null;
  vote_average: number;
  genres: Genre[];
  is_center: boolean;
  group: string;
}

export interface GraphEdge {
  source: number;
  target: number;
  label: string;
  strength: number;
}

export interface MovieGraph {
  center_movie: Movie;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
