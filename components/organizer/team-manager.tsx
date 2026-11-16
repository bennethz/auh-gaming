"use client";

import { useState } from "react";
import { CrownIcon } from "@/components/ui/crown-icon";
import { cn } from "@/lib/cn";
import {
  MAX_PLAYER_NAME_LENGTH,
  MAX_TEAM_NAME_LENGTH,
  PLAYER_CLASS_LABELS,
  type Player,
  type PlayerClass,
  type TeamErrorMap,
  type TeamRosterMap,
} from "@/lib/league/teams";
import type { Team } from "@/lib/league/types";

/** Classes picked per player. The captain has its own row instead. */
const MEMBER_CLASSES = ["S", "A", "B", "C"] as const satisfies readonly PlayerClass[];

/**
 * Field box styles, without width or type. Not the shared INPUT_CLASS_NAME: `cn` only joins classes and
 * can't override its `w-full` or text size, so fixed-width pickers would stretch and squeeze the name fields.
 */
const FIELD =
  "min-h-11 min-w-0 border-2 border-transparent bg-auh-ink-soft px-3 py-2.5 text-auh-cream placeholder:text-auh-cream-dim/70 focus:border-auh-yellow focus:outline-none";

/** Body type for player name fields and the class picker. */
const BODY_TEXT = "font-body text-[15px]";

/** Left edge colour on the class picker, so classes are easy to scan down a roster. */
const CLASS_EDGE_CLASS_NAMES: Record<PlayerClass, string> = {
  Captain: "border-l-auh-yellow",
  S: "border-l-auh-orange",
  A: "border-l-auh-green",
  B: "border-l-auh-cream",
  C: "border-l-auh-cream-dim",
};

const ICON_BUTTON =
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center text-lg font-bold text-auh-cream-dim hover:bg-auh-ink-soft hover:text-auh-orange focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-auh-orange";

interface TeamManagerProps {
  teams: Team[];
  rosters: TeamRosterMap;
  /** Problems that block saving, keyed by team id. */
  errors: TeamErrorMap;
  onRename: (teamId: string, name: string) => void;
  onRosterChange: (teamId: string, roster: Player[]) => void;
}

/**
 * Organizer editor for team names and rosters. Each team has a captain row and any number of players,
 * each in class S, A, B or C. The captain is shown as the team's captain across the site.
 */
export function TeamManager({ teams, rosters, errors, onRename, onRosterChange }: TeamManagerProps) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-2" data-testid="team-manager">
      {teams.map((team, index) => (
        <TeamCard
          key={team.id}
          team={team}
          number={index + 1}
          roster={rosters[team.id] ?? []}
          errors={errors[team.id]}
          onRename={(name) => onRename(team.id, name)}
          onRosterChange={(roster) => onRosterChange(team.id, roster)}
        />
      ))}
    </div>
  );
}

function TeamCard({
  team,
  number,
  roster,
  errors,
  onRename,
  onRosterChange,
}: {
  team: Team;
  number: number;
  roster: Player[];
  errors?: string[];
  onRename: (name: string) => void;
  onRosterChange: (roster: Player[]) => void;
}) {
  const nameInputId = `team-name-${team.id}`;
  const captainInputId = `team-captain-${team.id}`;
  const errorId = `team-errors-${team.id}`;
  const captain = roster.find((player) => player.playerClass === "Captain");
  const members = roster.filter((player) => player.playerClass !== "Captain");
  // The player just added with the button, so its name field takes focus.
  const [newPlayerId, setNewPlayerId] = useState<string>();

  /** Captain first, then the other players in order. */
  const commit = (nextCaptain: Player | undefined, nextMembers: Player[]) =>
    onRosterChange(nextCaptain ? [nextCaptain, ...nextMembers] : nextMembers);

  const setCaptainName = (name: string) => {
    // Clearing the field removes the captain, so an empty captain never blocks saving.
    if (!name) commit(undefined, members);
    else commit({ id: captain?.id ?? `${team.id}-captain`, name, playerClass: "Captain" }, members);
  };

  const updateMember = (playerId: string, changes: Partial<Player>) =>
    commit(
      captain,
      members.map((player) => (player.id === playerId ? { ...player, ...changes } : player)),
    );

  const addMember = () => {
    const id = crypto.randomUUID();
    setNewPlayerId(id);
    commit(captain, [...members, { id, name: "", playerClass: "C" }]);
  };

  return (
    <section
      aria-label={team.name || `Team ${number}`}
      className={cn("notch bg-auh-ink p-4 text-auh-cream sm:p-5", errors && "shadow-[inset_0_0_0_2px_var(--color-auh-orange)]")}
      data-testid={`team-card-${team.id}`}
    >
      <label htmlFor={nameInputId} className="text-xs font-semibold text-auh-cream-dim">
        Team {number} name
      </label>
      <input
        id={nameInputId}
        type="text"
        value={team.name}
        maxLength={MAX_TEAM_NAME_LENGTH}
        onChange={(event) => onRename(event.target.value)}
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        className={cn(FIELD, "mt-1.5 w-full font-display text-[28px] leading-none")}
        data-testid={`team-name-${team.id}`}
      />

      <label
        htmlFor={captainInputId}
        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-auh-cream-dim"
      >
        <CrownIcon className="size-4 text-auh-yellow" />
        Captain
      </label>
      <input
        id={captainInputId}
        type="text"
        value={captain?.name ?? ""}
        placeholder="Enter captain name"
        maxLength={MAX_PLAYER_NAME_LENGTH}
        onChange={(event) => setCaptainName(event.target.value)}
        className={cn(FIELD, BODY_TEXT, "mt-1.5 w-full border-l-4 border-l-auh-yellow")}
        data-testid={`team-captain-${team.id}`}
      />

      <h3 className="mt-4 text-xs font-semibold text-auh-cream-dim">
        Players <span className="tabular-nums">({members.length})</span>
      </h3>

      {members.length === 0 ? (
        <p className="mt-2 text-[13px] text-auh-cream-dim">No players yet.</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {members.map((player, index) => (
            <li
              key={player.id}
              className="flex flex-wrap items-center gap-2"
              data-testid={`player-row-${team.id}-${index}`}
            >
              <input
                type="text"
                value={player.name}
                placeholder="Enter player name"
                autoFocus={player.id === newPlayerId}
                maxLength={MAX_PLAYER_NAME_LENGTH}
                onChange={(event) => updateMember(player.id, { name: event.target.value })}
                aria-label={`Player ${index + 1} name, ${team.name}`}
                className={cn(FIELD, BODY_TEXT, "min-w-[220px] flex-1")}
                data-testid={`player-name-${team.id}-${index}`}
              />
              <select
                value={player.playerClass}
                onChange={(event) => updateMember(player.id, { playerClass: event.target.value as PlayerClass })}
                aria-label={`Player ${index + 1} class, ${team.name}`}
                className={cn(
                  FIELD,
                  BODY_TEXT,
                  "w-[128px] shrink-0 border-l-4 pr-1 pl-3 [&>option]:bg-auh-ink [&>option]:text-auh-cream",
                  CLASS_EDGE_CLASS_NAMES[player.playerClass],
                )}
                data-testid={`player-class-${team.id}-${index}`}
              >
                {MEMBER_CLASSES.map((playerClass) => (
                  <option key={playerClass} value={playerClass}>
                    {PLAYER_CLASS_LABELS[playerClass]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => commit(captain, members.filter((other) => other.id !== player.id))}
                aria-label={`Remove ${player.name || `player ${index + 1}`} from ${team.name}`}
                title="Remove player"
                className={ICON_BUTTON}
                data-testid={`player-remove-${team.id}-${index}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {errors ? (
        <ul id={errorId} role="alert" className="mt-3 flex flex-col gap-1 text-[13px] text-auh-orange">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={addMember}
        className="mt-3 min-h-11 w-full border-2 border-dashed border-auh-ink-soft text-[15px] font-semibold text-auh-yellow hover:border-auh-yellow focus-visible:outline-3 focus-visible:outline-auh-orange"
        data-testid={`player-add-${team.id}`}
      >
        + Add player
      </button>
    </section>
  );
}
