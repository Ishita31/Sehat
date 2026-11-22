import test from "node:test";
import assert from "node:assert/strict";

import { getBearerToken, readJson } from "../functions/_lib/supabase.js";
import { onRequestGet as listDoctors } from "../functions/api/doctors.js";
import { onRequestGet as listAvailability } from "../functions/api/availability.js";
import { onRequestPost as saveAvailability } from "../functions/api/doctor/availability.js";

test("getBearerToken reads a bearer authorization header", () => {
  const request = new Request("https://sehat.example/api", {
    headers: { Authorization: "Bearer test-access-token" }
  });
  assert.equal(getBearerToken(request), "test-access-token");
});

test("getBearerToken rejects missing and malformed headers", () => {
  assert.equal(getBearerToken(new Request("https://sehat.example/api")), null);
  assert.equal(
    getBearerToken(new Request("https://sehat.example/api", {
      headers: { Authorization: "Basic abc" }
    })),
    null
  );
});

test("readJson reports malformed request bodies", async () => {
  const request = new Request("https://sehat.example/api", {
    method: "POST",
    body: "{not json"
  });
  assert.deepEqual(await readJson(request), {
    body: null,
    error: "Request body must be valid JSON."
  });
});

test("doctor and availability endpoints validate required query parameters", async () => {
  const doctorResponse = await listDoctors({
    env: {},
    request: new Request("https://sehat.example/api/doctors")
  });
  assert.equal(doctorResponse.status, 400);
  assert.deepEqual(await doctorResponse.json(), {
    error: "hospitalId is required."
  });

  const availabilityResponse = await listAvailability({
    env: {},
    request: new Request("https://sehat.example/api/availability?hospitalId=h1&date=tomorrow")
  });
  assert.equal(availabilityResponse.status, 400);
  assert.deepEqual(await availabilityResponse.json(), {
    error: "date must use YYYY-MM-DD format."
  });
});

test("doctor availability rejects invalid status before accessing Supabase", async () => {
  const response = await saveAvailability({
    env: {},
    request: new Request("https://sehat.example/api/doctor/availability", {
      method: "POST",
      headers: {
        Authorization: "Bearer user-token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        hospitalId: "h1",
        doctorId: "d1",
        date: "2026-11-22",
        status: "pending"
      })
    })
  });
  assert.equal(response.status, 400);
});
