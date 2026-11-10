"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { saveLeague } from "@/app/(organizer)/league/manage/actions";
import { Button } from "@/components/ui/button";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
import {
  buildStandings,
  FORMAT_RULES,
  type PointDeductionMap,
  POINTS_PER_DEFAULT_WIN,
  POINTS_PER_DRAW,
  POINTS_PER_WIN,
} from "@/lib/league/standings";
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
  /** Point deductions as stored, keyed by team id. */
  initialDeductions: PointDeductionMap;
}

/**
 * Organizer screen: group stage results grid and the playoff bracket editor, with page actions.
 * Saving writes to Supabase through the `saveLeague` Server Action.
 */
export function ManageLeague({
  seasonNumber,
  teams,
  playoffFormat,
  initialResults,
  initialPlayoffEntries,
  initialDeductions,
}: ManageLeagueProps) {
  const [view, setView] = useState<ManageView>("group-stage");
  const [results, setResults] = useState<GroupResultMap>(initialResults);
  const [playoffEntries, setPlayoffEntries] = useState<PlayoffEntryMap>(initialPlayoffEntries);
  const [deductions, setDeductions] = useState<PointDeductionMap>(initialDeductions);
  // What's stored: the props at first, then whatever was last saved successfully.
  const [saved, setSaved] = useState({
    results: initialResults,
    playoffEntries: initialPlayoffEntries,
    deductions: initialDeductions,
  });
  const [isSaving, startSaving] = useTransition();
  const { message, showToast } = useToast();
  const generateDialogRef = useRef<HTMLDialogElement>(null);

  const totalSeries = getTotalSeriesCount(teams.length);
  const playedSeries = getPlayedSeriesCount(results);
  const seriesLeft = totalSeries - playedSeries;
  const hasChanges =
    results !== saved.results || playoffEntries !== saved.playoffEntries || deductions !== saved.deductions;

  const bracketStructure = useMemo(() => buildPlayoffBrackets(playoffFormat), [playoffFormat]);
  // Seeds follow the group stage grid; winners and losers follow the entered playoff scores.
  const resolvedBrackets = useMemo(() => {
    const seededTeams = buildStandings(buildGroupRecords(teams, results), teams, playoffFormat, deductions).map(
      (row) => row.team,
    );
    return resolvePlayoffs(bracketStructure, seededTeams, playoffEntries);
  }, [teams, results, playoffFormat, deductions, bracketStructure, playoffEntries]);

  const handleSavePlayoffMatch = (matchId: string, entry: PlayoffMatchEntry) => {
    setPlayoffEntries((current) => savePlayoffEntry(bracketStructure, current, matchId, entry));
  };

  /** Matches with a score or date entered: what generating would clear. */
  const filledPlayoffMatches = Object.values(playoffEntries).filter(
    (entry) => entry.scoreA !== undefined || entry.scoreB !== undefined || entry.matchDate,
  ).length;

  /** Clears every playoff score and date. Seeds come from the current group stage table. Saved with Save changes. */
  const handleGeneratePlayoffs = () => {
    setPlayoffEntries({});
    generateDialogRef.current?.close();
    setView("playoffs");
    showToast("Playoffs generated from the current standings. Save changes to publish.");
  };

  const handleUndo = () => {
    setResults(saved.results);
    setPlayoffEntries(saved.playoffEntries);
    setDeductions(saved.deductions);
  };

  const handleSave = () => {
    startSaving(async () => {
      const result = await saveLeague({ groupResults: results, deductions, playoffEntries });
      if (!result.ok) {
        showToast(`Saving failed: ${result.error}`);
        return;
      }
      setSaved({ results, playoffEntries, deductions });
      showToast("Saved. Public pages are updated.");
    });
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
          <Button variant="ghost" disabled={!hasChanges || isSaving} onClick={handleUndo} data-testid="reset-changes">
            Undo changes
          </Button>
          <Button variant="primary" disabled={!hasChanges || isSaving} onClick={handleSave} data-testid="save-changes">
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
          <Button
            variant="dark"
            disabled={isSaving}
            onClick={() => generateDialogRef.current?.showModal()}
            data-testid="generate-playoffs-button"
          >
            Generate playoffs
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
              Scores are from the row team’s side. 2-0 = {POINTS_PER_WIN} pts, default win (DW) ={" "}
              {POINTS_PER_DEFAULT_WIN} pts, 1-1 = {POINTS_PER_DRAW} pt, 0-2 or DL = 0.
            </p>
            <p className="mt-1 text-[13px] text-auh-olive">
              Click a cell, or type 2, 1, 0, W, L or Delete. Click a team’s points to deduct.
            </p>
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
          deductions={deductions}
          onDeductionChange={(teamId, deduction) =>
            setDeductions((current) => {
              const next = { ...current };
              if (deduction) next[teamId] = deduction;
              else delete next[teamId];
              return next;
            })
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

      <ConfirmDialog
        ref={generateDialogRef}
        title="Generate playoffs?"
        confirmLabel="Clear and generate"
        onConfirm={handleGeneratePlayoffs}
        data-testid="generate-playoffs-dialog"
      >
        <p>
          This clears all current playoff scores and dates
          {filledPlayoffMatches > 0
            ? ` (${filledPlayoffMatches} ${filledPlayoffMatches === 1 ? "match" : "matches"})`
            : ""}{" "}
          and seeds the bracket from the current group stage table.
        </p>
        {seriesLeft > 0 ? (
          <p className="text-auh-orange" data-testid="generate-playoffs-warning">
            {seriesLeft} group stage {seriesLeft === 1 ? "series is" : "series are"} still missing, so seeds may change.
          </p>
        ) : null}
        <p className="text-[13px] text-auh-cream-dim">Nothing is published until you save changes.</p>
      </ConfirmDialog>

      <Toast message={message} />
    </>
  );
}
