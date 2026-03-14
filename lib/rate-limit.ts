import { supabaseServer } from "./supabase-server";

/**
 * Check if a user has exceeded the upload rate limit.
 * Uses Supabase to count recent uploads within the time window.
 */
export async function checkRateLimit(
  userId: string,
  windowHours: number = 1,
  maxUploads: number = 5,
): Promise<{ allowed: boolean; remaining: number }> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabaseServer
    .from("materials")
    .select("id", { count: "exact", head: true })
    .eq("uploaded_by", userId)
    .gte("created_at", since);

  if (error) {
    console.error("Rate limit check failed:", error);
    // On error, allow the upload (fail open)
    return { allowed: true, remaining: maxUploads };
  }

  const used = count ?? 0;
  return {
    allowed: used < maxUploads,
    remaining: Math.max(0, maxUploads - used),
  };
}