import { isProviderApiKeyConfigured } from "openclaw/plugin-sdk/provider-auth";
import { resolveApiKeyForProvider } from "openclaw/plugin-sdk/provider-auth-runtime";
import {
  assertOkOrThrowHttpError,
  createProviderOperationDeadline,
  resolveProviderHttpRequestConfig,
  resolveProviderOperationTimeoutMs,
} from "openclaw/plugin-sdk/provider-http";
import type { VideoGenerationProvider } from "openclaw/plugin-sdk/video-generation";
import {
  fetchWithSsrFGuard,
} from "openclaw/plugin-sdk/ssrf-runtime";

import {
  DEFAULT_POE_VIDEO_MODEL,
  POE_VIDEO_MODELS,
  POE_VIDEO_MODEL_IDS,
  POE_VIDEO_SUPPORTED_SIZES,
} from "./models.js";

const POE_BASE_URL = "https://api.poe.com/v1";
const PROVIDER_ID = "poe-video";
const POLL_INTERVAL_MS = 5_000;
const DEFAULT_TIMEOUT_MS = 300_000;

type PoeVideoResponse = {
  id?: string;
  status?: "queued" | "in_progress" | "completed" | "failed";
  model?: string;
  seconds?: number;
  size?: string;
  progress?: number;
  error?: { message?: string; type?: string } | null;
};

let fetchGuard = fetchWithSsrFGuard;

export function _setPoeVideoFetchGuardForTesting(
  impl: typeof fetchWithSsrFGuard | null,
): void {
  fetchGuard = impl ?? fetchWithSsrFGuard;
}

function resolveHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function sizeFromAspectRatio(aspectRatio: string | undefined): string | undefined {
  if (!aspectRatio) return undefined;
  const mapping: Record<string, string> = {
    "16:9": "1920x1080",
    "9:16": "1080x1920",
  };
  return mapping[aspectRatio];
}

async function createVideo(params: {
  baseUrl: string;
  headers: Record<string, string>;
  model: string;
  prompt: string;
  seconds?: number;
  size?: string;
  inputImageBase64?: string;
  timeoutMs?: number;
  dispatcherPolicy?: unknown;
}): Promise<PoeVideoResponse> {
  const body: Record<string, unknown> = {
    model: params.model,
    prompt: params.prompt,
  };
  if (params.seconds !== undefined) body.seconds = params.seconds;
  if (params.size) body.size = params.size;
  if (params.inputImageBase64) body.input_image = params.inputImageBase64;

  const { response, release } = await fetchGuard({
    url: `${params.baseUrl}/videos`,
    init: {
      method: "POST",
      headers: params.headers,
      body: JSON.stringify(body),
    },
    timeoutMs: params.timeoutMs,
    dispatcherPolicy: params.dispatcherPolicy,
    auditContext: "poe-video-create",
  });

  try {
    await assertOkOrThrowHttpError(response, "Poe video creation failed");
    return (await response.json()) as PoeVideoResponse;
  } finally {
    await release();
  }
}

async function pollVideoStatus(params: {
  baseUrl: string;
  headers: Record<string, string>;
  videoId: string;
  deadline: ReturnType<typeof createProviderOperationDeadline>;
  dispatcherPolicy?: unknown;
}): Promise<PoeVideoResponse> {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const remaining = resolveProviderOperationTimeoutMs({
      deadline: params.deadline,
      defaultTimeoutMs: DEFAULT_TIMEOUT_MS,
    });
    if (remaining <= 0) {
      throw new Error(
        `Poe video generation timed out for video ${params.videoId}`,
      );
    }

    const { response, release } = await fetchGuard({
      url: `${params.baseUrl}/videos/${params.videoId}`,
      init: { method: "GET", headers: params.headers },
      timeoutMs: Math.min(remaining, 30_000),
      dispatcherPolicy: params.dispatcherPolicy,
      auditContext: "poe-video-poll",
    });

    let status: PoeVideoResponse;
    try {
      await assertOkOrThrowHttpError(response, "Poe video status check failed");
      status = (await response.json()) as PoeVideoResponse;
    } finally {
      await release();
    }

    if (status.status === "completed") return status;
    if (status.status === "failed") {
      const errMsg = status.error?.message ?? "unknown error";
      throw new Error(`Poe video generation failed: ${errMsg}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

async function downloadVideoContent(params: {
  baseUrl: string;
  headers: Record<string, string>;
  videoId: string;
  timeoutMs?: number;
  dispatcherPolicy?: unknown;
}): Promise<{ buffer: Buffer; mimeType: string }> {
  const { response, release } = await fetchGuard({
    url: `${params.baseUrl}/videos/${params.videoId}/content`,
    init: { method: "GET", headers: params.headers },
    timeoutMs: params.timeoutMs,
    dispatcherPolicy: params.dispatcherPolicy,
    auditContext: "poe-video-download",
  });

  try {
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Poe video download failed (${response.status}): ${text || response.statusText}`,
      );
    }
    const mimeType =
      response.headers.get("content-type")?.trim() || "video/mp4";
    const arrayBuffer = await response.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), mimeType };
  } finally {
    await release();
  }
}

export function buildPoeVideoGenerationProvider(): VideoGenerationProvider {
  return {
    id: PROVIDER_ID,
    label: "Poe Video",
    defaultModel: DEFAULT_POE_VIDEO_MODEL,
    models: POE_VIDEO_MODEL_IDS,
    isConfigured: ({ agentDir }) =>
      isProviderApiKeyConfigured({
        provider: PROVIDER_ID,
        agentDir,
      }),
    capabilities: {
      generate: {
        maxVideos: 1,
        supportsSize: true,
        supportsAspectRatio: true,
        sizes: [...POE_VIDEO_SUPPORTED_SIZES],
        aspectRatios: ["16:9", "9:16"],
      },
      imageToVideo: {
        enabled: true,
        maxVideos: 1,
        maxInputImages: 1,
        supportsSize: true,
      },
      videoToVideo: {
        enabled: false,
      },
    },
    async generateVideo(req) {
      const auth = await resolveApiKeyForProvider({
        provider: PROVIDER_ID,
        cfg: req.cfg,
        agentDir: req.agentDir,
        store: req.authStore,
      });
      if (!auth.apiKey) {
        throw new Error("Poe API key missing — set POE_API_KEY");
      }

      const model = req.model?.trim() || DEFAULT_POE_VIDEO_MODEL;
      const modelInfo = POE_VIDEO_MODELS[model];
      if (!modelInfo) {
        throw new Error(`Unknown Poe video model: ${model}`);
      }

      if ((req.inputVideos?.length ?? 0) > 0) {
        throw new Error(
          "Poe video generation does not support video-to-video in this plugin.",
        );
      }
      if ((req.inputImages?.length ?? 0) > 1) {
        throw new Error(
          "Poe video generation supports at most one reference image.",
        );
      }

      const hasInputImage = (req.inputImages?.length ?? 0) > 0;
      if (hasInputImage && !modelInfo.supportsImageToVideo) {
        throw new Error(
          `Poe model "${model}" does not support image-to-video.`,
        );
      }

      const { baseUrl, headers: baseHeaders, dispatcherPolicy } =
        resolveProviderHttpRequestConfig({
          baseUrl: undefined,
          defaultBaseUrl: POE_BASE_URL,
          allowPrivateNetwork: false,
          defaultHeaders: resolveHeaders(auth.apiKey),
          provider: PROVIDER_ID,
          capability: "video",
          transport: "http",
        });

      const deadline = createProviderOperationDeadline({
        timeoutMs: req.timeoutMs,
        label: "Poe video generation",
      });

      let inputImageBase64: string | undefined;
      if (hasInputImage) {
        const img = req.inputImages![0]!;
        if (img.buffer) {
          inputImageBase64 = img.buffer.toString("base64");
        } else if (img.url) {
          throw new Error(
            "Poe video API requires base64-encoded image input. Remote URL references are not supported.",
          );
        }
      }

      const resolvedSize =
        req.size ?? sizeFromAspectRatio(req.aspectRatio);

      const created = await createVideo({
        baseUrl,
        headers: baseHeaders,
        model,
        prompt: req.prompt,
        seconds: req.durationSeconds,
        size: resolvedSize,
        inputImageBase64,
        timeoutMs: resolveProviderOperationTimeoutMs({
          deadline,
          defaultTimeoutMs: 60_000,
        }),
        dispatcherPolicy,
      });

      if (!created.id) {
        throw new Error("Poe video creation response missing video id");
      }

      const completed = await pollVideoStatus({
        baseUrl,
        headers: baseHeaders,
        videoId: created.id,
        deadline,
        dispatcherPolicy,
      });

      const video = await downloadVideoContent({
        baseUrl,
        headers: baseHeaders,
        videoId: created.id,
        timeoutMs: resolveProviderOperationTimeoutMs({
          deadline,
          defaultTimeoutMs: 120_000,
        }),
        dispatcherPolicy,
      });

      return {
        videos: [
          {
            buffer: video.buffer,
            mimeType: video.mimeType,
            fileName: `poe-video.mp4`,
          },
        ],
        model,
        metadata: {
          videoId: created.id,
          seconds: completed.seconds,
          size: completed.size,
        },
      };
    },
  };
}
