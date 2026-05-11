export async function assertOkOrThrowHttpError(response: Response, context: string): Promise<void> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`${context} (${response.status}): ${body || response.statusText}`);
  }
}

export function resolveProviderHttpRequestConfig(params: {
  defaultBaseUrl: string;
  defaultHeaders?: Record<string, string>;
}): {
  baseUrl: string;
  headers: Headers;
  dispatcherPolicy?: unknown;
} {
  return {
    baseUrl: params.defaultBaseUrl,
    headers: new Headers(params.defaultHeaders),
  };
}
