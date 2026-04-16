[English](./README_en.md) | [中文](./README.md)

# @imcaptor/openclaw-poe-video

> **⚠️ Current Status: All Poe Video API models are temporarily unavailable.** The Poe platform returns "This model is temporarily unavailable via API". The plugin code is ready and will work once Poe restores the service. (2026-04-16)

OpenClaw plugin for video generation via [Poe Video API](https://creator.poe.com/api-reference/createVideo).

Supports multiple video models through a single API key: Sora-2, Veo-3,
Veo-3.1, Seedance 2.0, Grok Imagine Video, and more.

## Install

```bash
openclaw plugins install @imcaptor/openclaw-poe-video
```

## Setup

Set your Poe API key (a dedicated env var is recommended to avoid conflicts with poe-image):

```bash
# Add to ~/.openclaw/env.sh
export POE_VIDEO_API_KEY="your-key-here"
```

Also supports `POE_API_KEY` as a fallback, but `POE_VIDEO_API_KEY` is recommended if you also use poe-image.

## Usage

Once installed, the `video_generate` tool automatically includes Poe Video as
an available provider. Ask your agent to generate videos:

```
Generate a 5-second cinematic sunset beach video using poe-video/veo-3.1-fast
```

Or set Poe Video as the default video provider:

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "poe-video/veo-3.1-fast"
```

Or in the config file:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "poe-video/veo-3.1-fast",
      },
    },
  },
}
```

### Available models

| Model | Poe API Name | Provider | Default duration | Image-to-video | Status |
|-------|-------------|----------|------------------|----------------|--------|
| `sora-2` | Sora-2 | OpenAI | 4s | Yes | ⚠️ Unavailable |
| `sora-2-pro` | Sora-2-Pro | OpenAI | 4s | Yes | ⚠️ Unavailable |
| `veo-2` | Veo-2 | Google | 8s | Yes | ⚠️ Unavailable |
| `veo-3` | Veo-3 | Google | 8s | Yes | ⚠️ Unavailable |
| `veo-3-fast` | Veo-3-Fast | Google | 8s | Yes | ⚠️ Unavailable |
| `veo-3.1` | Veo-3.1 | Google | 8s | Yes | ⚠️ Unavailable |
| `veo-3.1-fast` | Veo-3.1-Fast | Google | 8s | Yes | ⚠️ Unavailable |
| `veo-3.1-lite` | Veo-3.1-Lite | Google | 8s | Yes | ⚠️ Unavailable |
| `seedance-2-fast` | Seedance-2-Fast | ByteDance | 5s | Yes | ❌ Not supported |
| `seedance-2.0` | Seedance-2.0 | ByteDance | 5s | Yes | ❌ Not supported |
| `grok-imagine-video` | Grok-Imagine-Video | xAI | 5s | Yes | ⚠️ Unavailable |

> **Note:** Officially supported models per Poe API docs: Sora-2, Sora-2-Pro, Veo-2, Veo-3, Veo-3-Fast, Veo-3.1, Veo-3.1-Fast. Seedance models return "Model does not support video generation", others return "temporarily unavailable".

### Specify a model

```
Generate a dancing cat video using poe-video/veo-3.1-fast
```

### Image-to-video

All models support generating video from a reference image:

```
Generate a video from this image + [attach image]
```

### Generation flow

Video generation is asynchronous:

1. The plugin submits a creation request to the Poe API
2. Poe processes the job in the background (typically 30s to 5 minutes)
3. The plugin automatically polls for completion
4. Once ready, the video is downloaded and returned to the agent

### Supported sizes

- `1920x1080` (landscape 16:9)
- `1080x1920` (portrait 9:16)
- `1280x720` (landscape 720p)
- `720x1280` (portrait 720p)

## Known Issues

1. **Env var conflict**: If poe-image is also installed, both use `POE_API_KEY`, which may cause provider auth resolution conflicts. Use `POE_VIDEO_API_KEY` for the video plugin.
2. **SDK compatibility**: `createProviderOperationDeadline` is unavailable in some openclaw versions; replaced with built-in timeout logic.
3. **Poe API model name casing**: Poe API requires capitalized model names (e.g., `Veo-3.1-Fast`). The plugin handles the mapping internally.

## License

MIT
