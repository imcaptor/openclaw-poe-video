export function extensionForMime(mimeType: string): string | undefined {
  const normalized = mimeType.split(";")[0]?.trim().toLowerCase();
  switch (normalized) {
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    default:
      return undefined;
  }
}
