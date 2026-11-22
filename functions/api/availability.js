import { json, methodNotAllowed, rpc } from "../_lib/supabase.js";

export async function onRequestGet({ env, request }) {
  const params = new URL(request.url).searchParams;
  const hospitalId = params.get("hospitalId");
  const date = params.get("date");
  if (!hospitalId || !date) {
    return json({ error: "hospitalId and date are required." }, 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: "date must use YYYY-MM-DD format." }, 400);
  }

  try {
    const availability = await rpc(env, "get_public_doctor_availability", {
      p_hospital_id: hospitalId,
      p_date: date
    });
    return json({ availability: availability || [] });
  } catch (error) {
    console.error("List availability:", error);
    return json({ error: "Unable to load availability." }, 502);
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
