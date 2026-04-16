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
  "Veo-2": {
    id: "Veo-2",
    name: "Veo 2",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,

    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3": {
    id: "Veo-3",
    name: "Veo 3",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,

    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3-Fast": {
    id: "Veo-3-Fast",
    name: "Veo 3 Fast",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,

    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3.1": {
    id: "Veo-3.1",
    name: "Veo 3.1",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,

    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3.1-Fast": {
    id: "Veo-3.1-Fast",
    name: "Veo 3.1 Fast",
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

export const DEFAULT_POE_VIDEO_MODEL = "Veo-3-Fast";

export const POE_VIDEO_MODEL_IDS = Object.keys(POE_VIDEO_MODELS);

export const POE_VIDEO_SUPPORTED_SIZES = [
  "1920x1080",
  "1080x1920",
  "1280x720",
  "720x1280",
] as const;
