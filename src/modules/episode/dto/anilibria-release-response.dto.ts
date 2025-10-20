export interface AniLibriaReleaseResponse {
  id: number;
  type: {
    value: string;
    description: string;
  };
  year: number;
  name: {
    main: string;
    english: string;
    alternative: string;
  };
  alias: string;
  season: {
    value: string;
    description: string;
  };
  poster: {
    preview: string;
    thumbnail: string;
    optimized: {
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
  notification: string;
  episodes_total: number;
  external_player: string;
  is_in_production: boolean;
  is_blocked_by_geo: boolean;
  is_blocked_by_copyrights: boolean;
  added_in_users_favorites: number;
  average_duration_of_episode: number;
  added_in_planned_collection: number;
  added_in_watched_collection: number;
  added_in_watching_collection: number;
  added_in_postponed_collection: number;
  added_in_abandoned_collection: number;
  genres: Array<{
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
    total_releases: number;
  }>;
  members: Array<{
    id: string;
    role: {
      value: string;
      description: string;
    };
    user: {
      id: number;
      avatar: {
        preview: string;
        thumbnail: string;
        optimized: {
          preview: string;
          thumbnail: string;
        };
      };
    };
    nickname: string;
  }>;
  episodes: Array<{
    id: string;
    name: string;
    ordinal: number;
    ending: {
      start: number;
      stop: number;
    };
    opening: {
      start: number;
      stop: number;
    };
    preview: {
      preview: string;
      thumbnail: string;
      optimized: {
        preview: string;
        thumbnail: string;
      };
    };
    hls_480: string;
    hls_720: string;
    hls_1080: string;
    duration: number;
    rutube_id: string;
    youtube_id: string;
    updated_at: string;
    sort_order: number;
    release_id: number;
    name_english: string;
  }>;
  torrents: Array<{
    id: number;
    hash: string;
    size: number;
    type: {
      value: string;
      description: string;
    };
    color: {
      value: string;
      description: string;
    };
    codec: {
      value: string;
      label: string;
      description: string;
      label_color: string;
      label_is_visible: boolean;
    };
    label: string;
    quality: {
      value: string;
      description: string;
    };
    magnet: string;
    filename: string;
    seeders: number;
    bitrate: number;
    leechers: number;
    sort_order: number;
    updated_at: string;
    is_hardsub: boolean;
    description: string;
    created_at: string;
    completed_times: number;
  }>;
  sponsor?: {
    id: string;
    title: string;
    description: string;
    url_title: string;
    url: string;
  };
}
