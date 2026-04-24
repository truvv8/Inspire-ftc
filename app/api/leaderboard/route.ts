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
    { id: "iron_wolves", name: "Iron Wolves", ftcName: "IronWolves_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "circuit_breakerz", name: "Circuit Breakerz", ftcName: "CircuitBreakerz_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "robo_knights", name: "Robo Knights", ftcName: "RoboKnights_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "nano_force", name: "Nano Force", ftcName: "NanoForce_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "gear_heads", name: "Gear Heads", ftcName: "GearHeads_FTC", materials: 1, categories: ["robot", "code"], lastUpload: "" },
    { id: "wire_warriors", name: "Wire Warriors", ftcName: "WireWarriors_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "tech_titans", name: "Tech Titans", ftcName: "TechTitans_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "alpha_robotics", name: "Alpha Robotics", ftcName: "AlphaRobotics_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "byte_builders", name: "Byte Builders", ftcName: "ByteBuilders_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "steel_spinners", name: "Steel Spinners", ftcName: "SteelSpinners_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "digital_dynamos", name: "Digital Dynamos", ftcName: "DigitalDynamos_FTC", materials: 1, categories: ["code", "inspire"], lastUpload: "" },
    { id: "mech_masters", name: "Mech Masters", ftcName: "MechMasters_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "pixel_pioneers", name: "Pixel Pioneers", ftcName: "PixelPioneers_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "volt_vanguard", name: "Volt Vanguard", ftcName: "VoltVanguard_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "torque_team", name: "Torque Team", ftcName: "TorqueTeam_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "quantum_quest", name: "Quantum Quest", ftcName: "QuantumQuest_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "fusion_force", name: "Fusion Force", ftcName: "FusionForce_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "binary_blazers", name: "Binary Blazers", ftcName: "BinaryBlazers_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "cosmic_coders", name: "Cosmic Coders", ftcName: "CosmicCoders_FTC", materials: 1, categories: ["code", "robot"], lastUpload: "" },
    { id: "delta_drive", name: "Delta Drive", ftcName: "DeltaDrive_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "echo_engineers", name: "Echo Engineers", ftcName: "EchoEngineers_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "flux_factory", name: "Flux Factory", ftcName: "FluxFactory_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "gravity_guild", name: "Gravity Guild", ftcName: "GravityGuild_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "hyper_hawks", name: "Hyper Hawks", ftcName: "HyperHawks_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "ion_impact", name: "Ion Impact", ftcName: "IonImpact_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "junction_jaguars", name: "Junction Jaguars", ftcName: "JunctionJaguars_FTC", materials: 1, categories: ["robot", "inspire"], lastUpload: "" },
    { id: "kinetic_kings", name: "Kinetic Kings", ftcName: "KineticKings_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "laser_lynx", name: "Laser Lynx", ftcName: "LaserLynx_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "matrix_makers", name: "Matrix Makers", ftcName: "MatrixMakers_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "nova_nexus", name: "Nova Nexus", ftcName: "NovaNexus_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "orbit_outlaws", name: "Orbit Outlaws", ftcName: "OrbitOutlaws_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "pulse_pilots", name: "Pulse Pilots", ftcName: "PulsePilots_FTC", materials: 1, categories: ["code", "robot"], lastUpload: "" },
    { id: "quasar_quest", name: "Quasar Quest", ftcName: "QuasarQuest_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "reactor_robots", name: "Reactor Robots", ftcName: "ReactorRobots_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "spark_squad", name: "Spark Squad", ftcName: "SparkSquad_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "thunder_thread", name: "Thunder Thread", ftcName: "ThunderThread_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "ultra_unit", name: "Ultra Unit", ftcName: "UltraUnit_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "vector_vipers", name: "Vector Vipers", ftcName: "VectorVipers_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "warp_wolves", name: "Warp Wolves", ftcName: "WarpWolves_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "xenon_xcels", name: "Xenon Xcels", ftcName: "XenonXcels_FTC", materials: 1, categories: ["inspire"], lastUpload: "" },
    { id: "yellow_jackets", name: "Yellow Jackets", ftcName: "YellowJackets_FTC", materials: 1, categories: ["code"], lastUpload: "" },
    { id: "zero_gravity", name: "Zero Gravity", ftcName: "ZeroGravity_FTC", materials: 1, categories: ["robot"], lastUpload: "" },
    { id: "apex_alliance", name: "Apex Alliance", ftcName: "ApexAlliance_FTC", materials: 1, categories: ["inspire", "code"], lastUpload: "" },
  ];

  const existing = new Set(leaderboard.map((t) => t.id));
  const extras = PLACEHOLDER_TEAMS.filter((t) => !existing.has(t.id));
  const combined = [...leaderboard, ...extras];

  return NextResponse.json(combined);
}
