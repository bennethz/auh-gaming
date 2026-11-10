"use server";

import { updateTag } from "next/cache";
import type { GroupResultMap } from "@/lib/league/group-stage";
import { LEAGUE_CACHE_TAG } from "@/lib/league/data";
import type { PlayoffEntryMap } from "@/lib/league/playoffs";
import type { PointDeductionMap } from "@/lib/league/standings";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

export interface SaveLeagueInput {
  groupResults: GroupResultMap;
  deductions: PointDeductionMap;
  playoffEntries: PlayoffEntryMap;
}

export type SaveLeagueResult = { ok: true } | { ok: false; error: string };

/**
 * Replaces the stored group results, point deductions and playoff entries with the organizer's edits,
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
    const playoffRows = Object.entries(input.playoffEntries).map(([matchId, entry]) => ({
      match_id: matchId,
      score_a: entry.scoreA ?? null,
      score_b: entry.scoreB ?? null,
      match_date: entry.matchDate ?? null,
    }));

    // Delete-then-insert per table. Not atomic, which is acceptable for a test app.
    await replaceRows(supabase, "group_results", "team_a_id", groupRows);
    await replaceRows(supabase, "point_deductions", "team_id", deductionRows);
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

async function replaceRows(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  table: string,
  keyColumn: string,
  rows: Record<string, unknown>[],
): Promise<void> {
  // PostgREST requires a filter on delete; "key is not null" matches every row.
  const { error: deleteError } = await supabase.from(table).delete().not(keyColumn, "is", null);
  if (deleteError) throw new Error(`${table}: ${deleteError.message}`);
  if (rows.length === 0) return;
  const { error: insertError } = await supabase.from(table).insert(rows);
  if (insertError) throw new Error(`${table}: ${insertError.message}`);
}
