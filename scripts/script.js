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

        const params = new URLSearchParams(window.location.search);
        const carID = params.get("carID"); // Get the tuneID query parameter
        if (carID)
        {
            displayCar(carID);
        }
        else 
        {
            displayCars(allCars); 
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function displayCar(carID) {
    const carContainer = document.getElementById('car-container');
    const row = allCars.filter(car => car[0].replace(/ /g, '_') == carID)[0];
    carContainer.innerHTML = `
        <button onclick="displayCars(allCars)">Back</button>
        <button onclick="gotoTuner()">View in Tuner</button>
        <h2>${row[4]} ${row[7]}</h2>
        <img src="../image/car/${row[0].replace(/\s+/g, '').replace(/\./g, '').replace(/\//g, '')}.png" 
             onerror="this.onerror=null; this.src='../image/car/default.png';">
        <p>${nD(row[8])}</p>
        <p>Tier ${nD(row[9])}</p>
        <p>Weight: ${nD(row[12])}</p> 
        <p>Power: ${nD(row[14])}</p>
        <p>Drivetrain: ${nD(row[10])}</p>
        <p>Gearbox: ${nD(row[11])}-speed</p>
        <p>Assists: ${assistHelper(row[16],row[17])}</p>
        <p>In-game top speed: ${nD(row[18])}</p>
    `;
}

function gotoTuner() {
    const params = new URLSearchParams(window.location.search);
    const carID = params.get("carID");
    window.location.href = `tuner.html?carID=${carID}`;
}

// Function to display the cars based on the filtered data
function displayCars(rows) {
    const carContainer = document.getElementById('car-container');
    carContainer.innerHTML = ''; // Clear any existing cars

    // remove params if there is any
    history.replaceState({}, "", window.location.pathname);

    rows.forEach(row => {
        let carPanel = document.createElement('div');
        carPanel.classList.add('car-panel');

        let carID = row[0].replace(/\s+/g, '').replace(/\./g, '').replace(/\//g, ''); // Remove whitespace for image lookup
        let imagePath = `../image/car/${carID}.png`;

        carPanel.innerHTML = `
            <img src="${imagePath}" alt="${row[1]}" class="car-image" onerror="this.onerror=null; this.src='../image/car/default.png';">
            <h3>${row[4]} ${row[7]}</h3>
            <p>(${row[0]})</p>
            <p>${row[8]}</p>
            <p>Tier ${row[9]}</p>
            <p>${row[12]}; ${row[14]}</p>
        `;

        carPanel.addEventListener('click', () => {
            let url = new URL(window.location.href);
            let carID = row[0].replace(/ /g, '_')
            url.searchParams.set("carID", carID); // Set new query parameter
            history.pushState({}, "", url); // Update URL without reloading
            displayCar(carID);
        });

        carContainer.appendChild(carPanel);
    });
}

function openModal(row) {
    const modal = document.getElementById('car-modal');
    const modalContent = document.getElementById('modal-content');

    modalContent.innerHTML = `
        <h2>${row[4]} ${row[7]}</h2>
        <img src="../image/car/${row[0].replace(/\s+/g, '').replace(/\./g, '').replace(/\//g, '')}.png" 
             onerror="this.onerror=null; this.src='../image/car/default.png';">
        <p>${nD(row[8])}</p>
        <p>Tier ${nD(row[9])}</p>
        <p>Weight: ${nD(row[12])}</p> 
        <p>Power: ${nD(row[14])}</p>
        <p>Drivetrain: ${nD(row[10])}</p>
        <p>Gearbox: ${nD(row[11])}-speed</p>
        <p>Assists: ${assistHelper(row[16],row[17])}</p>
        <p>In-game top speed: ${nD(row[18])}</p>
        <button onclick="closeModal()">Close</button>
    `;
    modal.style.display = "block";
}

function assistHelper(tcs, abs) {
    tcs = tcs.toLowerCase() === "true";
    abs = abs.toLowerCase() === "true";
    if (abs && tcs)
    {
        return 'ABS, TCS';
    }
    if (abs && !tcs)
    {
        return 'ABS';
    }
    if (!abs && tcs)
    {
        return 'TCS';
    }
    else
    {
        return '-';
    }
}

function nD(row) {
    if (!row)
    {
        return "No data.";
    }
    return row;
}

function closeModal() {
    document.getElementById('car-modal').style.display = "none";
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