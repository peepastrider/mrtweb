let allCars = []; // Global array to store all cars

// This function loads the car data from the Google Sheets API
async function loadData() {
    const sheetID = '1uThRBT6DRzCn_vGh_2uAs9odGktC_Cg7_DQWgciZ-BY'; 
    const apiURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv`;

    try {
        let response = await fetch(apiURL);
        let data = await response.text();

        const rows = csvToArray(data);
        const carContainer = document.getElementById('car-container');
        if (!carContainer) return;

        carContainer.innerHTML = ''; // Clear existing content

        allCars = rows; // Store all rows in the global variable

        displayCars(allCars); // Display all cars initially
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to display the cars based on the filtered data
function displayCars(rows) {
    const carContainer = document.getElementById('car-container');
    carContainer.innerHTML = ''; // Clear any existing cars

    rows.forEach(row => {
        let carPanel = document.createElement('div');
        carPanel.classList.add('car-panel');

        // Assuming row[0] is Car ID, row[1] is Model, row[2] is Year, etc.
        let carID = row[0].replace(/\s+/g, '').replace(/\./g, '').replace(/\//g, ''); // Remove whitespace for image lookup
        let imagePath = `../image/${carID}.png`;

        carPanel.innerHTML = `
            <img src="${imagePath}" alt="${row[1]}" class="car-image" onerror="this.onerror=null; this.src='../image/default.png';">
            <h3>${row[4]} ${row[1]} ${row[2]}</h3>
            <p>(${row[4]} ${row[7]})</p>
            <p>${row[8]}</p>
            <p>Tier ${row[9]}</p>
            <p>${row[12]}; ${row[13]}</p>
        `;

        carContainer.appendChild(carPanel);
    });
}

// Convert CSV to an array of rows and columns
function csvToArray(csv) {
    return csv.split("\n").slice(1).map(row => 
        row.split(",").map(cell => cell.replace(/^"|"$/g, '').trim())  // Remove surrounding quotes and trim
    );
}

// Function to filter cars based on search input and selected tiers
function filterCars() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();

    // Get selected tiers from the checkboxes
    const selectedTiers = Array.from(document.querySelectorAll('#tier-checkboxes input:checked'))
                                .map(checkbox => checkbox.value);


    // Filter the cars based on search and selected tiers
    const filteredCars = allCars.filter(row => {
        // Check if the search term matches any part of the relevant fields
        const matchesSearch =  row[0].toLowerCase().includes(searchTerm) // Car ID  // Year

        const matchesTier = selectedTiers.includes(row[9]); // Tier filter

        return matchesSearch && matchesTier; // Filter cars based on both search term and selected tiers
    });

    displayCars(filteredCars); // Display the filtered cars
}

// Add event listeners to the tier checkboxes to trigger filtering when their state changes
function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll('#tier-checkboxes input');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterCars); // Call filterCars when any checkbox is toggled
    });
}

// Toggle the visibility of the checkbox container
function toggleTierCheckboxes() {
    const checkboxesContainer = document.getElementById('tier-checkboxes');
    const isHidden = checkboxesContainer.style.display === 'none';

    // If the dropdown is hidden, show it
    if (isHidden) {
        checkboxesContainer.style.display = 'block';
    } else {
        checkboxesContainer.style.display = 'none';
    }
}

// Initialize the page when loaded
window.addEventListener("load", () => {
    loadData();
    setupCheckboxListeners(); // Setup event listeners for checkboxes
    document.getElementById('tier-checkboxes').style.display = 'none'; // Ensure dropdown is hidden initially
});