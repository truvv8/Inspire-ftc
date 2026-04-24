export const dynamic = "force-dynamic";

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

  // Real FTC teams ranked 200+ in the 2025-26 Decode season (ftcscout.org), 14 countries
  const PLACEHOLDER_TEAMS = [
    // 🇷🇴 Romania
    { id: "start_code_24037", name: "Start Code", ftcName: "StartCode_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "arra_25538", name: "ARRA", ftcName: "ARRA_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "cyberlis76_23161", name: "CyberLIS76", ftcName: "CyberLIS76_FTC", materials: 1, categories: ["code", "inspire"], lastUpload: "" },
    { id: "dragonic_force_19064", name: "Dragonic Force", ftcName: "DragonicForce_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "robotitans_15989", name: "RoboTitans", ftcName: "RoboTitans_FTC", materials: 1, categories: ["robot", "inspire"], lastUpload: "" },
    { id: "mechabyte_22590", name: "MechaByte", ftcName: "MechaByte_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "sngine_20043", name: "SNGine", ftcName: "SNGine_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "watt_s_up_16166", name: "Watt'S Up", ftcName: "WattSUp_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    // 🇨🇳 China
    { id: "cosmic_spark_16093", name: "Cosmic Spark", ftcName: "CosmicSpark_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "dream_wind_19612", name: "Dream wind", ftcName: "DreamWind_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "ripples_25832", name: "ripples", ftcName: "ripples_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "bbk_robotics_32009", name: "BBK Robotics", ftcName: "BBKRobotics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "sprint_forward_19681", name: "sprint forward", ftcName: "SprintForward_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "grid_forge_31715", name: "Grid Forge", ftcName: "GridForge_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "techby_25787", name: "TechBY", ftcName: "TechBY_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "lithiumpulse_30319", name: "LithiumPulse", ftcName: "LithiumPulse_FTC", materials: 1, categories: ["code", "robot"], lastUpload: "" },
    // 🇮🇳 India
    { id: "g_force_19013", name: "G-Force", ftcName: "GForce_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "mad_engineers_25100", name: "MAD ENGINEERS", ftcName: "MadEngineers_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "2ez_28298", name: "2EZ", ftcName: "TwoEZ_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "spark_sk2_22751", name: "SPARK SK2", ftcName: "SparkSK2_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "team_matrix_20870", name: "Team Matrix", ftcName: "TeamMatrix_FTC", materials: 1, categories: ["inspire", "code"], lastUpload: "" },
    // 🇧🇷 Brazil
    { id: "space_tech_23504", name: "Space Tech", ftcName: "SpaceTech_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "rev_atom_16058", name: "Rev Atom", ftcName: "RevAtom_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "tech_dragons_26960", name: "Tech Dragons", ftcName: "TechDragons_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "tech_fenix_23055", name: "Tech Fenix", ftcName: "TechFenix_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    // 🇨🇦 Canada
    { id: "robeartics_19500", name: "RoBEARtics", ftcName: "RoBEARtics_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "roc_16417", name: "ROC", ftcName: "ROC_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "atom_smashers_20025", name: "Esquimalt Atom Smashers", ftcName: "AtomSmashers_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "hyper_droid_10015", name: "Hyper Droid", ftcName: "HyperDroid_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    // 🇳🇱 Netherlands
    { id: "beargineers_27628", name: "Beargineers", ftcName: "Beargineers_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "trojan_robotics_24090", name: "Trojan Robotics", ftcName: "TrojanRobotics_FTC", materials: 1, categories: ["robot", "code"], lastUpload: "" },
    // 🇹🇭 Thailand
    { id: "alphacosmos_28188", name: "ALPHACOSMOS", ftcName: "AlphaCosmos_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "dinonaut_27572", name: "Dinonaut", ftcName: "Dinonaut_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "allnew101_24070", name: "AllNew101", ftcName: "AllNew101_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    // 🇲🇽 Mexico
    { id: "prepatec_overture_23619", name: "PrepaTec OVERTURE", ftcName: "PrepaTecOVERTURE_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "devolt_phobos_16836", name: "Devolt Phobos", ftcName: "DevoltPhobos_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    // 🇻🇳 Vietnam
    { id: "greenams_robotics_24751", name: "GreenAms Robotics", ftcName: "GreenAmsRobotics_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇩🇪 Germany
    { id: "robotictechfrox_20092", name: "RTF-RoboticTechFrox", ftcName: "RoboticTechFrox_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    // 🇫🇷 France
    { id: "frites_20991", name: "FRITES", ftcName: "FRITES_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    // 🇹🇷 Turkey
    { id: "joyful_robotics_29613", name: "Joyful Robotics", ftcName: "JoyfulRobotics_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇱🇹 Lithuania
    { id: "android_25963", name: "Android", ftcName: "AndroidLT_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    // 🇳🇿 New Zealand
    { id: "referees_11511", name: "Referees", ftcName: "Referees_FTC", materials: 1, categories: ["robot", "inspire"], lastUpload: "" },
    // 🇮🇱 Israel
    { id: "roboten_15298", name: "RoboTen", ftcName: "RoboTen_FTC", materials: 1, categories: ["code"], lastUpload: "" },
  ];

  const existing = new Set(leaderboard.map((t) => t.id));
  const extras = PLACEHOLDER_TEAMS.filter((t) => !existing.has(t.id));
  const combined = [...leaderboard, ...extras];

  return NextResponse.json(combined);
}
