/**
 * Tauri Updater Endpoint
 *
 * Returns update info if a newer version is available.
 * Tauri calls: GET /api/desktop/update/{target}/{arch}/{current_version}
 *
 * Returns 204 if no update available, or JSON with download URL + signature.
 *
 * In production, you'd store the latest version info in the database or
 * fetch it from GitHub Releases. For now, this reads from an env var.
 */

export const runtime = "edge";

interface UpdateManifest {
  version: string;
  notes: string;
  pub_date: string;
  platforms: Record<
    string,
    {
      url: string;
      signature: string;
    }
  >;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ target: string; arch: string; current_version: string }> }
) {
  const { target, arch, current_version } = await params;
  const platformKey = `${target}-${arch}`;

  // In production, fetch this from your database or a static JSON file.
  // For now, check the DESKTOP_UPDATE_MANIFEST env var or return 204 (no update).
  const manifestJson = process.env.DESKTOP_UPDATE_MANIFEST;
  if (!manifestJson) {
    return new Response(null, { status: 204 });
  }

  let manifest: UpdateManifest;
  try {
    manifest = JSON.parse(manifestJson);
  } catch {
    return new Response(null, { status: 204 });
  }

  // Compare versions (simple semver comparison)
  const currentParts = current_version.replace(/^v/, "").split(".").map(Number);
  const latestParts = manifest.version.replace(/^v/, "").split(".").map(Number);

  let needsUpdate = false;
  for (let i = 0; i < 3; i++) {
    if ((latestParts[i] || 0) > (currentParts[i] || 0)) {
      needsUpdate = true;
      break;
    }
    if ((latestParts[i] || 0) < (currentParts[i] || 0)) {
      break;
    }
  }

  if (!needsUpdate) {
    return new Response(null, { status: 204 });
  }

  const platform = manifest.platforms[platformKey];
  if (!platform) {
    return new Response(null, { status: 204 });
  }

  return Response.json({
    version: manifest.version,
    notes: manifest.notes,
    pub_date: manifest.pub_date,
    url: platform.url,
    signature: platform.signature,
  });
}
