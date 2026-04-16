export type PoeVideoModelInfo = {
  id: string;
  name: string;
  provider: string;
  defaultDurationSeconds: number;
  maxDurationSeconds?: number;
  supportsImageToVideo: boolean;
  supportedSizes: readonly string[];
};

export const POE_VIDEO_MODELS: Record<string, PoeVideoModelInfo> = {
  "sora-2": {
    id: "Sora-2",
    name: "Sora 2",
    provider: "OpenAI",
    defaultDurationSeconds: 4,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "sora-2-pro": {
    id: "Sora-2-Pro",
    name: "Sora 2 Pro",
    provider: "OpenAI",
    defaultDurationSeconds: 4,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-2": {
    id: "Veo-2",
    name: "Veo 2",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3": {
    id: "Veo-3",
    name: "Veo 3",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3-fast": {
    id: "Veo-3-Fast",
    name: "Veo 3 Fast",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3.1": {
    id: "Veo-3.1",
    name: "Veo 3.1",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3.1-fast": {
    id: "Veo-3.1-Fast",
    name: "Veo 3.1 Fast",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3.1-lite": {
    id: "Veo-3.1-Lite",
    name: "Veo 3.1 Lite",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "seedance-2-fast": {
    id: "Seedance-2-Fast",
    name: "Seedance 2 Fast",
    provider: "ByteDance",
    defaultDurationSeconds: 5,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "seedance-2.0": {
    id: "Seedance-2.0",
    name: "Seedance 2.0",
    provider: "ByteDance",
    defaultDurationSeconds: 5,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "grok-imagine-video": {
    id: "Grok-Imagine-Video",
    name: "Grok Imagine Video",
    provider: "xAI",
    defaultDurationSeconds: 5,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
};

export const DEFAULT_POE_VIDEO_MODEL = "veo-3-fast";

export const POE_VIDEO_MODEL_IDS = Object.keys(POE_VIDEO_MODELS);

export const POE_VIDEO_SUPPORTED_SIZES = [
  "1920x1080",
  "1080x1920",
  "1280x720",
  "720x1280",
] as const;
