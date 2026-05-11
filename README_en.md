[English](./README_en.md) | [中文](./README.md)

# @imcaptor/openclaw-poe-video

OpenClaw video generation provider for Poe's OpenAI-compatible `chat/completions` API. Supports text-to-video and reference image-to-video.

## Install

```bash
openclaw plugins install @imcaptor/openclaw-poe-video
```

Local development install:

```bash
openclaw plugins install /path/to/openclaw-poe-video --link
```

## Setup

Use the same Poe API key convention as poe-image and poe-music:

```bash
export POE_API_KEY="your-key-here"
```

## Usage

Generate with an explicit model:

```text
Generate a 6-second 9:16 720p cinematic rainy street video using poe/veo-3.1-fast
```

Set Poe as the default video model:

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "poe/veo-3.1-fast"
```

For image-to-video, pass reference images to `video_generate`; the plugin encodes local images as Poe-compatible `image_url` data URLs and preserves first-frame, last-frame, or reference-image roles in the prompt.

## Capabilities

| Capability | Status |
|------------|--------|
| Text-to-video | Supported |
| Reference image-to-video | Supported, up to 3 images |
| First/last frame roles | Supports `first_frame` / `last_frame` |
| Video-to-video | Not supported |
| Reference audio | Not supported |

## Models

The default model is `veo-3.1-fast`. Built-in models:

- `veo-3.1-fast`
- `veo-3.1`
- `veo-3.1-lite`
- `veo-3-fast`
- `veo-3`
- `veo-2`
- `sora-2`
- `sora-2-pro`
- `seedance-2-fast`
- `seedance-2.0`
- `grok-imagine-video`
- `real-video-generator`
- `amazon-nova-reel-1.1`

## Implementation Notes

This plugin no longer uses the old `/videos` task API. It mirrors `openclaw-poe-music`: `POST /v1/chat/completions`, then extract video files from response text, attachments, nested fields, data URLs, or base64 fields and return the downloaded asset to OpenClaw.

## License

MIT
