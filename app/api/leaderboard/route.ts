import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Normalize team names so variants like "Overtime_FTC", "TeamName_Overtime_FTC"
 * all resolve to the same core team name.
 * Strategy: take the last segment before "_FTC" as the canonical name.
 * e.g. "Cool_Robots_FTC" → "Cool_Robots", "TeamName_Overtime_FTC" → "Overtime"
 * Then we append _FTC back for display.
 */
function normalizeTeamName(raw: string): string {
  let name = raw.trim();
  // Remove trailing _FTC suffix
  name = name.replace(/_FTC$/i, "");
  // Remove leading "Team_" or "Team" prefix
  name = name.replace(/^Team[_\s]*/i, "");
  return name.toLowerCase();
}

function displayName(raw: string): string {
  let name = raw.trim();
  name = name.replace(/_FTC$/i, "");
  name = name.replace(/^Team[_\s]*/i, "");
  return name.split("_").join(" ");
}

export async function GET() {
  const { data, error } = await supabase
    .from("materials")
    .select("team_name, category, created_at")
    .eq("status", "approved");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by normalized team name
  const teamMap = new Map<
    string,
    {
      displayName: string;
      rawNames: Set<string>;
      count: number;
      categories: Set<string>;
      lastUpload: string;
    }
  >();

  for (const row of data ?? []) {
    const key = normalizeTeamName(row.team_name);
    if (!teamMap.has(key)) {
      teamMap.set(key, {
        displayName: displayName(row.team_name),
        rawNames: new Set(),
        count: 0,
        categories: new Set(),
        lastUpload: row.created_at,
      });
    }
    const team = teamMap.get(key)!;
    team.rawNames.add(row.team_name);
    team.count++;
    if (row.category) team.categories.add(row.category);
    if (row.created_at > team.lastUpload) team.lastUpload = row.created_at;
  }

  // Convert to sorted array
  const leaderboard = Array.from(teamMap.entries())
    .map(([key, val]) => ({
      id: key,
      name: val.displayName,
      ftcName: Array.from(val.rawNames)[0],
      materials: val.count,
      categories: Array.from(val.categories),
      lastUpload: val.lastUpload,
    }))
    .sort((a, b) => b.materials - a.materials);

  return NextResponse.json(leaderboard);
}
