export async function fetchWithSsrFGuard(): Promise<{
  response: Response;
  release: () => Promise<void>;
}> {
  throw new Error("fetchWithSsrFGuard test shim was not mocked");
}
