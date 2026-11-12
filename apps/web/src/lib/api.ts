export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

/** Thin fetch wrapper. All requests go to the local API through the Vite proxy (/api). */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Cannot reach the Nayanote server. Is it running?', 'network');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error?.message ?? res.statusText, body?.error?.code);
  }
  return res.json() as Promise<T>;
}

export interface HealthResponse {
  status: 'ok';
  migrations: number;
  ai: { available: boolean; reason?: string };
}

export const fetchHealth = () => api<HealthResponse>('/health');
