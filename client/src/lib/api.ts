export type ApiError = {
  status: number;
  message: string;
};

async function parseErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const data = await res.json();
      if (data && typeof data === "object") {
        if (typeof (data as any).error === "string") return (data as any).error;
        if (typeof (data as any).message === "string") return (data as any).message;
      }
      return JSON.stringify(data);
    }
  } catch {
    // ignore
  }

  try {
    const text = await res.text();
    return text || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function api<T = unknown>(
  path: string,
  opts: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = opts;

  const res = await fetch(path, {
    ...rest,
    headers: {
      ...(json ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    credentials: "include",
  });

  if (!res.ok) {
    const message = await parseErrorMessage(res);
    const err = new Error(`${res.status}: ${message}`) as Error & ApiError;
    err.status = res.status;
    err.message = message;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

export async function login() {
  return api<{ ok: true }>("/api/auth/login", {
    method: "POST",
    json: {},
  });
}

export async function me() {
  return api<{ id: string; email: string; firstName: string; lastName: string }>("/api/auth/user", {
    method: "GET",
  });
}

export async function logout() {
  return api<{ ok: true }>("/api/auth/logout", {
    method: "POST",
  });
}
