import { json, methodNotAllowed, rpc } from "../_lib/supabase.js";

export async function onRequestGet({ env, request }) {
  const hospitalId = new URL(request.url).searchParams.get("hospitalId");
  if (!hospitalId) return json({ error: "hospitalId is required." }, 400);

  try {
    const doctors = await rpc(env, "get_public_doctors", {
      p_hospital_id: hospitalId
    });
    return json({ doctors: doctors || [] });
  } catch (error) {
    console.error("List doctors:", error);
    return json({ error: "Unable to load doctors." }, 502);
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
