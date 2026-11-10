"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { buildGroupRecords, type GroupResultMap, getSeriesScore } from "@/lib/league/group-stage";
import {
  getPoints,
  type PointDeductionMap,
  POINTS_PER_DEFAULT_WIN,
  POINTS_PER_DRAW,
  POINTS_PER_WIN,
} from "@/lib/league/standings";
import type { PointDeduction, SeriesScore, Team } from "@/lib/league/types";
import { DeductionDialog } from "./deduction-dialog";
import { ScoreDialog } from "./score-dialog";

const SCORE_CELL_CLASS_NAMES: Record<SeriesScore, string> = {
  "2-0": "bg-auh-yellow/20 text-auh-yellow",
  "1-1": "bg-auh-cream/10 text-auh-cream",
  "0-2": "bg-auh-orange/15 text-auh-orange",
  DW: "bg-auh-yellow/10 text-auh-yellow italic",
  DL: "bg-auh-orange/10 text-auh-orange italic",
};

const SCORE_LABELS: Record<SeriesScore, string> = {
  "2-0": `2-0 win, ${POINTS_PER_WIN} pts`,
  "1-1": `1-1 draw, ${POINTS_PER_DRAW} pt`,
  "0-2": "0-2 loss, 0 pts",
  DW: `default win, ${POINTS_PER_DEFAULT_WIN} pts`,
  DL: "default loss, 0 pts",
};

/** Keys that set a score directly: 2 / 1 / 0 for played scores, W / L for a default win / loss. */
const KEY_TO_SCORE: Record<string, SeriesScore> = {
  "2": "2-0",
  "1": "1-1",
  "0": "0-2",
  w: "DW",
  W: "DW",
  l: "DL",
  L: "DL",
};

const ARROW_STEPS: Record<string, [rowStep: number, columnStep: number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

const TOTAL_COLUMNS = [
  { label: "S", title: "Series played" },
  { label: "W", title: "Wins, including default wins" },
  { label: "D", title: "Draws" },
  { label: "L", title: "Losses, including default losses" },
  { label: "Pts", title: "Points, after any deduction. Click to deduct points" },
] as const;

const HEADER_CELL =
  "sticky top-0 z-[2] border-b border-l border-auh-ink-soft bg-auh-ink px-1.5 py-2 text-xs font-semibold text-auh-cream-dim";
const BODY_CELL = "border-b border-l border-auh-ink-soft";
/** First column stays in view while the grid scrolls sideways. */
const STICKY_COLUMN = "sticky left-0 z-[1] bg-auh-ink";
/** Tint for the row and column under the pointer or keyboard focus. */
const CROSSHAIR = "bg-auh-ink-soft";

interface GroupStageMatrixProps {
  teams: Team[];
  results: GroupResultMap;
  /**
   * Called when a cell changes. `score` is from `teamId`'s point of view; undefined clears the series.
   * Leave out for a read-only grid (public pages): no editing and no totals columns.
   */
  onChange?: (teamId: string, opponentId: string, score: SeriesScore | undefined) => void;
  /** Point deductions keyed by team id, shown in the totals. */
  deductions?: PointDeductionMap;
  /** Called when a team's deduction is set or removed. */
  onDeductionChange?: (teamId: string, deduction: PointDeduction | undefined) => void;
}

/**
 * Round robin grid of group stage results: editable for organizers, read-only on public pages.
 * Each row is read from the row team's point of view; setting a cell also fills its mirror
 * (Alpha vs Bravo "2-0" shows as Bravo vs Alpha "0-2"). Totals on the right update live.
 *
 * Rows and columns are numbered by team; click a cell (or press Enter) to open a score dialog
 * with both teams' names and captains. Shortcuts: 2 / 1 / 0 set 2-0 / 1-1 / 0-2, W / L set a default
 * win / loss, Delete clears, arrow keys move between cells. Clicking a team's points opens a point deduction dialog. The row and column of the active cell are highlighted.
 */
export function GroupStageMatrix({
  teams,
  results,
  onChange,
  deductions = {},
  onDeductionChange,
}: GroupStageMatrixProps) {
  const isReadOnly = !onChange;
  const records = new Map(buildGroupRecords(teams, results).map((record) => [record.teamId, record]));
  const [activeCell, setActiveCell] = useState<{ row: number; column: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; column: number } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const deductionDialogRef = useRef<HTMLDialogElement>(null);
  const [deductionTarget, setDeductionTarget] = useState<{ team: Team; openCount: number } | null>(null);

  const openDeductionDialog = (team: Team) => {
    setDeductionTarget((current) => ({ team, openCount: (current?.openCount ?? 0) + 1 }));
    deductionDialogRef.current?.showModal();
  };

  const openScoreDialog = (row: number, column: number) => {
    setEditingCell({ row, column });
    dialogRef.current?.showModal();
  };

  const focusCell = (row: number, column: number) => {
    tableRef.current?.querySelector<HTMLButtonElement>(`[data-cell="${row}-${column}"]`)?.focus();
  };

  const handleCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>, row: number, column: number) => {
    const rowTeam = teams[row];
    const columnTeam = teams[column];

    if (!onChange) return;
    if (event.key in KEY_TO_SCORE) {
      event.preventDefault();
      onChange(rowTeam.id, columnTeam.id, KEY_TO_SCORE[event.key]);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      onChange(rowTeam.id, columnTeam.id, undefined);
      return;
    }

    const step = ARROW_STEPS[event.key];
    if (!step) return;
    event.preventDefault();
    let nextRow = row + step[0];
    let nextColumn = column + step[1];
    // Skip over the diagonal, where a team would meet itself.
    if (nextRow === nextColumn) {
      nextRow += step[0];
      nextColumn += step[1];
    }
    if (nextRow >= 0 && nextRow < teams.length && nextColumn >= 0 && nextColumn < teams.length) {
      focusCell(nextRow, nextColumn);
    }
  };

  return (
    <div
      className="notch max-h-[75vh] overflow-auto bg-auh-ink text-auh-cream"
      onMouseLeave={() => setActiveCell(null)}
      data-testid="group-stage-matrix"
    >
      <table ref={tableRef} className="w-full border-separate border-spacing-0 text-[13px]">
        <caption className="sr-only">
          Group stage results. Each row shows the row team’s score against the team in each column.
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className={cn(HEADER_CELL, "left-0 z-[3] min-w-[170px] border-l-0 px-3 text-left align-bottom")}
            >
              Team
            </th>
            {teams.map((team, column) => (
              <th
                key={team.id}
                scope="col"
                className={cn(
                  HEADER_CELL,
                  "min-w-11 text-center font-display text-lg leading-none",
                  activeCell?.column === column && "text-auh-yellow",
                )}
                data-testid="matrix-column-header"
              >
                <abbr title={`${team.name}, captain ${team.captain}`} className="no-underline">
                  <span aria-hidden="true">{column + 1}</span>
                  <span className="sr-only">{team.name}</span>
                </abbr>
              </th>
            ))}
            {(isReadOnly ? [] : TOTAL_COLUMNS).map(({ label, title }) => (
              <th
                key={label}
                scope="col"
                className={cn(HEADER_CELL, "text-right", label === "Pts" ? "min-w-20 pr-4" : "min-w-9")}
              >
                <abbr title={title} className="no-underline">
                  {label}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((rowTeam, row) => {
            const record = records.get(rowTeam.id);
            const played = record?.played ?? 0;
            const wins = record?.wins ?? 0;
            const defaultWins = record?.defaultWins ?? 0;
            const draws = record?.draws ?? 0;
            const deduction = deductions[rowTeam.id];
            const points = getPoints({ wins, defaultWins, draws }, deduction?.points);
            const isActiveRow = activeCell?.row === row;

            return (
              <tr key={rowTeam.id} data-testid="matrix-row">
                <th
                  scope="row"
                  className={cn(BODY_CELL, STICKY_COLUMN, "border-l-0 px-3 py-1 text-left", isActiveRow && CROSSHAIR)}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "w-6 shrink-0 text-right font-display text-lg leading-none",
                        isActiveRow ? "text-auh-yellow" : "text-auh-cream-dim",
                      )}
                    >
                      {row + 1}
                    </span>
                    <span>
                      <span className={cn("block font-semibold", isActiveRow ? "text-auh-yellow" : "text-auh-cream")}>
                        {rowTeam.name}
                      </span>
                      <span className="block text-xs font-normal text-auh-cream-dim">{rowTeam.captain}</span>
                    </span>
                  </span>
                </th>

                {teams.map((columnTeam, column) => {
                  if (column === row) {
                    return (
                      <td
                        key={columnTeam.id}
                        aria-label="Same team"
                        className={cn(BODY_CELL, "bg-auh-ink-soft bg-stripes")}
                      />
                    );
                  }

                  const score = getSeriesScore(results, rowTeam.id, columnTeam.id);
                  const isCrosshair = isActiveRow || activeCell?.column === column;
                  const cellLabel = `${rowTeam.name} vs ${columnTeam.name}: ${score ? SCORE_LABELS[score] : "not played"}`;

                  if (isReadOnly) {
                    return (
                      <td
                        key={columnTeam.id}
                        title={cellLabel}
                        className={cn(
                          BODY_CELL,
                          "h-9 text-center font-semibold tabular-nums",
                          score && SCORE_CELL_CLASS_NAMES[score],
                          isCrosshair && (score ? "brightness-125" : CROSSHAIR),
                        )}
                        onMouseEnter={() => setActiveCell({ row, column })}
                        data-testid={`matrix-cell-${rowTeam.id}-${columnTeam.id}`}
                      >
                        <span className="sr-only">{cellLabel}</span>
                        <span aria-hidden="true">{score ?? <span className="text-auh-cream-dim">·</span>}</span>
                      </td>
                    );
                  }

                  return (
                    <td
                      key={columnTeam.id}
                      className={cn(
                        BODY_CELL,
                        "p-0",
                        score && SCORE_CELL_CLASS_NAMES[score],
                        isCrosshair && (score ? "brightness-125" : CROSSHAIR),
                      )}
                      onMouseEnter={() => setActiveCell({ row, column })}
                    >
                      <button
                        type="button"
                        onClick={() => openScoreDialog(row, column)}
                        onKeyDown={(event) => handleCellKeyDown(event, row, column)}
                        onFocus={() => setActiveCell({ row, column })}
                        aria-label={cellLabel}
                        title={cellLabel}
                        className="h-9 w-full cursor-pointer font-semibold tabular-nums focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-auh-orange"
                        data-cell={`${row}-${column}`}
                        data-testid={`matrix-cell-${rowTeam.id}-${columnTeam.id}`}
                      >
                        {score ?? <span className="text-auh-cream-dim">·</span>}
                      </button>
                    </td>
                  );
                })}

                {isReadOnly ? null : (
                  <>
                    <td className={cn(BODY_CELL, "px-2 text-right tabular-nums")}>{played}</td>
                    <td className={cn(BODY_CELL, "px-2 text-right tabular-nums")}>{wins + defaultWins}</td>
                    <td className={cn(BODY_CELL, "px-2 text-right tabular-nums")}>{draws}</td>
                    <td className={cn(BODY_CELL, "px-2 text-right tabular-nums")}>
                      {played - wins - defaultWins - draws}
                    </td>
                    <td className={cn(BODY_CELL, "p-0")}>
                      <button
                        type="button"
                        onClick={() => openDeductionDialog(rowTeam)}
                        disabled={!onDeductionChange}
                        aria-label={`${rowTeam.name}: ${points} pts${deduction ? `, ${deduction.points} deducted` : ""}. Deduct points`}
                        title={
                          deduction ? `${deduction.points} pts deducted. Click to change` : "Click to deduct points"
                        }
                        className="flex h-9 w-full cursor-pointer items-center justify-end gap-1.5 pr-4 pl-2 text-[15px] font-bold text-auh-yellow tabular-nums hover:bg-auh-ink-soft focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-auh-orange disabled:cursor-default"
                        data-testid={`matrix-points-${rowTeam.id}`}
                      >
                        {deduction ? (
                          <span
                            className="text-xs font-semibold text-auh-orange"
                            data-testid={`matrix-deduction-${rowTeam.id}`}
                          >
                            (−{deduction.points})
                          </span>
                        ) : null}
                        {points}
                      </button>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {isReadOnly ? null : (
        <ScoreDialog
          ref={dialogRef}
          team={editingCell ? { ...teams[editingCell.row], number: editingCell.row + 1 } : undefined}
          opponent={editingCell ? { ...teams[editingCell.column], number: editingCell.column + 1 } : undefined}
          score={
            editingCell ? getSeriesScore(results, teams[editingCell.row].id, teams[editingCell.column].id) : undefined
          }
          onSelect={(score) => {
            if (editingCell) onChange(teams[editingCell.row].id, teams[editingCell.column].id, score);
            dialogRef.current?.close();
          }}
        />
      )}

      {isReadOnly || !onDeductionChange ? null : (
        <DeductionDialog
          ref={deductionDialogRef}
          team={deductionTarget?.team}
          deduction={deductionTarget ? deductions[deductionTarget.team.id] : undefined}
          sessionKey={deductionTarget ? `${deductionTarget.team.id}-${deductionTarget.openCount}` : "closed"}
          onSave={(deduction) => {
            if (deductionTarget) onDeductionChange(deductionTarget.team.id, deduction);
            deductionDialogRef.current?.close();
          }}
        />
      )}
    </div>
  );
}
