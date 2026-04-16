export type PoeVideoModelInfo = {
  id: string;
  name: string;
  provider: string;
  defaultDurationSeconds: number;
  maxDurationSeconds?: number;
  supportsImageToVideo: boolean;
  /** Sora models support extend and remix; Veo models do not. */
  supportsExtendRemix: boolean;
  supportedSizes: string[];
};

export const POE_VIDEO_MODELS: Record<string, PoeVideoModelInfo> = {
  "Sora-2": {
    id: "Sora-2",
    name: "Sora 2",
    provider: "OpenAI",
    defaultDurationSeconds: 4,
    maxDurationSeconds: 20,
    supportsImageToVideo: true,
    supportsExtendRemix: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Sora-2-Pro": {
    id: "Sora-2-Pro",
    name: "Sora 2 Pro",
    provider: "OpenAI",
    defaultDurationSeconds: 4,
    maxDurationSeconds: 20,
    supportsImageToVideo: true,
    supportsExtendRemix: true,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-2": {
    id: "Veo-2",
    name: "Veo 2",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportsExtendRemix: false,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3": {
    id: "Veo-3",
    name: "Veo 3",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportsExtendRemix: false,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3-Fast": {
    id: "Veo-3-Fast",
    name: "Veo 3 Fast",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportsExtendRemix: false,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3.1": {
    id: "Veo-3.1",
    name: "Veo 3.1",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportsExtendRemix: false,
    supportedSizes: ["1920x1080", "1080x1920", "1280x720", "720x1280"],
  },
  "Veo-3.1-Fast": {
    id: "Veo-3.1-Fast",
    name: "Veo 3.1 Fast",
    provider: "Google",
    defaultDurationSeconds: 8,
    supportsImageToVideo: true,
    supportsExtendRemix: false,
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
