import { json, methodNotAllowed, rpc } from "../_lib/supabase.js";

export async function onRequestGet({ env }) {
  try {
    const hospitals = await rpc(env, "get_public_hospitals");
    return json({ hospitals: hospitals || [] });
  } catch (error) {
    console.error("List hospitals:", error);
    return json({ error: "Unable to load hospitals." }, 502);
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
