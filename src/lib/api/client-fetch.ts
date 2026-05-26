export type ApiErrorBody = {
  error?: string;
  code?: string;
  hint?: string;
  details?: unknown;
};

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; body: ApiErrorBody }> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let body: ApiErrorBody & T = {} as ApiErrorBody & T;
  try {
    body = await res.json();
  } catch {
    body = {} as ApiErrorBody & T;
  }

  if (!res.ok) {
    return { ok: false, status: res.status, body };
  }

  const wrapped = body as { ok?: boolean; data?: T };
  if (wrapped.ok === true && wrapped.data !== undefined) {
    return { ok: true, data: wrapped.data };
  }

  return { ok: true, data: body as T };
}
