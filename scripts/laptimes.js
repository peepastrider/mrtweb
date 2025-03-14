let times = [];

// This function loads the tune data from the Google Sheets API
async function loadData() {
    const sheetID = '1Eco30_8EtgNr4YuUzkCGX26-NoP5AR4-pkHRKKByLJE';
    const sheetName = 'Laptimes'; 
    const apiURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

    try {
        let response = await fetch(apiURL);
        let data = await response.text();

        const rows = csvToArray(data);
        const laptimeBoard = document.getElementById('laptime-board');
        if (!laptimeBoard) return;

        times = rows;
        
        document.getElementById('course-select').addEventListener("change", function () {
          displayTimes();
        });

        document.getElementById('map-select').addEventListener("change", function () {
          updateCourseOptions(this.value);
          displayTimes();
        });

        const mapSelect = document.getElementById('map-select');
        updateCourseOptions(mapSelect.value);
        displayTimes();

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Convert CSV to an array of rows and columns
function csvToArray(csv) {
  return csv.split("\n").slice(1).map(row => 
      row.split(",").map(cell => cell.replace(/^"|"$/g, '').trim())  // Remove surrounding quotes and trim
  );
}

function updateCourseOptions(map) {
  const courseSelect = document.getElementById('course-select');
  courseSelect.innerHTML = '';
  let html = [];
  switch(map) {
    case "Ichikawa Region":
      html = ["Clockwise", "Counterclockwise", "Keikokudoro Downhill", "Keikokudoro Uphill", "Turnpike Downhill", "Turnpike Uphill"]; break;
    case "Mt. Otsuki":
      html = ["Downhill", "Uphill"]; break;
    case "Tsukuba":
      html = ["Tsukuba Circuit"]; break;
    case "C1 Expressway":
      html = ["Clockwise", "Counterclockwise"]; break;
    default:
      break;
  }
  html.forEach(course => {
    courseSelect.innerHTML += `<option>${course}</option>`;
  });
}

function displayTimes() {
  const laptimeEntries = document.getElementById('laptime-entries');
  laptimeEntries.innerHTML = '';

  const mapSelect = document.getElementById('map-select');
  const courseSelect = document.getElementById('course-select');
  const searchBar = document.getElementById('search-bar');
  const map = mapSelect.value;
  const course = courseSelect.value;
  const query = searchBar.value.toLowerCase();
  
  console.log(`Finding all entries for ${map}, ${course}.`);  

  let index = 1;
  let filteredTimes = times.filter(time => time[7] == map && time[8] == course && time[1].toLowerCase().includes(query));
  filteredTimes.forEach(row => {
    let panel = document.createElement('div');
    panel.classList.add('laptime');
    console.log(row);
    let iconsrc = row[9] == "TRUE" ? "tuned" : "stock";
    iconsrc = row[10] ? "tuned2" : iconsrc;
    const linktag = row[10] ? `<a href="tunes.html?tuneID=${row[10]}">` : `<a>`;
    panel.innerHTML = `
    <div class="rank">${index}</div>
    <div class="player-info">
      <div class="name">${row[2]}</div>
      <div class="car">${row[1]}</div>
    </div>
    <div class="time">${row[3]}</div>
    <div class="split">${row[4]}</div>
    <div class="split">${row[5]}</div>
    <div class="split">${row[6]}</div>
    ${linktag}
      <img src="../image/icon/${iconsrc}.png" class="tuned"></img>
    </a>
    `;
    laptimeEntries.appendChild(panel);
    index = index+1;
  });
  const courseName = document.getElementById('laptime-course');
  courseName.innerHTML = course;
}

// Initialize the page when loaded
window.addEventListener("load", () => {
  loadData();
});