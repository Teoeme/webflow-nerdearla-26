"use client";

import type { Athlete } from "../../db/types";
import { switchAthlete } from "../../session/actions";

type AthleteSwitcherProps = {
  athletes: Athlete[];
  currentAthleteId: string;
  label: string;
};

export function AthleteSwitcher({ athletes, currentAthleteId, label }: AthleteSwitcherProps) {
  return (
    <form action={switchAthlete}>
      <label>
        {label}
        <select
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
        </select>
      </label>
    </form>
  );
}
