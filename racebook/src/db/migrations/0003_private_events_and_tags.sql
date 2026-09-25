-- 1. Events get an owner. SQLite can't add NOT NULL here; the code always sets it.
ALTER TABLE events ADD COLUMN owner_id TEXT REFERENCES athletes (id);

-- 2. One private copy of each shared event per athlete who has a result or owns a
--    photo in it. Copy id: '<event id>-<athlete id without the "athlete-" prefix>',
--    e.g. 'event-baires-21k-lucia'.
INSERT INTO events (id, name, date, location, discipline, owner_id)
SELECT e.id || '-' || replace(p.athlete_id, 'athlete-', ''), e.name, e.date, e.location,
       e.discipline, p.athlete_id
FROM events e
JOIN (
  SELECT event_id, athlete_id FROM results
  UNION
  SELECT event_id, owner_id AS athlete_id FROM photos
) p ON p.event_id = e.id
WHERE e.owner_id IS NULL;

-- 3. Point results and photos at their owner's copy.
UPDATE results
SET event_id = event_id || '-' || replace(athlete_id, 'athlete-', '')
WHERE event_id IN (SELECT id FROM events WHERE owner_id IS NULL);

UPDATE photos
SET event_id = event_id || '-' || replace(owner_id, 'athlete-', '')
WHERE event_id IN (SELECT id FROM events WHERE owner_id IS NULL);

-- 4. Drop the shared originals (an event nobody used is dropped too).
DELETE FROM events WHERE owner_id IS NULL;

CREATE INDEX events_by_owner ON events (owner_id, date);

-- 5. Tags: the photo stays with its owner and also appears in the tagged athlete's
--    event. event_id is chosen by the tagged athlete when accepting.
CREATE TABLE photo_tags (
  id TEXT PRIMARY KEY NOT NULL,
  photo_id TEXT NOT NULL REFERENCES photos (id),
  athlete_id TEXT NOT NULL REFERENCES athletes (id),
  tagged_by_id TEXT NOT NULL REFERENCES athletes (id),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  event_id TEXT REFERENCES events (id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  resolved_at TEXT
);

-- An athlete has at most one open (pending or accepted) tag per photo.
CREATE UNIQUE INDEX photo_tags_one_open_per_athlete ON photo_tags (photo_id, athlete_id)
  WHERE status IN ('pending', 'accepted');

CREATE INDEX photo_tags_by_athlete ON photo_tags (athlete_id, status);
CREATE INDEX photo_tags_by_event ON photo_tags (event_id, status);
