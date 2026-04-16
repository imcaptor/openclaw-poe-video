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
  "veo-2": {
    id: "veo-2",
    name: "Veo 2",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3": {
    id: "veo-3",
    name: "Veo 3",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3-fast": {
    id: "veo-3-fast",
    name: "Veo 3 Fast",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3.1": {
    id: "veo-3.1",
    name: "Veo 3.1",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3.1-fast": {
    id: "veo-3.1-fast",
    name: "Veo 3.1 Fast",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "veo-3.1-lite": {
    id: "veo-3.1-lite",
    name: "Veo 3.1 Lite",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "seedance-2-fast": {
    id: "seedance-2-fast",
    name: "Seedance 2 Fast",
    provider: "ByteDance",
    defaultDurationSeconds: 5,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "seedance-2.0": {
    id: "seedance-2.0",
    name: "Seedance 2.0",
    provider: "ByteDance",
    defaultDurationSeconds: 5,
    supportsImageToVideo: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "grok-imagine-video": {
    id: "grok-imagine-video",
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
