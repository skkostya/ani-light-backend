// Типы для данных из AniLibria API

export interface AniLibriaApiResponse<T> {
  data: T[];
  meta: {
    total_releases: number;
  };
}

export interface AniLibriaAnime {
  id: number;
  type: {
    value: string;
    description: string;
  };
  year: number;
  name: {
    main: string;
    english: string;
    alternative: string | null;
  };
  alias: string;
  season: {
    value: string;
    description: string;
  };
  poster: {
    src: string;
    preview: string;
    thumbnail: string;
    optimized: {
      src: string;
      preview: string;
      thumbnail: string;
    };
  };
  fresh_at: string;
  created_at: string;
  updated_at: string;
  is_ongoing: boolean;
  age_rating: {
    value: string;
    label: string;
    is_adult: boolean;
    description: string;
  };
  publish_day: {
    value: number;
    description: string;
  };
  description: string;
  notification: string | null;
  episodes_total: number | null;
  external_player: string | null;
  is_in_production: boolean;
  is_blocked_by_geo: boolean;
  is_blocked_by_copyrights: boolean;
  added_in_users_favorites: number;
  average_duration_of_episode: number | null;
  added_in_planned_collection: number;
  added_in_watched_collection: number;
  added_in_watching_collection: number;
  added_in_postponed_collection: number;
  added_in_abandoned_collection: number;
  genres: AniLibriaGenre[];
}

export interface AniLibriaGenre {
  id: number;
  name: string;
  image: {
    preview: string;
    thumbnail: string;
    optimized: {
      preview: string;
      thumbnail: string;
    };
  };
}

export interface AniLibriaEpisode {
  ordinal: number;
  sort_order: number;
  hls_1080: string | null;
  hls_720: string | null;
  hls_480: string | null;
}

export interface AniLibriaEpisodeResponse {
  episodes: AniLibriaEpisode[];
}
