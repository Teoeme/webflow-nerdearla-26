-- Optional cover photo for an event, shown on the medal board and the event's hero header.
-- Must belong to the event's owner and to that same event: enforced in code
-- (setEventCover in src/db/events.ts), not by a foreign key constraint alone.
ALTER TABLE events ADD COLUMN cover_photo_id TEXT REFERENCES photos (id);
