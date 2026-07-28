const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function proxyToBackend(path: string, init?: RequestInit) {
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json", ...init?.headers
    },
  });
}