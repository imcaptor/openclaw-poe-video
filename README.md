[English](./README_en.md) | [中文](./README.md)

# @imcaptor/openclaw-poe-video

> **⚠️ 当前状态：Poe 视频 API 所有模型暂时不可用。** Poe 平台返回 "This model is temporarily unavailable via API"。插件代码已就绪，等待 Poe 恢复服务后即可使用。（2026-04-16）

通过 [Poe Video API](https://creator.poe.com/api-reference/createVideo) 为 OpenClaw 提供视频生成能力的插件。

一个 API key 即可使用多种视频模型：Sora-2、Veo-3、Veo-3.1、Seedance 2.0、Grok Imagine Video 等。

## 安装

```bash
openclaw plugins install @imcaptor/openclaw-poe-video
```

## 配置

设置 Poe API key（推荐使用独立的环境变量名，避免与 poe-image 插件冲突）：

```bash
# 在 ~/.openclaw/env.sh 中添加
export POE_VIDEO_API_KEY="your-key-here"
```

也兼容 `POE_API_KEY`，但如果同时安装了 poe-image 插件，建议使用 `POE_VIDEO_API_KEY`。

## 使用

安装后，`video_generate` 工具会自动将 Poe Video 加入可用的视频生成 provider。直接让 agent 生成视频即可：

```
用 poe-video/veo-3.1-fast 生成一段 5 秒的日落海滩视频
```

也可以将 Poe Video 设为默认视频生成 provider：

```bash
openclaw config set agents.defaults.videoGenerationModel.primary "poe-video/veo-3.1-fast"
```

或在配置文件中设置：

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

### 支持的模型

| 模型 | Poe API 模型名 | 提供商 | 默认时长 | 图生视频 | 状态 |
|------|----------------|--------|----------|----------|------|
| `sora-2` | Sora-2 | OpenAI | 4 秒 | 支持 | ⚠️ 暂不可用 |
| `sora-2-pro` | Sora-2-Pro | OpenAI | 4 秒 | 支持 | ⚠️ 暂不可用 |
| `veo-2` | Veo-2 | Google | 8 秒 | 支持 | ⚠️ 暂不可用 |
| `veo-3` | Veo-3 | Google | 8 秒 | 支持 | ⚠️ 暂不可用 |
| `veo-3-fast` | Veo-3-Fast | Google | 8 秒 | 支持 | ⚠️ 暂不可用 |
| `veo-3.1` | Veo-3.1 | Google | 8 秒 | 支持 | ⚠️ 暂不可用 |
| `veo-3.1-fast` | Veo-3.1-Fast | Google | 8 秒 | 支持 | ⚠️ 暂不可用 |
| `veo-3.1-lite` | Veo-3.1-Lite | Google | 8 秒 | 支持 | ⚠️ 暂不可用 |
| `seedance-2-fast` | Seedance-2-Fast | ByteDance | 5 秒 | 支持 | ❌ API 不支持 |
| `seedance-2.0` | Seedance-2.0 | ByteDance | 5 秒 | 支持 | ❌ API 不支持 |
| `grok-imagine-video` | Grok-Imagine-Video | xAI | 5 秒 | 支持 | ⚠️ 暂不可用 |

> **注意：** Poe API 文档中官方支持的模型为：Sora-2、Sora-2-Pro、Veo-2、Veo-3、Veo-3-Fast、Veo-3.1、Veo-3.1-Fast。Seedance 系列返回 "Model does not support video generation"，其他模型返回 "temporarily unavailable"。

### 指定模型

```
用 poe-video/veo-3.1-fast 生成一段猫咪跳舞的视频
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

## 已知问题

1. **环境变量冲突**：如果同时安装了 poe-image 插件，两者都使用 `POE_API_KEY`，可能导致 provider auth 解析冲突。建议视频插件使用独立的 `POE_VIDEO_API_KEY`。
2. **SDK 兼容性**：`createProviderOperationDeadline` 在部分 openclaw 版本中不可用，已替换为内置超时逻辑。
3. **Poe API 模型名大小写**：Poe API 要求模型名首字母大写（如 `Veo-3.1-Fast`），插件内部已自动处理映射。

## 许可证

MIT
