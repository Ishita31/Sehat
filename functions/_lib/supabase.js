export function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

export function methodNotAllowed(allowed) {
  return json(
    { error: "Method not allowed" },
    405,
    { Allow: allowed }
  );
}

export function getBearerToken(request) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function getSupabaseConfig(env) {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return { url, key };
}

export async function supabaseRequest(env, path, { token, ...options } = {}) {
  const { url, key } = getSupabaseConfig(env);
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token || key}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.msg || body?.message || "Supabase request failed.");
    error.status = response.status;
    throw error;
  }
  return body;
}

export function rpc(env, name, args = {}, token) {
  return supabaseRequest(env, `/rest/v1/rpc/${name}`, {
    method: "POST",
    token,
    body: JSON.stringify(args)
  });
}

export async function readJson(request) {
  try {
    return { body: await request.json(), error: null };
  } catch {
    return { body: null, error: "Request body must be valid JSON." };
  }
}
