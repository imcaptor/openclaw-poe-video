import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));
const shim = (name) => fileURLToPath(new URL(`./test-shims/${name}.ts`, import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "openclaw/plugin-sdk/media-mime": shim("media-mime"),
      "openclaw/plugin-sdk/video-generation": shim("video-generation"),
      "openclaw/plugin-sdk/plugin-entry": shim("plugin-entry"),
      "openclaw/plugin-sdk/provider-auth": shim("provider-auth"),
      "openclaw/plugin-sdk/provider-auth-runtime": shim("provider-auth-runtime"),
      "openclaw/plugin-sdk/provider-http": shim("provider-http"),
      "openclaw/plugin-sdk/ssrf-runtime": shim("ssrf-runtime"),
    },
  },
  root,
});
