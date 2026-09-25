export type Discipline = "road_running" | "trail_running" | "triathlon" | "cycling" | "swimming";
export type Medal = "gold" | "silver" | "bronze";
export type TransferStatus = "pending" | "accepted" | "rejected";

export type Athlete = { id: string; name: string; avatarUrl: string | null };

export type RaceEvent = {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  location: string;
  discipline: Discipline;
};

export type RaceResult = {
  id: string;
  athleteId: string;
  eventId: string;
  place: number | null;
  timeSeconds: number | null;
  medal: Medal | null;
  distanceKm: number | null;
  paceSecondsPerKm: number | null;
  avgHeartRate: number | null;
  elevationM: number | null;
};

export type Photo = {
  id: string;
  eventId: string;
  ownerId: string;
  uploaderId: string;
  storageKey: string;
  createdAt: string;
};

export type Transfer = {
  id: string;
  photoId: string;
  fromAthleteId: string;
  toAthleteId: string;
  status: TransferStatus;
  createdAt: string;
  resolvedAt: string | null;
};
