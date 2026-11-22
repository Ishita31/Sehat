let currentLanguage = "en";
let hospitals = [];
let doctors = [];
let publicAvailability = [];

async function apiGet(path) {
  const response = await fetch(path);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
}

function formatTime(time) {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function renderDoctors() {
  const grid = document.getElementById("doctorGrid");
  const summary = document.getElementById("availabilitySummary");
  grid.innerHTML = "";

  const availableCount = doctors.filter(doctor =>
    publicAvailability.some(item =>
      item.doctor_id === doctor.id && item.availability_status === "available"
    )
  ).length;

  summary.textContent = currentLanguage === "hi"
    ? `चुनी गई तारीख पर ${doctors.length} में से ${availableCount} डॉक्टर उपलब्ध हैं`
    : `${availableCount} of ${doctors.length} doctors available on the selected date`;

  if (doctors.length === 0) {
    grid.textContent = currentLanguage === "hi"
      ? "इस अस्पताल में अभी कोई डॉक्टर सूचीबद्ध नहीं हैं।"
      : "No doctors are currently listed at this hospital.";
    return;
  }

  doctors.forEach(doctor => {
    const schedule = publicAvailability.find(item => item.doctor_id === doctor.id);
    const card = document.createElement("article");
    card.className = "doctor-card";

    const top = document.createElement("div");
    top.className = "doctor-top";
    const avatar = document.createElement("div");
    avatar.className = "doctor-avatar";
    avatar.textContent = String(doctor.name).split(" ").filter(Boolean).slice(-2)
      .map(word => word[0]).join("").toUpperCase();
    const details = document.createElement("div");
    details.innerHTML = `<h3>${escapeHtml(doctor.name)}</h3><div class="qualification">${escapeHtml(doctor.qualification || "")}</div>`;
    top.append(avatar, details);

    const availability = document.createElement("div");
    availability.className = "availability";
    const status = document.createElement("strong");
    const note = document.createElement("span");

    if (schedule?.availability_status === "available") {
      availability.classList.add("is-available");
      status.textContent = currentLanguage === "hi" ? "उपलब्ध" : "Available";
      note.textContent = `Consultation: ${formatTime(schedule.consultation_start)} – ${formatTime(schedule.consultation_end)}`;
    } else if (schedule?.availability_status === "fully_booked") {
      availability.classList.add("is-unavailable");
      status.textContent = "Fully booked";
      note.textContent = "No consultation slots are currently available.";
    } else if (schedule?.availability_status === "unavailable") {
      availability.classList.add("is-unavailable");
      status.textContent = currentLanguage === "hi" ? "उपलब्ध नहीं" : "Not available";
      note.textContent = "The doctor is not available on this date.";
    } else {
      status.textContent = "Availability not published yet";
      note.textContent = "Please check another date.";
    }

    availability.append(status, note);
    card.append(top, availability);
    grid.appendChild(card);
  });
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

async function loadHospitals() {
  const select = document.getElementById("hospitalSelect");
  try {
    const body = await apiGet("/api/hospitals");
    hospitals = body.hospitals;
    select.innerHTML = '<option value="">Select hospital</option>';
    hospitals.forEach(hospital => {
      const option = document.createElement("option");
      option.value = hospital.id;
      option.textContent = hospital.name;
      select.appendChild(option);
    });
  } catch (error) {
    select.innerHTML = '<option value="">Unable to load hospitals</option>';
    document.getElementById("availabilitySummary").textContent = error.message;
  }
}

async function loadDoctors() {
  const hospitalId = document.getElementById("hospitalSelect").value;
  const date = document.getElementById("publicAvailabilityDate").value;
  if (!hospitalId) return;

  const grid = document.getElementById("doctorGrid");
  grid.innerHTML = "<p>Loading doctors...</p>";

  try {
    const [doctorBody, availabilityBody] = await Promise.all([
      apiGet(`/api/doctors?hospitalId=${encodeURIComponent(hospitalId)}`),
      apiGet(`/api/availability?hospitalId=${encodeURIComponent(hospitalId)}&date=${encodeURIComponent(date)}`)
    ]);
    doctors = doctorBody.doctors;
    publicAvailability = availabilityBody.availability;
    renderDoctors();
  } catch (error) {
    grid.textContent = error.message;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("publicAvailabilityDate");
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().split("T")[0];
  dateInput.value = today.toISOString().split("T")[0];
  document.getElementById("hospitalSelect").addEventListener("change", loadDoctors);
  dateInput.addEventListener("change", loadDoctors);

  document.getElementById("languageBtn").addEventListener("click", function () {
    currentLanguage = currentLanguage === "en" ? "hi" : "en";
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll("[data-en]").forEach(element => {
      element.innerHTML = element.getAttribute(`data-${currentLanguage}`);
    });
    this.textContent = currentLanguage === "en" ? "हिन्दी" : "English";
    renderDoctors();
  });

  document.getElementById("trackingForm").addEventListener("submit", event => {
    event.preventDefault();
    const message = document.getElementById("trackingMessage");
    message.style.display = "block";
    message.textContent = "Appointment tracking will be available after the booking API is deployed.";
  });

  loadHospitals();
});
