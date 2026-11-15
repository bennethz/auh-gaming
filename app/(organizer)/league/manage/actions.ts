"use server";

import { updateTag } from "next/cache";
import type { GroupResultMap } from "@/lib/league/group-stage";
import { isMissingTableError, LEAGUE_CACHE_TAG } from "@/lib/league/data";
import type { PlayoffEntryMap, PlayoffSeeds } from "@/lib/league/playoffs";
import type { PointDeductionMap, TiebreakOrder } from "@/lib/league/standings";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export interface SaveLeagueInput {
  groupResults: GroupResultMap;
  deductions: PointDeductionMap;
  tiebreakOrder: TiebreakOrder;
  playoffEntries: PlayoffEntryMap;
  /** Seeds frozen when the playoffs were generated, team ids in seed order. */
  playoffSeeds: PlayoffSeeds;
}

export type SaveLeagueResult = { ok: true } | { ok: false; error: string };

/**
 * Replaces the stored group results, point deductions, tiebreak order, playoff entries and playoff seeds with the organizer's edits,
 * stamps the save time shown as the homepage's "standings as of" date, then refreshes the cached
 * league data so public pages show the change.
 * NOTE: No auth check. The access code gate is client-side only; anyone who can call this action can write.
 * @param input - The full edited state from the organizer screen.
 */
export async function saveLeague(input: SaveLeagueInput): Promise<SaveLeagueResult> {
  try {
    const supabase = getSupabaseAdminClient();

    const groupRows = Object.entries(input.groupResults).map(([pairKey, score]) => {
      const [teamAId, teamBId] = pairKey.split("|");
      return { team_a_id: teamAId, team_b_id: teamBId, score };
    });
    const deductionRows = Object.entries(input.deductions).map(([teamId, deduction]) => ({
      team_id: teamId,
      points: deduction.points,
    }));
    const tiebreakRows = input.tiebreakOrder.map((teamId, position) => ({ team_id: teamId, position }));
    const playoffRows = Object.entries(input.playoffEntries).map(([matchId, entry]) => ({
      match_id: matchId,
      score_a: entry.scoreA ?? null,
      score_b: entry.scoreB ?? null,
      match_date: entry.matchDate ?? null,
    }));
    const seedRows = input.playoffSeeds.map((teamId, index) => ({ seed: index + 1, team_id: teamId }));

    // Seeds first, so a missing playoff_seeds table (migration 0004 not run) fails before anything else is written.
    // With no seeds to save, a missing table is skipped so group stage saves keep working.
    try {
      await replaceRows(supabase, "playoff_seeds", "seed", seedRows);
    } catch (error) {
      if (!(error instanceof MissingTableError)) throw error;
      if (seedRows.length > 0) {
        throw new Error(
          "The playoff_seeds table doesn't exist yet. Run supabase/migrations/0004_playoff_seeds.sql in Supabase, then save again.",
        );
      }
    }

    // Delete-then-insert per table. Not atomic, which is acceptable for a test app.
    await replaceRows(supabase, "group_results", "team_a_id", groupRows);
    await replaceRows(supabase, "point_deductions", "team_id", deductionRows);
    await replaceRows(supabase, "tiebreak_order", "team_id", tiebreakRows);
    await replaceRows(supabase, "playoff_entries", "match_id", playoffRows);

    const { error: metaError } = await supabase
      .from("league_meta")
      .upsert({ id: true, standings_updated_at: new Date().toISOString() });
    if (metaError) throw new Error(`league_meta: ${metaError.message}`);

    updateTag(LEAGUE_CACHE_TAG);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Saving failed." };
  }
}

class MissingTableError extends Error {}

async function replaceRows(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  table: string,
  keyColumn: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  // PostgREST requires a filter on delete; "key is not null" matches every row.
  const { error: deleteError } = await supabase.from(table).delete().not(keyColumn, "is", null);
  if (deleteError) {
    const message = `${table}: ${deleteError.message}`;
    throw isMissingTableError(deleteError) ? new MissingTableError(message) : new Error(message);
  }
  if (rows.length === 0) return;
  const { error: insertError } = await supabase.from(table).insert(rows);
  if (insertError) throw new Error(`${table}: ${insertError.message}`);
}
