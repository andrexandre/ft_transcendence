"use strict";
// Create a simple SPA that switches content when a button is clicked
document.getElementById("app").innerHTML = `
  <h1>Welcome to My SPA</h1>
  <button id="toggle-button">Show Content</button>
  <div id="content" style="display: none;">
    <p>This is the content of the SPA!</p>
  </div>
`;
// Add click event to toggle content visibility
const button = document.getElementById("toggle-button");
const content = document.getElementById("content");
button.addEventListener("click", () => {
    content.style.display = content.style.display === "none" ? "block" : "none";
    button.textContent = content.style.display === "none" ? "Show Content" : "Hide Content";
});
