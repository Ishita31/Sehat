import {
  json,
  methodNotAllowed,
  readJson,
  rpc,
  supabaseRequest
} from "../../_lib/supabase.js";

export async function onRequestPost({ env, request }) {
  const { body, error: parseError } = await readJson(request);
  if (parseError) return json({ error: parseError }, 400);

  const email = String(body?.email || "").trim();
  const password = String(body?.password || "");
  if (!email || !password) {
    return json({ error: "Email and password are required." }, 400);
  }

  let session;
  try {
    session = await supabaseRequest(env, "/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  } catch (error) {
    if (error.status === 400 || error.status === 401) {
      return json({ error: "Login failed. Check your credentials." }, 401);
    }
    console.error("Staff authentication:", error);
    return json({ error: "Unable to authenticate staff." }, 502);
  }

  try {
    const staffRows = await rpc(
      env,
      "get_my_staff_profile",
      {},
      session.access_token
    );
    const staff = Array.isArray(staffRows) ? staffRows[0] : staffRows;
    if (!staff || !staff.is_active) {
      return json({ error: "No active staff profile is assigned." }, 403);
    }

    return json({
      accessToken: session.access_token,
      staff
    });
  } catch (error) {
    console.error("Verify staff profile:", error);
    return json({ error: "Unable to verify the staff profile." }, 502);
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
