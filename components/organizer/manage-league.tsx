"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { Toast, useToast } from "@/components/ui/toast";
import { buildPlayoffBrackets } from "@/lib/league/bracket";
import {
  buildGroupRecords,
  getPlayedSeriesCount,
  getTotalSeriesCount,
  type GroupResultMap,
  setSeriesScore,
} from "@/lib/league/group-stage";
import { type PlayoffEntryMap, type PlayoffMatchEntry, resolvePlayoffs, savePlayoffEntry } from "@/lib/league/playoffs";
import { buildStandings, FORMAT_RULES, POINTS_PER_DRAW, POINTS_PER_WIN } from "@/lib/league/standings";
import type { PlayoffFormat, Team } from "@/lib/league/types";
import { GroupStageMatrix } from "./group-stage-matrix";
import { PlayoffEditor } from "./playoff-editor";

type ManageView = "group-stage" | "playoffs";

const VIEW_OPTIONS: ReadonlyArray<ChipOption<ManageView>> = [
  { value: "group-stage", label: "Group Stage" },
  { value: "playoffs", label: "Playoffs" },
];

interface ManageLeagueProps {
  seasonNumber: number;
  teams: Team[];
  playoffFormat: PlayoffFormat;
  /** Group stage results as stored, used to start and to reset the grid. */
  initialResults: GroupResultMap;
  /** Playoff scores and dates as stored, used to start and to reset the bracket. */
  initialPlayoffEntries: PlayoffEntryMap;
}

/**
 * Organizer screen: group stage results grid and the playoff bracket editor, with page actions.
 * TODO: Save results through a Server Action once data is persisted.
 */
export function ManageLeague({
  seasonNumber,
  teams,
  playoffFormat,
  initialResults,
  initialPlayoffEntries,
}: ManageLeagueProps) {
  const [view, setView] = useState<ManageView>("group-stage");
  const [results, setResults] = useState<GroupResultMap>(initialResults);
  const [playoffEntries, setPlayoffEntries] = useState<PlayoffEntryMap>(initialPlayoffEntries);
  const { message, showToast } = useToast();

  const totalSeries = getTotalSeriesCount(teams.length);
  const playedSeries = getPlayedSeriesCount(results);
  const seriesLeft = totalSeries - playedSeries;
  const hasChanges = results !== initialResults || playoffEntries !== initialPlayoffEntries;

  const bracketStructure = useMemo(() => buildPlayoffBrackets(playoffFormat), [playoffFormat]);
  // Seeds follow the group stage grid; winners and losers follow the entered playoff scores.
  const resolvedBrackets = useMemo(() => {
    const seededTeams = buildStandings(buildGroupRecords(teams, results), teams, playoffFormat).map((row) => row.team);
    return resolvePlayoffs(bracketStructure, seededTeams, playoffEntries);
  }, [teams, results, playoffFormat, bracketStructure, playoffEntries]);

  const handleSavePlayoffMatch = (matchId: string, entry: PlayoffMatchEntry) => {
    setPlayoffEntries((current) => savePlayoffEntry(bracketStructure, current, matchId, entry));
  };

  const handleUndo = () => {
    setResults(initialResults);
    setPlayoffEntries(initialPlayoffEntries);
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(48px,6vw,72px)] leading-[0.88] font-semibold">
            Manage Season {seasonNumber}
          </h1>
          <p className="mt-2 text-base text-auh-olive">Enter group stage results. Standings update automatically.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" disabled={!hasChanges} onClick={handleUndo} data-testid="reset-changes">
            Undo changes
          </Button>
          <Button
            variant="primary"
            disabled={!hasChanges}
            onClick={() => showToast("Changes checked. Saving isn’t connected yet, so the public pages won’t change.")}
            data-testid="save-changes"
          >
            Save changes
          </Button>
          <Button
            variant="dark"
            disabled={seriesLeft > 0}
            onClick={() => showToast("Generating playoffs isn’t available yet.")}
            data-testid="generate-playoffs-button"
          >
            Generate playoffs ({seriesLeft} series left)
          </Button>
        </div>
      </div>

      <ChipGroup
        label="Manage view"
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
        className="mb-6"
        data-testid="manage-view"
      />

      <section hidden={view !== "group-stage"} aria-labelledby="group-stage-title" data-testid="group-stage-editor">
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="group-stage-title" className="font-display text-[40px] leading-[0.9] font-semibold">
              Group stage results
            </h2>
            <p className="mt-1.5 text-[15px] text-auh-olive">
              Scores are from the row team’s side. 2-0 = {POINTS_PER_WIN} pts, 1-1 = {POINTS_PER_DRAW} pt, 0-2 = 0.
            </p>
            <p className="mt-1 text-[13px] text-auh-olive">Click a cell, or type 2, 1, 0 or Delete.</p>
          </div>
          <p className="text-[15px] font-semibold tabular-nums" data-testid="series-progress">
            {playedSeries} of {totalSeries} series entered
          </p>
        </div>

        <GroupStageMatrix
          teams={teams}
          results={results}
          onChange={(teamId, opponentId, score) =>
            setResults((current) => setSeriesScore(current, teamId, opponentId, score))
          }
        />
      </section>

      <section hidden={view !== "playoffs"} aria-labelledby="playoffs-title" data-testid="playoffs-editor">
        <div className="mb-5">
          <h2 id="playoffs-title" className="font-display text-[40px] leading-[0.9] font-semibold">
            Playoffs
          </h2>
          <p className="mt-1.5 text-[15px] text-auh-olive">
            Double elimination. {FORMAT_RULES[playoffFormat].summary} Seeds follow the group stage table.
          </p>
          <p className="mt-1 text-[13px] text-auh-olive">
            Click a match to set its score and date. Winners move on automatically.
          </p>
        </div>
        <PlayoffEditor brackets={resolvedBrackets} onSave={handleSavePlayoffMatch} />
      </section>

      <Toast message={message} />
    </>
  );
}
