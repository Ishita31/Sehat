document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("staffLoginForm");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.getElementById("staffLoginMessage");
    const email = document.getElementById("staffEmail").value.trim();
    const password = document.getElementById("staffPassword").value;

    message.style.display = "block";
    message.textContent = "Checking login...";

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Login failed.");

      sessionStorage.setItem("sehatAccessToken", body.accessToken);
      sessionStorage.setItem("sehatStaff", JSON.stringify(body.staff));

      if (body.staff.role !== "doctor") {
        message.textContent =
          `Welcome, ${body.staff.full_name}. Role ${body.staff.role} has no workspace in this release.`;
        return;
      }

      const assignmentsResponse = await fetch("/api/doctor/assignments", {
        headers: { Authorization: `Bearer ${body.accessToken}` }
      });
      const assignmentsBody = await assignmentsResponse.json();
      if (!assignmentsResponse.ok) {
        throw new Error(assignmentsBody.error || "Unable to load doctor assignments.");
      }

      window.sehatDoctorAssignments = assignmentsBody.assignments;
      const hospitalSelect = document.getElementById("availabilityHospital");
      hospitalSelect.innerHTML = "";
      assignmentsBody.assignments.forEach(assignment => {
        const option = document.createElement("option");
        option.value = assignment.hospital_id;
        option.dataset.doctorId = assignment.doctor_id;
        option.textContent = assignment.hospital_name;
        hospitalSelect.appendChild(option);
      });

      document.getElementById("staffLogin").hidden = true;
      document.getElementById("doctorAvailability").hidden = false;
      document.getElementById("doctorAvailability").scrollIntoView({ behavior: "smooth" });
      message.textContent = "";
    } catch (error) {
      message.textContent = error.message;
    }
  });

  const status = document.getElementById("availabilityStatus");
  const times = document.getElementById("consultationTimes");
  const start = document.getElementById("consultationStart");
  const end = document.getElementById("consultationEnd");

  status.addEventListener("change", () => {
    const available = status.value === "available";
    times.hidden = !available;
    start.required = available;
    end.required = available;
  });

  document.getElementById("availabilityForm").addEventListener("submit", async event => {
    event.preventDefault();
    const message = document.getElementById("availabilityMessage");
    const token = sessionStorage.getItem("sehatAccessToken");
    const hospitalSelect = document.getElementById("availabilityHospital");
    const selectedOption = hospitalSelect.selectedOptions[0];

    message.style.display = "block";
    if (!token || !selectedOption) {
      message.textContent = "Please log in again.";
      return;
    }

    message.textContent = "Saving availability...";
    try {
      const response = await fetch("/api/doctor/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hospitalId: hospitalSelect.value,
          doctorId: selectedOption.dataset.doctorId,
          date: document.getElementById("availabilityDate").value,
          status: status.value,
          startTime: start.value,
          endTime: end.value
        })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to save availability.");
      message.textContent = "Availability saved successfully.";
    } catch (error) {
      message.textContent = error.message;
    }
  });
});
