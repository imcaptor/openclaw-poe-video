[English](./README_en.md) | [中文](./README.md)

# @imcaptor/openclaw-poe-video

OpenClaw plugin for video generation via [Poe Video API](https://creator.poe.com/api-reference/createVideo).

Supports multiple video models through a single API key: Veo-3, Veo-3.1,
Seedance 2.0, Grok Imagine Video, and more.

## Install

```bash
openclaw plugins install @imcaptor/openclaw-poe-video
```

## Setup

Set your Poe API key:

```bash
export POE_API_KEY="your-key-here"
```

Or configure via OpenClaw:

```bash
openclaw config set plugins.entries.poe-video.config.poeVideoApiKey "your-key-here"
```

## Usage

Once installed, the `video_generate` tool automatically includes Poe Video as
an available provider. Ask your agent to generate videos:

```
Generate a 5-second cinematic sunset beach video using poe-video/veo-3-fast
```

Or set Poe Video as the default video provider:

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "poe-video/veo-3-fast"
```

Or in the config file:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "poe-video/veo-3-fast",
      },
    },
  },
}
```

### Available models

| Model | Provider | Default duration | Image-to-video |
|-------|----------|------------------|----------------|
| `veo-2` | Google | 8s | Yes |
| `veo-3` | Google | 8s | Yes |
| `veo-3-fast` | Google | 8s | Yes |
| `veo-3.1` | Google | 8s | Yes |
| `veo-3.1-fast` | Google | 8s | Yes |
| `veo-3.1-lite` | Google | 8s | Yes |
| `seedance-2-fast` | ByteDance | 5s | Yes |
| `seedance-2.0` | ByteDance | 5s | Yes |
| `grok-imagine-video` | xAI | 5s | Yes |

### Specify a model

```
Generate a dancing cat video using poe-video/seedance-2.0
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

## License

MIT
