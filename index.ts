import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { buildPoeVideoGenerationProvider } from "./video-generation-provider.js";

export default definePluginEntry({
  id: "poe-video",
  name: "Poe Video Provider",
  description:
    "Video generation via Poe API using Veo, Sora, Seedance, Grok Imagine, and other Poe video models.",
  register(api) {
    api.registerVideoGenerationProvider(buildPoeVideoGenerationProvider());
  },
});
