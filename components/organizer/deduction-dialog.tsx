"use client";

import { type FormEvent, type Ref, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, INPUT_CLASS_NAME } from "@/components/ui/form-panel";
import type { PointDeduction, Team } from "@/lib/league/types";

const MAX_DEDUCTION = 99;

interface DeductionDialogProps {
  ref: Ref<HTMLDialogElement>;
  team?: Team;
  /** The team's current deduction, if any. */
  deduction?: PointDeduction;
  /** Changes every time the dialog is opened, so the form starts from the saved values. */
  sessionKey: string;
  /** Called with the new deduction, or undefined to remove it. */
  onSave: (deduction: PointDeduction | undefined) => void;
}

/**
 * Modal for taking points off a team's group stage total. Opened by clicking the team's points.
 */
export function DeductionDialog({ ref, team, deduction, sessionKey, onSave }: DeductionDialogProps) {
  return (
    <dialog
      ref={ref}
      aria-labelledby="deduction-dialog-title"
      className="notch m-auto w-[calc(100%-32px)] max-w-[440px] bg-auh-ink p-0 text-auh-cream backdrop:bg-auh-ink/70"
      data-testid="deduction-dialog"
    >
      {team ? <DeductionForm key={sessionKey} team={team} deduction={deduction} onSave={onSave} /> : null}
    </dialog>
  );
}

function DeductionForm({
  team,
  deduction,
  onSave,
}: {
  team: Team;
  deduction?: PointDeduction;
  onSave: (deduction: PointDeduction | undefined) => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const points = Number(formData.get("points"));

    if (!Number.isInteger(points) || points < 1 || points > MAX_DEDUCTION) {
      setError(`Enter a whole number of points from 1 to ${MAX_DEDUCTION}.`);
      return;
    }
    onSave({ points });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
      <div>
        <h2 id="deduction-dialog-title" className="font-display text-[32px] leading-none text-auh-yellow">
          Deduct points
        </h2>
        <p className="mt-1.5 text-[15px] font-semibold">{team.name}</p>
        <p className="text-[13px] text-auh-cream-dim">Captain: {team.captain}</p>
      </div>

      <Field label="Points to deduct">
        <input
          type="number"
          name="points"
          min={1}
          max={MAX_DEDUCTION}
          step={1}
          inputMode="numeric"
          defaultValue={deduction?.points}
          autoFocus
          aria-invalid={error ? true : undefined}
          className={INPUT_CLASS_NAME}
          data-testid="deduction-points-input"
        />
      </Field>

      {error ? (
        <p role="alert" className="text-[13px] text-auh-orange" data-testid="deduction-error">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          disabled={!deduction}
          onClick={() => onSave(undefined)}
          className="min-h-11 px-1 text-[15px] font-semibold text-auh-orange underline disabled:cursor-not-allowed disabled:opacity-40"
          data-testid="deduction-remove"
        >
          Remove deduction
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={(event) => event.currentTarget.closest("dialog")?.close()}
            className="min-h-11 border-2 border-auh-cream-dim px-4 font-display text-xl leading-none focus-visible:outline-3 focus-visible:outline-auh-orange"
            data-testid="deduction-cancel"
          >
            Cancel
          </button>
          <Button type="submit" variant="primary" data-testid="deduction-save">
            Save
          </Button>
        </div>
      </div>
    </form>
  );
}
