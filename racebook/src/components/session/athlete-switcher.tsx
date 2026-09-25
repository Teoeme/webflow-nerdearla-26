"use client";

import type { Athlete } from "../../db/types";
import { switchAthlete } from "../../session/actions";
import { Select } from "../ui/field";

type AthleteSwitcherProps = {
  athletes: Athlete[];
  currentAthleteId: string;
  label: string;
};

export function AthleteSwitcher({ athletes, currentAthleteId, label }: AthleteSwitcherProps) {
  return (
    <form action={switchAthlete}>
      <label className="flex items-center gap-3">
        <span className="text-label text-text-muted">{label}</span>
        <Select
          key={currentAthleteId}
          name="athleteId"
          defaultValue={currentAthleteId}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        >
          {athletes.map((athlete) => (
            <option key={athlete.id} value={athlete.id}>
              {athlete.name}
            </option>
          ))}
        </Select>
      </label>
    </form>
  );
}
