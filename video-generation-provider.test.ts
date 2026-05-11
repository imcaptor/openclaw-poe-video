import { afterEach, describe, expect, it, vi } from "vitest";

import * as providerAuthRuntime from "openclaw/plugin-sdk/provider-auth-runtime";
import {
  _setPoeVideoFetchGuardForTesting,
  buildPoeVideoGenerationProvider,
} from "./video-generation-provider.js";

const jsonResponse = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });

const videoResponse = (body = "....ftypmp42video-bytes", contentType = "video/mp4") =>
  new Response(Buffer.from(body), {
    status: 200,
    headers: {
      "content-type": contentType,
    },
  });

describe("poe video generation provider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    _setPoeVideoFetchGuardForTesting(null);
  });

  it("declares text and image-to-video capabilities", () => {
    const provider = buildPoeVideoGenerationProvider();
    expect(provider.id).toBe("poe");
    expect(provider.defaultModel).toBe("veo-3.1-fast");
    expect(provider.models).toContain("sora-2");
    expect(provider.capabilities.generate?.supportsAspectRatio).toBe(true);
    expect(provider.capabilities.imageToVideo?.enabled).toBe(true);
    expect(provider.capabilities.imageToVideo?.maxInputImages).toBe(3);
    expect(provider.capabilities.videoToVideo?.enabled).toBe(false);
  });

  it("submits a non-streaming chat request and downloads markdown video output", async () => {
    vi.spyOn(providerAuthRuntime, "resolveApiKeyForProvider").mockResolvedValue({
      apiKey: "poe-key",
      source: "env",
      mode: "api-key",
    });
    const release = vi.fn(async () => {});
    const fetchGuard = vi
      .fn()
      .mockResolvedValueOnce({
        response: jsonResponse({
          model: "Veo-3.1-Fast",
          choices: [
            {
              message: {
                content: "Done: [video](https://pfst.cf2.poecdn.net/video-output.mp4)",
              },
            },
          ],
        }),
        release,
      })
      .mockResolvedValueOnce({
        response: videoResponse(),
        release,
      });
    _setPoeVideoFetchGuardForTesting(fetchGuard as never);

    const provider = buildPoeVideoGenerationProvider();
    const result = await provider.generateVideo({
      provider: "poe",
      model: "veo-3.1-fast",
      prompt: "a lantern drifting through fog",
      cfg: {},
      durationSeconds: 6,
      aspectRatio: "16:9",
      resolution: "720P",
    });

    expect(fetchGuard).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        url: "https://api.poe.com/v1/chat/completions",
        auditContext: "poe-video-generate",
      }),
    );
    const request = fetchGuard.mock.calls[0]?.[0] as { init?: { body?: string } };
    expect(JSON.parse(request.init?.body ?? "{}")).toEqual(
      expect.objectContaining({
        model: "Veo-3.1-Fast",
        stream: false,
        messages: [
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining("Duration: 6 seconds."),
          }),
        ],
      }),
    );
    expect(fetchGuard).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        url: "https://pfst.cf2.poecdn.net/video-output.mp4",
        auditContext: "poe-video-download",
      }),
    );
    expect(result.videos).toHaveLength(1);
    expect(result.videos[0]?.mimeType).toBe("video/mp4");
    expect(result.model).toBe("Veo-3.1-Fast");
  });

  it("sends reference images as data URLs for image-to-video", async () => {
    vi.spyOn(providerAuthRuntime, "resolveApiKeyForProvider").mockResolvedValue({
      apiKey: "poe-key",
      source: "env",
      mode: "api-key",
    });
    const fetchGuard = vi.fn().mockResolvedValue({
      response: jsonResponse({
        choices: [
          {
            message: {
              content: `data:video/webm;base64,${Buffer.from("webm-bytes").toString("base64")}`,
            },
          },
        ],
      }),
      release: vi.fn(async () => {}),
    });
    _setPoeVideoFetchGuardForTesting(fetchGuard as never);

    const provider = buildPoeVideoGenerationProvider();
    const result = await provider.generateVideo({
      provider: "poe",
      model: "veo-3.1",
      prompt: "animate the scene",
      cfg: {},
      inputImages: [
        {
          buffer: Buffer.from("image-bytes"),
          mimeType: "image/jpeg",
          role: "first_frame",
        },
      ],
    });

    const request = fetchGuard.mock.calls[0]?.[0] as { init?: { body?: string } };
    const body = JSON.parse(request.init?.body ?? "{}") as {
      messages?: Array<{ content?: Array<{ type: string; image_url?: { url?: string } }> }>;
    };
    expect(body.messages?.[0]?.content?.[0]?.type).toBe("text");
    expect(body.messages?.[0]?.content?.[1]?.image_url?.url).toMatch(
      /^data:image\/jpeg;base64,/u,
    );
    expect(result.videos[0]?.mimeType).toBe("video/webm");
    expect(result.videos[0]?.fileName).toBe("poe-video-1.webm");
  });

  it("rejects unsupported video-to-video input", async () => {
    const provider = buildPoeVideoGenerationProvider();
    await expect(
      provider.generateVideo({
        provider: "poe",
        model: "veo-3.1-fast",
        prompt: "restyle this video",
        cfg: {},
        inputVideos: [{ buffer: Buffer.from("video"), mimeType: "video/mp4" }],
      }),
    ).rejects.toThrow("video-to-video");
  });
});
