[English](./README_en.md) | [中文](./README.md)

# @imcaptor/openclaw-poe-video

通过 Poe 的 OpenAI-compatible `chat/completions` API 为 OpenClaw 提供视频生成能力，支持文生视频和参考图生视频。

## 安装

```bash
openclaw plugins install @imcaptor/openclaw-poe-video
```

本地开发安装：

```bash
openclaw plugins install /path/to/openclaw-poe-video --link
```

## 配置

使用和 poe-image、poe-music 相同的 Poe API key：

```bash
export POE_API_KEY="your-key-here"
```

## 使用

指定模型生成：

```text
用 poe/veo-3.1-fast 生成一段 6 秒、9:16、720p 的雨夜街道电影感视频
```

设为默认视频模型：

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "poe/veo-3.1-fast"
```

图生视频时，把图片作为参考图交给 `video_generate`；插件会将本地图片编码为 Poe 支持的 `image_url` data URL，并在提示词里保留首帧、尾帧或参考图角色。

## 支持能力

| 能力 | 状态 |
|------|------|
| 文生视频 | 支持 |
| 参考图生视频 | 支持，最多 3 张 |
| 首帧/尾帧角色 | 支持 `first_frame` / `last_frame` |
| 视频转视频 | 暂不支持 |
| 参考音频 | 暂不支持 |

## 模型

默认模型为 `veo-3.1-fast`。插件内置模型包括：

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

## 实现说明

插件不再调用旧的 `/videos` 任务接口，而是和 `openclaw-poe-music` 一样使用 `POST /v1/chat/completions`，从响应文本、attachments、嵌套字段、data URL 或 base64 字段中提取视频文件并下载返回给 OpenClaw。

## 许可证

MIT
