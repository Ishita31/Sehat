import fs from "node:fs";
import path from "node:path";

const requiredFiles = [
  "index.html",
  "css/style.css",
  "js/modules/public.js",
  "js/auth.js",
  "js/navigation.js",
  "public/_headers",
  "functions/api/hospitals.js",
  "functions/api/doctors.js",
  "functions/api/availability.js",
  "functions/api/auth/login.js",
  "functions/api/doctor/assignments.js",
  "functions/api/doctor/availability.js"
];

const missing = requiredFiles.filter(file => !fs.existsSync(file));
if (missing.length) {
  throw new Error(`Missing required application files: ${missing.join(", ")}`);
}

fs.rmSync("dist", { recursive: true, force: true });
for (const file of [
  "index.html",
  "css/style.css",
  "js/auth.js",
  "js/navigation.js",
  "js/modules/public.js"
]) {
  const destination = path.join("dist", file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(file, destination);
}
fs.copyFileSync("public/_headers", "dist/_headers");

console.log("Sehat Pages assets built in dist/; Functions are discovered from functions/.");
