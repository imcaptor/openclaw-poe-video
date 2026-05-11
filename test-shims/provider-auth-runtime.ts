export async function resolveApiKeyForProvider(): Promise<{
  apiKey?: string;
  source?: string;
  mode?: string;
}> {
  return { apiKey: undefined };
}
