import {
  getBearerToken,
  json,
  methodNotAllowed,
  rpc
} from "../../_lib/supabase.js";

export async function onRequestGet({ env, request }) {
  const token = getBearerToken(request);
  if (!token) return json({ error: "Authentication required." }, 401);

  try {
    const assignments = await rpc(
      env,
      "get_my_doctor_assignments",
      {},
      token
    );
    return json({ assignments: assignments || [] });
  } catch (error) {
    console.error("Doctor assignments:", error);
    return json({ error: "Unable to verify doctor assignments." }, 403);
  }
}

export function onRequestPost() {
  return methodNotAllowed("GET");
}

export function onRequestPut() {
  return methodNotAllowed("GET");
}

export function onRequestDelete() {
  return methodNotAllowed("GET");
}
