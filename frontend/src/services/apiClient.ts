/**
 * Shared typed fetch wrapper. Parses JSON bodies and surfaces
 * {error: string} bodies (per contracts/openapi.yaml Error schema) as
 * thrown Errors with that message.
 */

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? (body as { error: string }).error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function post<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(data) });
}

export function put<T>(path: string, data: unknown): Promise<T> {
  return request<T>(path, { method: "PUT", body: JSON.stringify(data) });
}
