"use client";

import { type ReactNode, useState } from "react";
import { ChipGroup, type ChipOption } from "@/components/ui/chip-group";

type LeagueView = "all" | "leaderboard" | "playoffs";

const VIEW_OPTIONS: ReadonlyArray<ChipOption<LeagueView>> = [
  { value: "all", label: "All" },
  { value: "leaderboard", label: "Group Stage" },
  { value: "playoffs", label: "Playoffs" },
];

interface LeagueViewTabsProps {
  /** Server-rendered leaderboard section. */
  leaderboard: ReactNode;
  /** Server-rendered playoff brackets section. */
  playoffs: ReactNode;
}

/**
 * Filters the league page between the leaderboard, the playoffs or both.
 * Sections are rendered on the server and passed in, so only the toggle runs on the client.
 */
export function LeagueViewTabs({ leaderboard, playoffs }: LeagueViewTabsProps) {
  const [view, setView] = useState<LeagueView>("all");

  return (
    <>
      <ChipGroup
        label="League view"
        options={VIEW_OPTIONS}
        value={view}
        onChange={setView}
        className="pt-8"
        data-testid="league-view"
      />
      <div hidden={view === "playoffs"}>{leaderboard}</div>
      <div hidden={view === "leaderboard"}>{playoffs}</div>
    </>
  );
}
