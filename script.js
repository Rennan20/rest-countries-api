/* ========================================
   DOM ELEMENTS
======================================== */

// Main page elements
const countriesContainer = document.querySelector(".countries");
const searchInput = document.querySelector("#search");
const regionFilter = document.querySelector("#region-filter");
const countryDetail = document.querySelector(".country-detail");
const controls = document.querySelector(".controls");

// Theme switcher elements
const themeToggle = document.querySelector(".theme-toggle");
const themeLabel = document.querySelector(".theme-label");

// Store all countries to support searching, filtering, and navigation
let allCountries = [];

/* ========================================
   FETCH COUNTRY DATA
======================================== */

// Load country data from the local JSON file
async function loadCountries() {
  try {
    const response = await fetch("./data.json");

    // Stop execution if the request was unsuccessful
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    // Store the data and render the initial country list
    allCountries = await response.json();
    renderCountries(allCountries);
  } catch (error) {
    console.error("Error loading countries:", error);
  }
}

/* ========================================
   DARK MODE
======================================== */

// Toggle dark mode and update the button label
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Check whether dark mode is currently active
  const isDarkMode = document.body.classList.contains("dark-mode");

  themeLabel.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
});

/* ========================================
   RENDER COUNTRY CARDS
======================================== */

// Generate a card for each country and insert it into the page
function renderCountries(countries) {
  countriesContainer.innerHTML = countries
    .map((country) => {
      // Format the population with thousands separators
      const populationFormatted = country.population
        ? country.population.toLocaleString("en-US")
        : "N/A";

      // Provide a fallback when the capital is unavailable
      const capitalName = country.capital ? country.capital : "N/A";

      return `
        <article class="country-card" data-country="${country.name}">
          <img src="${country.flags.svg}" alt="Flag of ${country.name}" />

          <div class="country-info">
            <h2>${country.name}</h2>

            <p><span>Population:</span> ${populationFormatted}</p>
            <p><span>Region:</span> ${country.region}</p>
            <p><span>Capital:</span> ${capitalName}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

/* ========================================
   SEARCH AND REGION FILTER
======================================== */

// Filter countries by name and selected region
function filterCountries() {
  // Normalize the search input for case-insensitive matching
  const searchTerm = searchInput.value.toLowerCase().trim();
  const selectedRegion = regionFilter.value.toLowerCase();

  const filteredCountries = allCountries.filter((country) => {
    // Check whether the country name contains the search term
    const matchesSearch = country.name.toLowerCase().includes(searchTerm);

    // Match the selected region or include all regions if none is selected
    const matchesRegion =
      selectedRegion === "" || country.region.toLowerCase() === selectedRegion;

    // Both conditions must be true
    return matchesSearch && matchesRegion;
  });

  // Update the displayed cards without modifying the original data
  renderCountries(filteredCountries);
}

// Update the results whenever the user types or changes the region
searchInput.addEventListener("input", filterCountries);
regionFilter.addEventListener("change", filterCountries);

/* ========================================
   COUNTRY CARD NAVIGATION
======================================== */

// Use event delegation to handle clicks on dynamically generated cards
countriesContainer.addEventListener("click", (event) => {
  // Find the closest country card, even when a child element is clicked
  const card = event.target.closest(".country-card");

  if (!card) return;

  // Retrieve the country name stored in the card's data attribute
  const countryName = card.dataset.country;

  // Find the corresponding country in the original dataset
  const selectedCountry = allCountries.find(
    (country) => country.name === countryName,
  );

  // Display the selected country's details
  showCountryDetail(selectedCountry);
});

/* ========================================
   BACK BUTTON NAVIGATION
======================================== */

// Return to the country list without resetting search or filter values
countryDetail.addEventListener("click", (event) => {
  const backButton = event.target.closest(".back-button");

  if (!backButton) return;

  // Hide the detail view and restore the country list
  countryDetail.classList.add("hidden");
  controls.classList.remove("hidden");
  countriesContainer.classList.remove("hidden");
});

/* ========================================
   COUNTRY DETAILS
======================================== */

// Display detailed information about the selected country
function showCountryDetail(country) {
  // Format population and handle missing capital data
  const populationFormatted = country.population
    ? country.population.toLocaleString("en-US")
    : "N/A";

  const capitalName = country.capital ? country.capital : "N/A";

  // Convert language objects into a comma-separated list
  const languagesList = country.languages
    ? country.languages.map((lang) => lang.name).join(", ")
    : "N/A";

  // Convert currency objects into a comma-separated list
  const currenciesList = country.currencies
    ? country.currencies.map((curr) => curr.name).join(", ")
    : "N/A";

  // Convert neighboring country codes into readable country names
  const borderButtons = country.borders
    ? country.borders
        .map((borderCode) => {
          // Find the neighboring country using its three-letter code
          const borderCountry = allCountries.find((country) => {
            return country.alpha3Code === borderCode;
          });

          // Generate a button only when the neighboring country exists
          return borderCountry
            ? `<button class="border-button">${borderCountry.name}</button>`
            : "";
        })
        // Remove empty results and combine the buttons into HTML
        .filter(Boolean)
        .join("")
    : "N/A";

  // Switch from the country list to the detail view
  controls.classList.add("hidden");
  countriesContainer.classList.add("hidden");
  countryDetail.classList.remove("hidden");

  // Render the selected country's information
  countryDetail.innerHTML = `
    <button type="button" class="back-button">
      ← Back
    </button>

    <article class="country-detail-content">
      <img src="${country.flags.svg}" alt="Flag of ${country.name}" />

      <div class="country-details">
        <h1>${country.name}</h1>

        <div class="details-columns">
          <div class="details-primary">
            <p><span>Native Name:</span> ${country.nativeName}</p>
            <p><span>Population:</span> ${populationFormatted}</p>
            <p><span>Region:</span> ${country.region}</p>
            <p><span>Sub Region:</span> ${country.subregion}</p>
            <p><span>Capital:</span> ${capitalName}</p>
          </div>

          <div class="details-secondary">
            <p><span>Top Level Domain:</span> ${country.topLevelDomain[0]}</p>
            <p><span>Currencies:</span> ${currenciesList}</p>
            <p><span>Languages:</span> ${languagesList}</p>
          </div>
        </div>

        <div class="border-section">
          <p><span>Border Countries:</span></p>

          <div class="border-countries">
            ${borderButtons}
          </div>
        </div>
      </div>
    </article>
  `;
}

/* ========================================
   INITIALIZE APPLICATION
======================================== */

// Fetch country data when the script loads
loadCountries();
