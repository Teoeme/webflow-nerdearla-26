INSERT INTO athletes (id, name, avatar_url) VALUES
  ('athlete-lucia', 'Lucía Fernández', NULL),
  ('athlete-tomas', 'Tomás Ibarra', NULL),
  ('athlete-sofia', 'Sofía Gómez', NULL);

INSERT INTO events (id, name, date, location, discipline) VALUES
  ('event-baires-21k', 'Medio Maratón de Buenos Aires', '2026-08-23', 'Buenos Aires', 'road_running'),
  ('event-costanera-10k', 'Carrera Costanera 10K', '2026-06-14', 'Buenos Aires', 'road_running'),
  ('event-patagonia-run', 'Patagonia Run', '2026-04-11', 'San Martín de los Andes', 'trail_running'),
  ('event-baires-42k', 'Maratón de Buenos Aires', '2025-09-21', 'Buenos Aires', 'road_running');

INSERT INTO results (id, athlete_id, event_id, place, time_seconds, medal, distance_km, pace_seconds_per_km, avg_heart_rate, elevation_m) VALUES
  ('result-lucia-baires-21k', 'athlete-lucia', 'event-baires-21k', 2, 5567, 'silver', 21.1, 264, 162, 38),
  ('result-lucia-costanera-10k', 'athlete-lucia', 'event-costanera-10k', 1, 2650, 'gold', 10.0, 265, 171, 12),
  ('result-lucia-baires-42k', 'athlete-lucia', 'event-baires-42k', 14, 12065, NULL, 42.2, 286, 158, 64),
  ('result-tomas-baires-21k', 'athlete-tomas', 'event-baires-21k', 37, 6090, NULL, 21.1, 289, 165, 38),
  ('result-tomas-costanera-10k', 'athlete-tomas', 'event-costanera-10k', 9, 2875, NULL, 10.0, 288, 168, 12),
  ('result-tomas-patagonia-run', 'athlete-tomas', 'event-patagonia-run', 3, 22360, 'bronze', 42.0, 532, 148, 2250),
  ('result-sofia-baires-21k', 'athlete-sofia', 'event-baires-21k', 5, 5882, NULL, 21.1, 279, 160, 38),
  ('result-sofia-patagonia-run', 'athlete-sofia', 'event-patagonia-run', 1, 10700, 'gold', 21.0, 510, 156, 1150),
  ('result-sofia-baires-42k', 'athlete-sofia', 'event-baires-42k', 22, 12948, NULL, 42.2, 307, 155, 64);
