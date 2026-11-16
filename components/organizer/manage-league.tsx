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
import {
  getSeededTeams,
  type PlayoffEntryMap,
  type PlayoffMatchEntry,
  type PlayoffSeeds,
  resolvePlayoffs,
  savePlayoffEntry,
} from "@/lib/league/playoffs";
import {
  buildStandings,
  FORMAT_RULES,
  type PointDeductionMap,
  POINTS_PER_DEFAULT_WIN,
  POINTS_PER_DRAW,
  POINTS_PER_WIN,
  swapTiebreakOrder,
  type TiebreakOrder,
} from "@/lib/league/standings";
import { applyRosterCaptains, type TeamRosterMap, validateTeams, withCaptainFallback } from "@/lib/league/teams";
import type { PlayoffFormat, Team } from "@/lib/league/types";
import { GroupStageMatrix } from "./group-stage-matrix";
import { PlayoffEditor } from "./playoff-editor";
import { TeamManager } from "./team-manager";
import { TiebreakPanel } from "./tiebreak-panel";

type ManageView = "group-stage" | "playoffs" | "teams";

const VIEW_OPTIONS: ReadonlyArray<ChipOption<ManageView>> = [
  { value: "group-stage", label: "Group Stage" },
  { value: "playoffs", label: "Playoffs" },
  { value: "teams", label: "Teams" },
];

interface ManageLeagueProps {
  seasonNumber: number;
  /** Teams as stored, used to start and to reset the team editor. */
  initialTeams: Team[];
  /** Team rosters as stored, keyed by team id. */
  initialRosters: TeamRosterMap;
  playoffFormat: PlayoffFormat;
  /** Group stage results as stored, used to start and to reset the grid. */
  initialResults: GroupResultMap;
  /** Playoff scores and dates as stored, used to start and to reset the bracket. */
  initialPlayoffEntries: PlayoffEntryMap;
  /** Point deductions as stored, keyed by team id. */
  initialDeductions: PointDeductionMap;
  /** Manual order for teams level on points, as stored. */
  initialTiebreakOrder: TiebreakOrder;
  /** Seeds frozen when the playoffs were last generated, as stored. Empty if never generated. */
  initialPlayoffSeeds: PlayoffSeeds;
}

/**
 * Organizer screen: group stage results grid and the playoff bracket editor, with page actions.
 * Saving writes to Supabase through the `saveLeague` Server Action.
 */
export function ManageLeague({
  seasonNumber,
  initialTeams,
  initialRosters,
  playoffFormat,
  initialResults,
  initialPlayoffEntries,
  initialDeductions,
  initialTiebreakOrder,
  initialPlayoffSeeds,
}: ManageLeagueProps) {
  const [view, setView] = useState<ManageView>("group-stage");
  const [teamNames, setTeamNames] = useState<Team[]>(initialTeams);
  // Teams saved before rosters existed start with their stored captain as a Captain-class player.
  const [startingRosters] = useState(() => withCaptainFallback(initialTeams, initialRosters));
  const [rosters, setRosters] = useState<TeamRosterMap>(startingRosters);
  const [results, setResults] = useState<GroupResultMap>(initialResults);
  const [playoffEntries, setPlayoffEntries] = useState<PlayoffEntryMap>(initialPlayoffEntries);
  const [deductions, setDeductions] = useState<PointDeductionMap>(initialDeductions);
  const [tiebreakOrder, setTiebreakOrder] = useState<TiebreakOrder>(initialTiebreakOrder);
  const [playoffSeeds, setPlayoffSeeds] = useState<PlayoffSeeds>(initialPlayoffSeeds);
  // What's stored: the props at first, then whatever was last saved successfully.
  const [saved, setSaved] = useState({
    teamNames: initialTeams,
    rosters: startingRosters,
    results: initialResults,
    playoffEntries: initialPlayoffEntries,
    deductions: initialDeductions,
    tiebreakOrder: initialTiebreakOrder,
    playoffSeeds: initialPlayoffSeeds,
  });
  const [isSaving, startSaving] = useTransition();
  const { message, showToast } = useToast();
  const generateDialogRef = useRef<HTMLDialogElement>(null);

  // Teams with edited names and captains taken from the rosters, used everywhere on this screen.
  const teams = useMemo(() => applyRosterCaptains(teamNames, rosters), [teamNames, rosters]);
  const teamErrors = useMemo(() => validateTeams(teamNames, rosters), [teamNames, rosters]);
  const teamErrorCount = Object.keys(teamErrors).length;

  const totalSeries = getTotalSeriesCount(teams.length);
  const playedSeries = getPlayedSeriesCount(results);
  const seriesLeft = totalSeries - playedSeries;
  const hasChanges =
    teamNames !== saved.teamNames ||
    rosters !== saved.rosters ||
    results !== saved.results ||
    playoffEntries !== saved.playoffEntries ||
    deductions !== saved.deductions ||
    tiebreakOrder !== saved.tiebreakOrder ||
    playoffSeeds !== saved.playoffSeeds;

  const standings = useMemo(
    () => buildStandings(buildGroupRecords(teams, results), teams, playoffFormat, deductions, tiebreakOrder),
    [teams, results, playoffFormat, deductions, tiebreakOrder],
  );
  const bracketStructure = useMemo(() => buildPlayoffBrackets(playoffFormat), [playoffFormat]);
  const isGenerated = playoffSeeds.length > 0;
  // Once generated, seeds stay frozen; before that the bracket previews the live standings.
  // Winners and losers follow the entered playoff scores.
  const seededTeams = useMemo(
    () => (isGenerated ? getSeededTeams(playoffSeeds, teams) : standings.map((row) => row.team)),
    [isGenerated, playoffSeeds, teams, standings],
  );
  const resolvedBrackets = useMemo(
    () => resolvePlayoffs(bracketStructure, seededTeams, playoffEntries),
    [bracketStructure, seededTeams, playoffEntries],
  );
  /** True when the live standings no longer match the frozen seeds. */
  const standingsChangedSinceGenerate =
    isGenerated && standings.some((row, index) => playoffSeeds[index] !== row.team.id);

  const handleSavePlayoffMatch = (matchId: string, entry: PlayoffMatchEntry) => {
    setPlayoffEntries((current) => savePlayoffEntry(bracketStructure, current, matchId, entry));
  };

  /** Matches with a score or date entered: what generating would clear. */
  const filledPlayoffMatches = Object.values(playoffEntries).filter(
    (entry) => entry.scoreA !== undefined || entry.scoreB !== undefined || entry.matchDate,
  ).length;

  /**
   * Clears every playoff score and date and freezes the seeds from the current group stage table,
   * even if some series are still missing. Saved with Save changes.
   */
  const handleGeneratePlayoffs = () => {
    setPlayoffEntries({});
    setPlayoffSeeds(standings.map((row) => row.team.id));
    generateDialogRef.current?.close();
    setView("playoffs");
    showToast("Playoffs generated from the current standings. Save changes to publish.");
  };

  const handleUndo = () => {
    setTeamNames(saved.teamNames);
    setRosters(saved.rosters);
    setResults(saved.results);
    setPlayoffEntries(saved.playoffEntries);
    setDeductions(saved.deductions);
    setTiebreakOrder(saved.tiebreakOrder);
    setPlayoffSeeds(saved.playoffSeeds);
  };

  const handleSave = () => {
    if (teamErrorCount > 0) {
      setView("teams");
      showToast(`Fix the ${teamErrorCount === 1 ? "team" : `${teamErrorCount} teams`} marked in orange before saving.`);
      return;
    }
    startSaving(async () => {
      const result = await saveLeague({
        teams,
        rosters,
        groupResults: results,
        deductions,
        tiebreakOrder,
        playoffEntries,
        playoffSeeds,
      });
      if (!result.ok) {
        showToast(`Saving failed: ${result.error}`);
        return;
      }
      setSaved({ teamNames, rosters, results, playoffEntries, deductions, tiebreakOrder, playoffSeeds });
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

        <TiebreakPanel
          rows={standings}
          onSwap={(teamId, neighbourId) =>
            setTiebreakOrder((current) => swapTiebreakOrder(current, teams, teamId, neighbourId))
          }
        />
      </section>

      <section hidden={view !== "playoffs"} aria-labelledby="playoffs-title" data-testid="playoffs-editor">
        <div className="mb-5">
          <h2 id="playoffs-title" className="font-display text-[40px] leading-[0.9] font-semibold">
            Playoffs
          </h2>
          <p className="mt-1.5 text-[15px] text-auh-olive">
            Double elimination. {FORMAT_RULES[playoffFormat].summary}{" "}
            {isGenerated
              ? "Seeds were locked from the group stage table when the playoffs were generated."
              : "Preview: seeds follow the live group stage table until you generate the playoffs."}
          </p>
          <p className="mt-1 text-[13px] text-auh-olive">
            Click a match to set its score and date. Winners move on automatically.
          </p>
          {standingsChangedSinceGenerate ? (
            <p className="mt-1 text-[13px] text-auh-orange" data-testid="seeds-locked-note">
              The group stage table has changed since the playoffs were generated. Seeds stay as they are; generate
              again to re-seed (this clears playoff scores).
            </p>
          ) : null}
        </div>
        <PlayoffEditor brackets={resolvedBrackets} onSave={handleSavePlayoffMatch} />
      </section>

      <section hidden={view !== "teams"} aria-labelledby="teams-title" data-testid="teams-editor">
        <div className="mb-5">
          <h2 id="teams-title" className="font-display text-[40px] leading-[0.9] font-semibold">
            Teams
          </h2>
          <p className="mt-1.5 text-[15px] text-auh-olive">
            Rename teams, set each team’s captain and add players in class S, A, B or C.
          </p>
          <p className="mt-1 text-[13px] text-auh-olive">The captain is shown with a crown across the site.</p>
        </div>
        <TeamManager
          teams={teamNames}
          rosters={rosters}
          errors={teamErrors}
          onRename={(teamId, name) =>
            setTeamNames((current) => current.map((team) => (team.id === teamId ? { ...team, name } : team)))
          }
          onRosterChange={(teamId, roster) => setRosters((current) => ({ ...current, [teamId]: roster }))}
        />
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
        <p>Seeds are locked from the current rankings and won’t move if group stage results change later.</p>
        {seriesLeft > 0 ? (
          <p className="text-auh-orange" data-testid="generate-playoffs-warning">
            {seriesLeft} group stage {seriesLeft === 1 ? "series is" : "series are"} still missing. The playoffs will
            use the rankings as they stand now.
          </p>
        ) : null}
        <p className="text-[13px] text-auh-cream-dim">Nothing is published until you save changes.</p>
      </ConfirmDialog>

      <Toast message={message} />
    </>
  );
}
