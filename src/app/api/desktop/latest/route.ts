/**
 * Returns the latest desktop release info for the download page.
 * Reads from DESKTOP_LATEST_VERSION env var (set by CI on release)
 * or falls back to GitHub Releases API.
 *
 * Response shape:
 * {
 *   version: "1.2.0",
 *   date: "2026-03-10",
 *   dmgUrl: "https://github.com/rajdua07/crisp/releases/download/desktop-v1.2.0/Crisp_1.2.0_aarch64.dmg",
 *   dmgUrlIntel: "https://github.com/rajdua07/crisp/releases/download/desktop-v1.2.0/Crisp_1.2.0_x64.dmg",
 *   notes: "Bug fixes and performance improvements"
 * }
 */

export const runtime = "edge";

const GITHUB_REPO = "rajdua07/crisp";

export async function GET() {
  // Option 1: env var set by CI
  const envJson = process.env.DESKTOP_LATEST_VERSION;
  if (envJson) {
    try {
      const data = JSON.parse(envJson);
      return Response.json(data);
    } catch {
      // Fall through to GitHub
    }
  }

  // Option 2: fetch from GitHub Releases
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
        next: { revalidate: 300 }, // cache 5 min
      }
    );

    if (!res.ok) {
      return Response.json(
        { version: null, message: "Coming soon" },
        { status: 200 }
      );
    }

    const releases = await res.json();
    const desktopRelease = releases.find(
      (r: { tag_name: string; draft: boolean }) =>
        r.tag_name.startsWith("desktop-v") && !r.draft
    );

    if (!desktopRelease) {
      return Response.json(
        { version: null, message: "Coming soon" },
        { status: 200 }
      );
    }

    const version = desktopRelease.tag_name.replace("desktop-v", "");
    const assets = desktopRelease.assets || [];

    const dmgArm = assets.find(
      (a: { name: string }) =>
        a.name.endsWith(".dmg") && (a.name.includes("aarch64") || a.name.includes("arm64"))
    );
    const dmgIntel = assets.find(
      (a: { name: string }) =>
        a.name.endsWith(".dmg") && (a.name.includes("x64") || a.name.includes("x86_64"))
    );

    return Response.json({
      version,
      date: desktopRelease.published_at?.split("T")[0] || "",
      dmgUrl: dmgArm?.browser_download_url || dmgIntel?.browser_download_url || null,
      dmgUrlIntel: dmgIntel?.browser_download_url || null,
      notes: desktopRelease.body || "",
    });
  } catch {
    return Response.json(
      { version: null, message: "Coming soon" },
      { status: 200 }
    );
  }
}
