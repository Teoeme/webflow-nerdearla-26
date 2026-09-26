"use client";

import { useRef } from "react";
import type { Athlete } from "../../db/types";
import { switchAthlete } from "../../session/actions";
import { Select } from "../ui/field";

type AthleteSwitcherProps = {
  athletes: Athlete[];
  currentAthleteId: string;
  label: string;
};

export function AthleteSwitcher({ athletes, currentAthleteId, label }: AthleteSwitcherProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const options = athletes.map((athlete) => ({ value: athlete.id, label: athlete.name }));

  return (
    <form ref={formRef} action={switchAthlete}>
      <label className="flex items-center gap-3">
        <span className="text-label text-text-muted">{label}</span>
        <Select
          key={currentAthleteId}
          name="athleteId"
          options={options}
          defaultValue={currentAthleteId}
          onValueChange={() => formRef.current?.requestSubmit()}
        />
      </label>
    </form>
  );
}
