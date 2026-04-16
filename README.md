[English](./README_en.md) | [中文](./README.md)

# @imcaptor/openclaw-poe-video

通过 [Poe Video API](https://creator.poe.com/api-reference/createVideo) 为 OpenClaw 提供视频生成能力的插件。

一个 API key 即可使用多种视频模型：Veo-3、Veo-3.1、Seedance 2.0、Grok Imagine Video 等。

## 安装

```bash
openclaw plugins install @imcaptor/openclaw-poe-video
```

## 配置

设置 Poe API key：

```bash
export POE_API_KEY="your-key-here"
```

或通过 OpenClaw 命令配置：

```bash
openclaw config set plugins.entries.poe-video.config.poeVideoApiKey "your-key-here"
```

## 使用

安装后，`video_generate` 工具会自动将 Poe Video 加入可用的视频生成 provider。直接让 agent 生成视频即可：

```
用 poe-video/Veo-3-Fast 生成一段 5 秒的日落海滩视频
```

也可以将 Poe Video 设为默认视频生成 provider：

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "poe-video/Veo-3-Fast"
```

或在配置文件中设置：

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "poe-video/Veo-3-Fast",
      },
    },
  },
}
```

### 支持的模型

| 模型 | 提供商 | 默认时长 | 图生视频 |
|------|--------|----------|----------|
| `Veo-2` | Google | 8 秒 | 支持 |
| `Veo-3` | Google | 8 秒 | 支持 |
| `Veo-3-Fast` | Google | 8 秒 | 支持 |
| `Veo-3.1` | Google | 8 秒 | 支持 |
| `Veo-3.1-Fast` | Google | 8 秒 | 支持 |
| `seedance-2-fast` | ByteDance | 5 秒 | 支持 |
| `seedance-2.0` | ByteDance | 5 秒 | 支持 |
| `grok-imagine-video` | xAI | 5 秒 | 支持 |

### 指定模型

```
用 poe-video/Sora-2 生成一段猫咪跳舞的视频
```

### 图生视频

所有模型都支持基于参考图片生成视频：

```
基于这张图片生成一段视频 + [附带图片]
```

### 生成流程

视频生成是异步的：

1. 插件向 Poe API 提交生成请求
2. Poe 在后台处理（通常 30 秒到 5 分钟）
3. 插件自动轮询状态直到完成
4. 完成后下载视频并返回给 agent

### 支持的分辨率

- `1920x1080`（横屏 16:9）
- `1080x1920`（竖屏 9:16）
- `1280x720`（横屏 720p）
- `720x1280`（竖屏 720p）

## 许可证

MIT
