import {
  getBearerToken,
  json,
  methodNotAllowed,
  readJson,
  rpc
} from "../../_lib/supabase.js";

const VALID_STATUSES = new Set(["available", "unavailable", "fully_booked"]);

export async function onRequestPost({ env, request }) {
  const token = getBearerToken(request);
  if (!token) return json({ error: "Authentication required." }, 401);

  const { body, error: parseError } = await readJson(request);
  if (parseError) return json({ error: parseError }, 400);

  const {
    hospitalId,
    doctorId,
    date,
    status,
    startTime,
    endTime
  } = body || {};

  if (!hospitalId || !doctorId || !date || !VALID_STATUSES.has(status)) {
    return json(
      { error: "Hospital, doctor, date, and a valid status are required." },
      400
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return json({ error: "date must use YYYY-MM-DD format." }, 400);
  }
  if (status === "available" &&
      (!startTime || !endTime || endTime <= startTime)) {
    return json({ error: "Enter a valid consultation time range." }, 400);
  }

  try {
    const assignments = await rpc(
      env,
      "get_my_doctor_assignments",
      {},
      token
    );
    const isAssigned = (assignments || []).some(
      item => item.hospital_id === hospitalId && item.doctor_id === doctorId
    );
    if (!isAssigned) {
      return json(
        { error: "This doctor is not assigned to the hospital." },
        403
      );
    }

    const availability = await rpc(
      env,
      "set_doctor_availability",
      {
        p_hospital_id: hospitalId,
        p_doctor_id: doctorId,
        p_available_date: date,
        p_status: status,
        p_start_time: status === "available" ? startTime : null,
        p_end_time: status === "available" ? endTime : null,
        p_next_available_date: null,
        p_next_available_time: null,
        p_reason: null
      },
      token
    );
    return json({ availability });
  } catch (error) {
    console.error("Save doctor availability:", error);
    return json({ error: "Unable to save availability." }, 502);
  }
}

export function onRequestGet() {
  return methodNotAllowed("POST");
}

export function onRequestPut() {
  return methodNotAllowed("POST");
}

export function onRequestDelete() {
  return methodNotAllowed("POST");
}
