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

  const PLACEHOLDER_TEAMS = [
    // 🇷🇺 Russia (6)
    { id: "siberian_mechanics", name: "Siberian Mechanics", ftcName: "SiberianMechanics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "ural_voltage", name: "Ural Voltage", ftcName: "UralVoltage_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "taiga_tech", name: "Taiga Tech", ftcName: "TaigaTech_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "polar_circuit", name: "Polar Circuit", ftcName: "PolarCircuit_FTC", materials: 1, categories: ["robot", "code"], lastUpload: "" },
    { id: "volga_bots", name: "Volga Bots", ftcName: "VolgaBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "baikal_drive", name: "Baikal Drive", ftcName: "BaikalDrive_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇰🇿 Kazakhstan (4)
    { id: "steppe_robotics", name: "Steppe Robotics", ftcName: "SteppeRobotics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "altai_gears", name: "Altai Gears", ftcName: "AltaiGears_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "nomad_tech", name: "Nomad Tech", ftcName: "NomadTech_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "tengri_bots", name: "Tengri Bots", ftcName: "TengriBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    // 🇲🇽 Mexico (3)
    { id: "condor_mech", name: "Condor Mech", ftcName: "CondorMech_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "tenochtitlan_tech", name: "Tenochtitlan Tech", ftcName: "TenochtitlanTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "aguila_robotics", name: "Aguila Robotics", ftcName: "AguilaRobotics_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇧🇷 Brazil (3)
    { id: "cerrado_bots", name: "Cerrado Bots", ftcName: "CerradoBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "pantanal_tech", name: "Pantanal Tech", ftcName: "PantanalTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "amazonia_drive", name: "Amazonia Drive", ftcName: "AmazoniaDrive_FTC", materials: 1, categories: ["inspire", "robot"], lastUpload: "" },
    // 🇮🇳 India (3)
    { id: "deccan_robotics", name: "Deccan Robotics", ftcName: "DeccanRobotics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "himalaya_bots", name: "Himalaya Bots", ftcName: "HimalayaBots_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "indus_tech", name: "Indus Tech", ftcName: "IndusTech_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇦🇺 Australia (3)
    { id: "outback_mechanics", name: "Outback Mechanics", ftcName: "OutbackMechanics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "coral_coders", name: "Coral Coders", ftcName: "CoralCoders_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "dingo_drive", name: "Dingo Drive", ftcName: "DingoDrive_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇰🇷 South Korea (3)
    { id: "hangang_bots", name: "Hangang Bots", ftcName: "HangangBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "seorak_tech", name: "Seorak Tech", ftcName: "SeorakTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "busan_circuit", name: "Busan Circuit", ftcName: "BusanCircuit_FTC", materials: 1, categories: ["inspire", "code"], lastUpload: "" },
    // 🇳🇱 Netherlands (3)
    { id: "windmill_robotics", name: "Windmill Robotics", ftcName: "WindmillRobotics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "polder_tech", name: "Polder Tech", ftcName: "PolderTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "deltawerk_bots", name: "Deltawerk Bots", ftcName: "DeltawerkBots_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇹🇷 Turkey (3)
    { id: "bosphorus_bots", name: "Bosphorus Bots", ftcName: "BosphorusBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "anatolian_tech", name: "Anatolian Tech", ftcName: "AnatolianTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "cappadocia_circuit", name: "Cappadocia Circuit", ftcName: "CappadociaCircuit_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇮🇱 Israel (2)
    { id: "negev_robotics", name: "Negev Robotics", ftcName: "NegevRobotics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "galilee_tech", name: "Galilee Tech", ftcName: "GalileeTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    // 🇨🇦 Canada (3)
    { id: "yukon_bots", name: "Yukon Bots", ftcName: "YukonBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "laurentian_tech", name: "Laurentian Tech", ftcName: "LaurentianTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "prairie_circuit", name: "Prairie Circuit", ftcName: "PrairieCircuit_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇩🇪 Germany (2)
    { id: "schwarzwald_bots", name: "Schwarzwald Bots", ftcName: "SchwarzwaldBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "rheinland_tech", name: "Rheinland Tech", ftcName: "RheinlandTech_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    // 🇨🇳 China (2)
    { id: "yangtze_robotics", name: "Yangtze Robotics", ftcName: "YangtzeRobotics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "gobi_tech", name: "Gobi Tech", ftcName: "GobiTech_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    // 🇺🇦 Ukraine (2)
    { id: "carpathian_bots", name: "Carpathian Bots", ftcName: "CarpathianBots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "dnipro_circuit", name: "Dnipro Circuit", ftcName: "DniproCircuit_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    // 🇷🇴 Romania (1)
    { id: "transylvania_tech", name: "Transylvania Tech", ftcName: "TransylvaniaTech_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
  ];

  const existing = new Set(leaderboard.map((t) => t.id));
  const extras = PLACEHOLDER_TEAMS.filter((t) => !existing.has(t.id));
  const combined = [...leaderboard, ...extras];

  return NextResponse.json(combined);
}
