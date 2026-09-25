CREATE TABLE athletes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT
);

CREATE TABLE events (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  discipline TEXT NOT NULL
    CHECK (discipline IN ('road_running', 'trail_running', 'triathlon', 'cycling', 'swimming'))
);

CREATE TABLE results (
  id TEXT PRIMARY KEY NOT NULL,
  athlete_id TEXT NOT NULL REFERENCES athletes (id),
  event_id TEXT NOT NULL REFERENCES events (id),
  place INTEGER,
  time_seconds INTEGER,
  medal TEXT CHECK (medal IN ('gold', 'silver', 'bronze')),
  distance_km REAL,
  pace_seconds_per_km INTEGER,
  avg_heart_rate INTEGER,
  elevation_m INTEGER,
  UNIQUE (athlete_id, event_id)
);

CREATE TABLE photos (
  id TEXT PRIMARY KEY NOT NULL,
  event_id TEXT NOT NULL REFERENCES events (id),
  owner_id TEXT NOT NULL REFERENCES athletes (id),
  uploader_id TEXT NOT NULL REFERENCES athletes (id),
  storage_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX photos_by_event_and_owner ON photos (event_id, owner_id);

CREATE TABLE transfers (
  id TEXT PRIMARY KEY NOT NULL,
  photo_id TEXT NOT NULL REFERENCES photos (id),
  from_athlete_id TEXT NOT NULL REFERENCES athletes (id),
  to_athlete_id TEXT NOT NULL REFERENCES athletes (id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  resolved_at TEXT
);

-- A photo can have at most one pending transfer.
CREATE UNIQUE INDEX transfers_one_pending_per_photo ON transfers (photo_id)
  WHERE status = 'pending';

CREATE INDEX transfers_by_recipient ON transfers (to_athlete_id, status);
