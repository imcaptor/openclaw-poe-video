import { extensionForMime } from "openclaw/plugin-sdk/media-mime";
import { isProviderApiKeyConfigured } from "openclaw/plugin-sdk/provider-auth";
import { resolveApiKeyForProvider } from "openclaw/plugin-sdk/provider-auth-runtime";
import {
  assertOkOrThrowHttpError,
  resolveProviderHttpRequestConfig,
} from "openclaw/plugin-sdk/provider-http";
import { fetchWithSsrFGuard } from "openclaw/plugin-sdk/ssrf-runtime";
import type {
  GeneratedVideoAsset,
  VideoGenerationProvider,
  VideoGenerationRequest,
  VideoGenerationSourceAsset,
} from "openclaw/plugin-sdk/video-generation";

import {
  DEFAULT_POE_VIDEO_MODEL,
  POE_VIDEO_MODEL_IDS,
  POE_VIDEO_MODELS,
  POE_VIDEO_SUPPORTED_DURATION_SECONDS,
  POE_VIDEO_SUPPORTED_RESOLUTIONS,
} from "./models.js";

const POE_BASE_URL = "https://api.poe.com/v1";
const PROVIDER_ID = "poe";
const DEFAULT_TIMEOUT_MS = 300_000;
const MAX_INPUT_IMAGES = 3;
const MAX_DURATION_SECONDS = 12;

type PoeChatResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      content?: unknown;
      attachments?: unknown;
    };
  }>;
};

type VideoCandidate =
  | { type: "url"; url: string }
  | { type: "data"; dataUrl: string }
  | { type: "base64"; data: string; mimeType?: string };

type PoeMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail?: "high" | "low" | "auto" } }
    >;

let fetchGuard = fetchWithSsrFGuard;

export function _setPoeVideoFetchGuardForTesting(impl: typeof fetchWithSsrFGuard | null): void {
  fetchGuard = impl ?? fetchWithSsrFGuard;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeDurationSeconds(durationSeconds: number | undefined): number | undefined {
  if (typeof durationSeconds !== "number" || !Number.isFinite(durationSeconds)) {
    return undefined;
  }
  const rounded = Math.max(1, Math.min(MAX_DURATION_SECONDS, Math.round(durationSeconds)));
  return POE_VIDEO_SUPPORTED_DURATION_SECONDS.reduce((best, current) => {
    const currentDistance = Math.abs(current - rounded);
    const bestDistance = Math.abs(best - rounded);
    if (currentDistance < bestDistance) {
      return current;
    }
    if (currentDistance === bestDistance && current > best) {
      return current;
    }
    return best;
  });
}

function parseSize(size: string | undefined): { width: number; height: number } | undefined {
  const trimmed = optionalString(size);
  if (!trimmed) {
    return undefined;
  }
  const match = /^(\d+)x(\d+)$/u.exec(trimmed);
  if (!match) {
    return undefined;
  }
  const width = Number.parseInt(match[1] ?? "", 10);
  const height = Number.parseInt(match[2] ?? "", 10);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return undefined;
  }
  return { width, height };
}

function resolveAspectRatio(req: VideoGenerationRequest): string | undefined {
  const direct = optionalString(req.aspectRatio);
  if (direct) {
    return direct;
  }
  const parsed = parseSize(req.size);
  if (!parsed) {
    return undefined;
  }
  return parsed.width >= parsed.height ? "16:9" : "9:16";
}

function resolveResolution(req: VideoGenerationRequest): string | undefined {
  if (req.resolution === "720P") {
    return "720p";
  }
  if (req.resolution === "1080P") {
    return "1080p";
  }
  const parsed = parseSize(req.size);
  if (!parsed) {
    return undefined;
  }
  return Math.max(parsed.width, parsed.height) >= 1920 ? "1080p" : "720p";
}

function roleDescription(asset: VideoGenerationSourceAsset, index: number): string {
  switch (asset.role) {
    case "first_frame":
      return "Image 1 is the first frame. Start the video from this image.";
    case "last_frame":
      return `Image ${index + 1} is the last frame. End the video on this image.`;
    case "reference_image":
      return `Image ${index + 1} is a visual reference for style or subject consistency.`;
    default:
      if (index === 0) {
        return "Image 1 is the primary reference image. Animate from it when useful.";
      }
      return `Image ${index + 1} is an additional visual reference.`;
  }
}

function buildVideoPrompt(req: VideoGenerationRequest): string {
  const parts = [
    req.prompt.trim(),
    "Generate a completed video and return the downloadable video file.",
  ];
  const duration = normalizeDurationSeconds(req.durationSeconds);
  if (duration) {
    parts.push(`Duration: ${duration} seconds.`);
  }
  const aspectRatio = resolveAspectRatio(req);
  if (aspectRatio) {
    parts.push(`Aspect ratio: ${aspectRatio}.`);
  }
  const resolution = resolveResolution(req);
  if (resolution) {
    parts.push(`Resolution: ${resolution}.`);
  }
  if (req.audio === true) {
    parts.push("Include generated audio if the selected model supports audio.");
  }
  if (req.watermark === false) {
    parts.push("Do not add a visible watermark if the selected model allows disabling it.");
  }
  const negativePrompt = optionalString(req.providerOptions?.negativePrompt);
  if (negativePrompt) {
    parts.push(`Avoid: ${negativePrompt}.`);
  }
  const inputImages = req.inputImages ?? [];
  if (inputImages.length > 0) {
    parts.push(
      [
        "Use the attached image inputs as video references in order:",
        ...inputImages.map((asset, index) => `- ${roleDescription(asset, index)}`),
      ].join("\n"),
    );
  }
  return parts.join("\n\n");
}

function buildPoeMessageContent(req: VideoGenerationRequest): PoeMessageContent {
  const inputImages = req.inputImages ?? [];
  if (inputImages.length === 0) {
    return buildVideoPrompt(req);
  }
  return [
    { type: "text", text: buildVideoPrompt(req) },
    ...inputImages.map((input) => {
      if (!input.buffer) {
        throw new Error("Poe video generation currently requires local image reference files.");
      }
      const mimeType = optionalString(input.mimeType) || "image/png";
      return {
        type: "image_url" as const,
        image_url: {
          url: `data:${mimeType};base64,${input.buffer.toString("base64")}`,
          detail: "high" as const,
        },
      };
    }),
  ];
}

function uniqueCandidates(candidates: VideoCandidate[]): VideoCandidate[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key =
      candidate.type === "url"
        ? candidate.url
        : candidate.type === "data"
          ? candidate.dataUrl
          : `${candidate.mimeType ?? ""}:${candidate.data.slice(0, 64)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function isLikelyVideoUrl(url: string): boolean {
  return (
    /^https?:\/\//iu.test(url) &&
    (/\.(?:mp4|webm|mov|m4v)(?:[?#][^\s]*)?$/iu.test(url) ||
      /poecdn\.net\//iu.test(url) ||
      /video|download|attachment|generated/iu.test(url))
  );
}

function collectStringCandidates(value: string, out: VideoCandidate[]): void {
  const dataUrlPattern = /data:video\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/giu;
  for (const match of value.matchAll(dataUrlPattern)) {
    if (match[0]) {
      out.push({ type: "data", dataUrl: match[0] });
    }
  }

  const markdownPattern = /!?\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/giu;
  for (const match of value.matchAll(markdownPattern)) {
    const url = match[1]?.trim();
    if (url && isLikelyVideoUrl(url)) {
      out.push({ type: "url", url });
    }
  }

  const bareUrlPattern = /https?:\/\/[^\s<>"')]+/giu;
  for (const match of value.matchAll(bareUrlPattern)) {
    const url = match[0]?.trim();
    if (url && isLikelyVideoUrl(url)) {
      out.push({ type: "url", url });
    }
  }
}

function collectCandidates(value: unknown, out: VideoCandidate[]): void {
  if (!value) {
    return;
  }
  if (typeof value === "string") {
    collectStringCandidates(value, out);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectCandidates(item, out);
    }
    return;
  }
  if (typeof value !== "object") {
    return;
  }

  const record = value as Record<string, unknown>;
  for (const key of [
    "url",
    "download_url",
    "downloadUrl",
    "file_url",
    "fileUrl",
    "video_url",
    "videoUrl",
  ]) {
    const candidate = optionalString(record[key]);
    if (candidate && isLikelyVideoUrl(candidate)) {
      out.push({ type: "url", url: candidate });
    }
  }

  const mimeType = optionalString(record.mime_type) ?? optionalString(record.mimeType);
  const data = optionalString(record.data) ?? optionalString(record.b64_json);
  if (data && mimeType?.startsWith("video/")) {
    out.push({ type: "base64", data, mimeType });
  }

  for (const nested of [
    "choices",
    "message",
    "content",
    "text",
    "attachment",
    "attachments",
    "video",
    "videos",
    "output",
  ]) {
    collectCandidates(record[nested], out);
  }
}

function extractVideoCandidates(payload: PoeChatResponse): VideoCandidate[] {
  const candidates: VideoCandidate[] = [];
  collectCandidates(payload, candidates);
  return uniqueCandidates(candidates);
}

function extensionFromUrl(url: string): string | undefined {
  const clean = url.split(/[?#]/u)[0] ?? "";
  const match = /\.([a-z0-9]+)$/iu.exec(clean);
  return match?.[1]?.toLowerCase();
}

function fileNameForMime(params: { mimeType: string; index: number; url?: string }): string {
  const ext =
    extensionForMime(params.mimeType)?.replace(/^\./u, "") ||
    (params.url ? extensionFromUrl(params.url) : undefined) ||
    "mp4";
  return `poe-video-${params.index + 1}.${ext}`;
}

function isVideoBuffer(buffer: Buffer): boolean {
  if (buffer.length < 8) {
    return false;
  }
  const head = buffer.subarray(0, 32).toString("latin1");
  return head.includes("ftyp") || head.startsWith("\u001aE\u00df\u00a3") || head.includes("moov");
}

function videoFromDataCandidate(
  candidate: Extract<VideoCandidate, { type: "data" | "base64" }>,
  index: number,
): GeneratedVideoAsset {
  if (candidate.type === "data") {
    const match = /^data:(video\/[a-z0-9.+-]+);base64,(.+)$/iu.exec(candidate.dataUrl);
    if (!match) {
      throw new Error("Poe video response contained an invalid video data URL");
    }
    const mimeType = match[1] ?? "video/mp4";
    return {
      buffer: Buffer.from(match[2] ?? "", "base64"),
      mimeType,
      fileName: fileNameForMime({ mimeType, index }),
    };
  }
  const mimeType = candidate.mimeType ?? "video/mp4";
  return {
    buffer: Buffer.from(candidate.data, "base64"),
    mimeType,
    fileName: fileNameForMime({ mimeType, index }),
  };
}

async function downloadVideoFromUrl(params: {
  url: string;
  timeoutMs?: number;
  index: number;
}): Promise<GeneratedVideoAsset | null> {
  const { response, release } = await fetchGuard({
    url: params.url,
    init: { method: "GET" },
    timeoutMs: params.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    auditContext: "poe-video-download",
  });
  try {
    if (!response.ok) {
      return null;
    }
    const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim() || "video/mp4";
    const buffer = Buffer.from(await response.arrayBuffer());
    if (!mimeType.startsWith("video/") && !isVideoBuffer(buffer)) {
      return null;
    }
    const resolvedMimeType = mimeType.startsWith("video/") ? mimeType : "video/mp4";
    return {
      buffer,
      mimeType: resolvedMimeType,
      fileName: fileNameForMime({
        mimeType: resolvedMimeType,
        index: params.index,
        url: params.url,
      }),
    };
  } finally {
    await release();
  }
}

export function buildPoeVideoGenerationProvider(): VideoGenerationProvider {
  return {
    id: PROVIDER_ID,
    label: "Poe",
    defaultModel: DEFAULT_POE_VIDEO_MODEL,
    models: POE_VIDEO_MODEL_IDS,
    isConfigured: ({ agentDir }) =>
      isProviderApiKeyConfigured({
        provider: PROVIDER_ID,
        agentDir,
      }) || Boolean(process.env.POE_API_KEY?.trim()),
    capabilities: {
      generate: {
        maxVideos: 1,
        maxDurationSeconds: MAX_DURATION_SECONDS,
        supportedDurationSeconds: POE_VIDEO_SUPPORTED_DURATION_SECONDS,
        aspectRatios: ["16:9", "9:16"],
        resolutions: POE_VIDEO_SUPPORTED_RESOLUTIONS,
        supportsAspectRatio: true,
        supportsResolution: true,
        supportsSize: true,
        supportsAudio: true,
        supportsWatermark: true,
        providerOptions: {
          negativePrompt: "string",
        },
      },
      imageToVideo: {
        enabled: true,
        maxVideos: 1,
        maxInputImages: MAX_INPUT_IMAGES,
        maxDurationSeconds: MAX_DURATION_SECONDS,
        supportedDurationSeconds: POE_VIDEO_SUPPORTED_DURATION_SECONDS,
        aspectRatios: ["16:9", "9:16"],
        resolutions: POE_VIDEO_SUPPORTED_RESOLUTIONS,
        supportsAspectRatio: true,
        supportsResolution: true,
        supportsSize: true,
        supportsAudio: true,
        supportsWatermark: true,
        providerOptions: {
          negativePrompt: "string",
        },
      },
      videoToVideo: {
        enabled: false,
      },
    },
    async generateVideo(req) {
      if ((req.inputVideos?.length ?? 0) > 0) {
        throw new Error("Poe video generation does not support video-to-video in this plugin.");
      }
      if ((req.inputAudios?.length ?? 0) > 0) {
        throw new Error("Poe video generation does not support reference audio inputs.");
      }
      if ((req.inputImages?.length ?? 0) > MAX_INPUT_IMAGES) {
        throw new Error(
          `Poe video generation supports at most ${MAX_INPUT_IMAGES} reference images.`,
        );
      }

      const auth = await resolveApiKeyForProvider({
        provider: PROVIDER_ID,
        cfg: req.cfg,
        agentDir: req.agentDir,
        store: req.authStore,
      });
      const apiKey = auth.apiKey || process.env.POE_API_KEY?.trim();
      if (!apiKey) {
        throw new Error("Poe API key missing - set POE_API_KEY.");
      }

      const model = optionalString(req.model) || DEFAULT_POE_VIDEO_MODEL;
      const modelInfo = POE_VIDEO_MODELS[model];
      if (!modelInfo) {
        throw new Error(`Unknown Poe video model: ${model}`);
      }
      if ((req.inputImages?.length ?? 0) > 0 && !modelInfo.supportsImageToVideo) {
        throw new Error(`Poe model "${model}" does not support image-to-video.`);
      }

      const { baseUrl, headers, dispatcherPolicy } = resolveProviderHttpRequestConfig({
        defaultBaseUrl: POE_BASE_URL,
        allowPrivateNetwork: false,
        defaultHeaders: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        provider: PROVIDER_ID,
        capability: "video",
        transport: "http",
      });

      const { response, release } = await fetchGuard({
        url: `${baseUrl}/chat/completions`,
        init: {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: modelInfo.id,
            messages: [{ role: "user", content: buildPoeMessageContent(req) }],
            stream: false,
          }),
        },
        timeoutMs: req.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        dispatcherPolicy,
        auditContext: "poe-video-generate",
      });

      try {
        await assertOkOrThrowHttpError(response, "Poe video generation failed");
        const payload = (await response.json()) as PoeChatResponse;
        const candidates = extractVideoCandidates(payload);
        const videos: GeneratedVideoAsset[] = [];
        for (const candidate of candidates) {
          if (videos.length >= 1) {
            break;
          }
          const video =
            candidate.type === "url"
              ? await downloadVideoFromUrl({
                  url: candidate.url,
                  timeoutMs: req.timeoutMs,
                  index: videos.length,
                })
              : videoFromDataCandidate(candidate, videos.length);
          if (video?.buffer?.byteLength) {
            videos.push(video);
          }
        }

        if (videos.length === 0) {
          const content = payload.choices?.[0]?.message?.content;
          const preview =
            typeof content === "string" ? content.slice(0, 300) : JSON.stringify(content)?.slice(0, 300);
          throw new Error(
            `Poe video generation response did not contain a downloadable video file.${preview ? ` Response: ${preview}` : ""}`,
          );
        }

        return {
          videos,
          model: payload.model ?? model,
          metadata: {
            requestedModel: model,
            poeModel: modelInfo.id,
            ...(typeof req.durationSeconds === "number"
              ? { requestedDurationSeconds: req.durationSeconds }
              : {}),
            ...(resolveAspectRatio(req) ? { requestedAspectRatio: resolveAspectRatio(req) } : {}),
            ...(resolveResolution(req) ? { requestedResolution: resolveResolution(req) } : {}),
            inputImageCount: req.inputImages?.length ?? 0,
          },
        };
      } finally {
        await release();
      }
    },
  };
}
