let tunes = [];

// This function loads the tune data from the Google Sheets API
async function loadData() {
    const sheetID = '1Eco30_8EtgNr4YuUzkCGX26-NoP5AR4-pkHRKKByLJE'; 
    const apiURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv`;

    try {
        let response = await fetch(apiURL);
        let data = await response.text();

        const rows = csvToArray(data);
        const tuneContainer = document.getElementById('tune-container');
        if (!tuneContainer) return;

        tuneContainer.innerHTML = ''; // Clear existing content

        tunes = rows; // Store all rows in the global variable

        const params = new URLSearchParams(window.location.search);
        const tuneID = params.get("tuneID"); // Get the tuneID query parameter
        if (tuneID)
            displayTune(tuneID);
        else 
            displayTunes(tunes); 
    } 
    catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Convert CSV to an array of rows and columns
function csvToArray(csv) {
  return csv.split("\n").slice(1).map(row => 
      row.split(",").map(cell => cell.replace(/^"|"$/g, '').trim())  // Remove surrounding quotes and trim
  );
}

function displayTunes(tunes) {
  const tuneContainer = document.getElementById('tune-container');
  tuneContainer.innerHTML = ``;

  // remove params if there is any
  history.replaceState({}, "", window.location.pathname);

  tunes.forEach(row => {
    let panel = document.createElement('div');
    panel.classList.add('car-panel');
    panel.innerHTML = `
    <h2>${row[3]}</h2>
    <p>${row[1]}</p>
    <p>Category: ${row[4]}</p>
    <p>Author: ${row[2]}</p>
    `;

    panel.addEventListener('click', () => {
      let url = new URL(window.location.href);
      let tuneID = row[0].replace(/ /g, '_')
      url.searchParams.set("tuneID", tuneID); // Set new query parameter
      history.pushState({}, "", url); // Update URL without reloading
      displayTune(tuneID);
    });

    tuneContainer.appendChild(panel);
  });
}

function displayTune(tuneID) {
  const tuneContainer = document.getElementById('tune-container');
  const row = tunes.filter(tune => tune[0] == tuneID)[0];
  console.log(row);
  tuneContainer.innerHTML = `
    <button onclick="displayTunes(tunes)">Back</button>
    <h2>${row[3]}</h2>
    <p>Car: ${row[1]}</p>
    <p>Category: ${row[4]}</p>
    <p>Author: ${row[2]}</p>
    <br>
    <p>"${row[5]}"</p>
    <br>
    <div class="tune-container">
      <div class="tune-column">
        <h3>Upgrades</h3>
        <p>Brakes: ${row[6]}</p>
        <p>Weight Reduction: ${row[7]}</p>
        <p>Injectors: ${row[8]}</p>
        <p>ECU: ${row[9]}</p>
        <p>Intake: ${row[10]}</p>
        <p>Exhaust: ${row[11]}</p>
        <p>Forced Induction: ${row[12]}, Stage ${row[13]}</p>
        <p>Internals: ${row[14]}</p>
        <p>Block: ${row[15]}</p>
      </div>
      <div class="column">
        <h3>Tuning</h3>
        <p>Brake Bias: ${row[16]}</p>
        <p>Steering Aggressiveness: ${row[17]}</p>
        <p>Steering Ratio: ${row[18]}</p>
        <p>Front Offset: ${row[19]}</p>
        <p>Rear Offset: ${row[20]}</p>
        <p>Front Height: ${row[21]}</p>
        <p>Front Camber: ${row[22]}</p>
        <p>Rear Height: ${row[23]}</p>
        <p>Rear Camber: ${row[24]}</p>
        <p>Front Dampening: ${row[25]}</p>
        <p>Front Stiffness: ${row[26]}</p>
        <p>Rear Dampening: ${row[27]}</p>
        <p>Rear Stiffness: ${row[28]}</p>
        <p>Final Drive: ${row[29]}</p>
        <p>Gear 1: ${row[30]}</p>
        <p>Gear 2: ${row[31]}</p>
        <p>Gear 3: ${row[32]}</p>
        <p>Gear 4: ${row[33]}</p>
        <p>Gear 5: ${row[34]}</p>
        <p>Gear 6: ${row[35]}</p>
        <p>Gear 7: ${row[36]}</p>
        <p>Gear 8: ${row[37]}</p>
        <p>Gear 9: ${row[38]}</p>
        <p>Gear 10: ${row[39]}</p>
      </div>
    </div>
  `;
}

// Initialize the page when loaded
window.addEventListener("load", () => {
  loadData();
});