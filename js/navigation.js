document.addEventListener("DOMContentLoaded", () => {
  const publicSections = [
    document.getElementById("doctors"),
    document.getElementById("tracking")
  ];
  const loginSection = document.getElementById("staffLogin");

  document.getElementById("staffLoginButton").addEventListener("click", () => {
    publicSections.forEach(section => { section.hidden = true; });
    loginSection.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const brand = document.querySelector(".brand");
  brand.addEventListener("click", event => {
    event.preventDefault();
    publicSections.forEach(section => { section.hidden = false; });
    loginSection.hidden = true;
    document.getElementById("doctorAvailability").hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
