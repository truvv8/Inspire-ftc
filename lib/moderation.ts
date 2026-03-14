/**
 * Auto-moderation logic for uploaded materials.
 *
 * Rules:
 * - External links to trusted platforms (YouTube, Google Drive, GitHub) → auto-approve
 * - Non-image files (PDF, CAD, archives, documents) → auto-approve
 * - Images and unknown types → pending (manual review)
 */

type ModerationResult = {
  status: "approved" | "pending";
  reason: string;
};

const TRUSTED_LINK_DOMAINS = [
  "youtube.com",
  "youtu.be",
  "drive.google.com",
  "docs.google.com",
  "github.com",
  "figma.com",
  "onshape.com",
  "grabcad.com",
];

const SAFE_FILE_EXTENSIONS = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
  ".step", ".stp", ".stl", ".iges", ".igs", ".f3d", ".f3z",
  ".dwg", ".dxf", ".3mf", ".obj",
  ".zip", ".rar", ".7z", ".tar", ".gz",
  ".txt", ".csv", ".json", ".xml",
  ".py", ".java", ".kt", ".cpp", ".c", ".h", ".js", ".ts",
  ".ino", ".blocks",
];

export function determineAutoModeration(
  uploadType: "file" | "link",
  externalUrl?: string | null,
  filename?: string | null,
  contentType?: string | null,
): ModerationResult {
  // External links to trusted platforms → auto-approve
  if (uploadType === "link" && externalUrl) {
    try {
      const hostname = new URL(externalUrl).hostname.replace(/^www\./, "");
      if (TRUSTED_LINK_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d))) {
        return { status: "approved", reason: `Trusted platform: ${hostname}` };
      }
    } catch {
      // invalid URL — keep pending
    }
    return { status: "pending", reason: "External link to untrusted domain" };
  }

  // File uploads — check by extension and content type
  if (uploadType === "file") {
    const ext = filename ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : "";

    // Safe file types (non-image) → auto-approve
    if (ext && SAFE_FILE_EXTENSIONS.includes(ext)) {
      return { status: "approved", reason: `Safe file type: ${ext}` };
    }

    // Check content type for non-image files
    if (contentType && !contentType.startsWith("image/")) {
      return { status: "approved", reason: `Non-image content type: ${contentType}` };
    }

    // Images and unknown → pending
    return { status: "pending", reason: "Image or unknown file type — requires review" };
  }

  return { status: "pending", reason: "Unknown upload type" };
}