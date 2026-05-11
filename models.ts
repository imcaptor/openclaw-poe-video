export type PoeVideoModelInfo = {
  id: string;
  label: string;
  description: string;
  defaultDurationSeconds: number;
  maxDurationSeconds?: number;
  supportsImageToVideo: boolean;
};

export const POE_VIDEO_MODELS: Record<string, PoeVideoModelInfo> = {
  "veo-3.1-fast": {
    id: "Veo-3.1-Fast",
    label: "Veo 3.1 Fast",
    description: "Google Veo 3.1 fast video generation on Poe.",
    defaultDurationSeconds: 8,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "veo-3.1": {
    id: "Veo-3.1",
    label: "Veo 3.1",
    description: "Google Veo 3.1 video generation on Poe.",
    defaultDurationSeconds: 8,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "veo-3.1-lite": {
    id: "Veo-3.1-Lite",
    label: "Veo 3.1 Lite",
    description: "Lower cost Google Veo 3.1 video generation on Poe.",
    defaultDurationSeconds: 8,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "veo-3-fast": {
    id: "Veo-3-Fast",
    label: "Veo 3 Fast",
    description: "Google Veo 3 fast video generation on Poe.",
    defaultDurationSeconds: 8,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "veo-3": {
    id: "Veo-3",
    label: "Veo 3",
    description: "Google Veo 3 video generation on Poe.",
    defaultDurationSeconds: 8,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "veo-2": {
    id: "Veo-2",
    label: "Veo 2",
    description: "Google Veo 2 video generation on Poe.",
    defaultDurationSeconds: 8,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "sora-2": {
    id: "Sora-2",
    label: "Sora 2",
    description: "OpenAI Sora 2 video generation on Poe.",
    defaultDurationSeconds: 4,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "sora-2-pro": {
    id: "Sora-2-Pro",
    label: "Sora 2 Pro",
    description: "OpenAI Sora 2 Pro video generation on Poe.",
    defaultDurationSeconds: 4,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "seedance-2-fast": {
    id: "Seedance-2-Fast",
    label: "Seedance 2 Fast",
    description: "ByteDance Seedance 2 fast video generation on Poe.",
    defaultDurationSeconds: 5,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "seedance-2.0": {
    id: "Seedance-2.0",
    label: "Seedance 2.0",
    description: "ByteDance Seedance 2.0 video generation on Poe.",
    defaultDurationSeconds: 5,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "grok-imagine-video": {
    id: "Grok-Imagine-Video",
    label: "Grok Imagine Video",
    description: "xAI Grok Imagine video generation on Poe.",
    defaultDurationSeconds: 5,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "real-video-generator": {
    id: "Real-Video-Generator",
    label: "Real Video Generator",
    description: "Poe video bot for general text-to-video and image-to-video generation.",
    defaultDurationSeconds: 4,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
  "amazon-nova-reel-1.1": {
    id: "Amazon-Nova-Reel-1.1",
    label: "Amazon Nova Reel 1.1",
    description: "Amazon Nova Reel video generation on Poe.",
    defaultDurationSeconds: 6,
    maxDurationSeconds: 12,
    supportsImageToVideo: true,
  },
};

export const DEFAULT_POE_VIDEO_MODEL = "veo-3.1-fast";

export const POE_VIDEO_MODEL_IDS = Object.keys(POE_VIDEO_MODELS);

export const POE_VIDEO_SUPPORTED_DURATION_SECONDS = [4, 6, 8, 12] as const;

export const POE_VIDEO_SUPPORTED_RESOLUTIONS = ["720P", "1080P"] as const;
