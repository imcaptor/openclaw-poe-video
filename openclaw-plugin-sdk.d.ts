declare module "openclaw/plugin-sdk/media-mime" {
  export function extensionForMime(mimeType: string): string | undefined;
}

declare module "openclaw/plugin-sdk/video-generation" {
  import type { Buffer } from "node:buffer";

  export type GeneratedVideoAsset = {
    buffer?: Buffer;
    url?: string;
    mimeType: string;
    fileName?: string;
    metadata?: Record<string, unknown>;
  };
  export type VideoGenerationResolution = "480P" | "720P" | "768P" | "1080P";
  export type VideoGenerationAssetRole =
    | "first_frame"
    | "last_frame"
    | "reference_image"
    | "reference_video"
    | "reference_audio";
  export type VideoGenerationSourceAsset = {
    url?: string;
    buffer?: Buffer;
    mimeType?: string;
    fileName?: string;
    role?: VideoGenerationAssetRole | (string & {});
    metadata?: Record<string, unknown>;
  };
  export type VideoGenerationRequest = {
    provider: string;
    model: string;
    prompt: string;
    cfg: Record<string, unknown>;
    agentDir?: string;
    authStore?: unknown;
    timeoutMs?: number;
    size?: string;
    aspectRatio?: string;
    resolution?: VideoGenerationResolution;
    durationSeconds?: number;
    audio?: boolean;
    watermark?: boolean;
    inputImages?: VideoGenerationSourceAsset[];
    inputVideos?: VideoGenerationSourceAsset[];
    inputAudios?: VideoGenerationSourceAsset[];
    providerOptions?: Record<string, unknown>;
  };
  export type VideoGenerationResult = {
    videos: GeneratedVideoAsset[];
    model?: string;
    metadata?: Record<string, unknown>;
  };
  export type VideoGenerationProviderOptionType = "number" | "boolean" | "string";
  export type VideoGenerationModeCapabilities = {
    maxVideos?: number;
    maxInputImages?: number;
    maxInputVideos?: number;
    maxInputAudios?: number;
    maxDurationSeconds?: number;
    supportedDurationSeconds?: readonly number[];
    supportedDurationSecondsByModel?: Readonly<Record<string, readonly number[]>>;
    sizes?: readonly string[];
    aspectRatios?: readonly string[];
    resolutions?: readonly VideoGenerationResolution[];
    supportsSize?: boolean;
    supportsAspectRatio?: boolean;
    supportsResolution?: boolean;
    supportsAudio?: boolean;
    supportsWatermark?: boolean;
    providerOptions?: Readonly<Record<string, VideoGenerationProviderOptionType>>;
  };
  export type VideoGenerationTransformCapabilities = VideoGenerationModeCapabilities & {
    enabled: boolean;
  };
  export type VideoGenerationProviderCapabilities = VideoGenerationModeCapabilities & {
    generate?: VideoGenerationModeCapabilities;
    imageToVideo?: VideoGenerationTransformCapabilities;
    videoToVideo?: VideoGenerationTransformCapabilities;
  };
  export type VideoGenerationProvider = {
    id: string;
    aliases?: string[];
    label?: string;
    defaultModel?: string;
    models?: string[];
    capabilities: VideoGenerationProviderCapabilities;
    isConfigured?: (ctx: { cfg?: unknown; agentDir?: string }) => boolean;
    generateVideo: (req: VideoGenerationRequest) => Promise<VideoGenerationResult>;
  };
}

declare module "openclaw/plugin-sdk/plugin-entry" {
  export type PluginRegistrationApi = {
    registerVideoGenerationProvider(provider: unknown): void;
  };
  export function definePluginEntry<
    T extends {
      id: string;
      name?: string;
      description?: string;
      register(api: PluginRegistrationApi): void;
    },
  >(entry: T): T;
}

declare module "openclaw/plugin-sdk/provider-auth" {
  export function isProviderApiKeyConfigured(params: {
    provider: string;
    agentDir?: string;
  }): boolean;
}

declare module "openclaw/plugin-sdk/provider-auth-runtime" {
  export function resolveApiKeyForProvider(params: {
    provider: string;
    cfg?: unknown;
    agentDir?: string;
    store?: unknown;
  }): Promise<{ apiKey?: string; source?: string; mode?: string }>;
}

declare module "openclaw/plugin-sdk/provider-http" {
  export function assertOkOrThrowHttpError(response: Response, context: string): Promise<void>;
  export function resolveProviderHttpRequestConfig(params: {
    baseUrl?: string;
    defaultBaseUrl: string;
    allowPrivateNetwork?: boolean;
    defaultHeaders?: Record<string, string>;
    provider?: string;
    capability?: string;
    transport?: string;
  }): {
    baseUrl: string;
    headers: Headers;
    dispatcherPolicy?: unknown;
  };
}

declare module "openclaw/plugin-sdk/ssrf-runtime" {
  export function fetchWithSsrFGuard(params: {
    url: string;
    init?: RequestInit;
    timeoutMs?: number;
    dispatcherPolicy?: unknown;
    auditContext?: string;
  }): Promise<{ response: Response; release: () => Promise<void> }>;
}
