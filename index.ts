import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { createProviderApiKeyAuthMethod } from "openclaw/plugin-sdk/provider-auth-api-key";
import { buildPoeVideoGenerationProvider } from "./video-generation-provider.js";

const PROVIDER_ID = "poe-video";
const DEFAULT_MODEL_REF = "poe-video/Veo-3-Fast";

export default definePluginEntry({
  id: "poe-video",
  name: "Poe Video Provider",
  description:
    "Video generation via Poe Video API — Sora-2, Veo-3, and more",
  register(api) {
    api.registerProvider({
      id: PROVIDER_ID,
      label: "Poe Video",
      docsPath: "/providers/models",
      envVars: ["POE_API_KEY"],
      auth: [
        createProviderApiKeyAuthMethod({
          providerId: PROVIDER_ID,
          methodId: "api-key",
          label: "Poe API key (video)",
          hint: "Video generation via Poe (Sora-2, Veo-3, etc.)",
          optionKey: "poeVideoApiKey",
          flagName: "--poe-video-api-key",
          envVar: "POE_API_KEY",
          promptMessage: "Enter Poe API key for video generation",
          defaultModel: DEFAULT_MODEL_REF,
          expectedProviders: [PROVIDER_ID],
          wizard: {
            choiceId: "poe-video-api-key",
            choiceLabel: "Poe API key (video)",
            choiceHint: "Video generation via Poe API",
            groupId: "poe-video",
            groupLabel: "Poe Video",
            groupHint: "Video generation",
            onboardingScopes: ["video-generation"],
          },
        }),
      ],
    });
    api.registerVideoGenerationProvider(buildPoeVideoGenerationProvider());
  },
});
