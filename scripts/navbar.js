// Function to load navbar from navbar.html
async function loadNavbar() {
  try {
      let response = await fetch("../navbar.html");
      let navbarHTML = await response.text();
      document.body.insertAdjacentHTML("afterbegin", navbarHTML);
  } catch (error) {
      console.error("Error loading navbar:", error);
  }
}

// Call the function when the page loads
window.onload = loadNavbar;
