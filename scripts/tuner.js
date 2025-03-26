let cars = [];
let selectedCar = [];
let tune = [];

window.addEventListener("load", () => {
  loadData();
});

function csvToArray(csv) {
  return csv.split("\n").slice(1).map(row => 
      row.split(",").map(cell => cell.replace(/^"|"$/g, '').trim())  // Remove surrounding quotes and trim
  );
}

async function loadData() {
  const sheetID = '1uThRBT6DRzCn_vGh_2uAs9odGktC_Cg7_DQWgciZ-BY'; 
  const apiURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv`;

  try {
      let response = await fetch(apiURL);
      let data = await response.text();
      const rows = csvToArray(data);
      cars = rows; // Store all rows in the global variable

      const params = new URLSearchParams(window.location.search);
      const carID = params.get("carID"); // Get the tuneID query parameter
      if (carID)
      {
        selectCar(carID.replace(/_/g, ' '));
      }
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

function selectCar(carID) {
  cars.forEach(car => {
    if (car[0] == carID) {
      selectedCar = car;
      console.log(`selected car: ${selectedCar[0]}`);

      let url = new URL(window.location.href);
      let carID = car[0].replace(/ /g, '_')
      url.searchParams.set("carID", carID); // Set new query parameter
      history.pushState({}, "", url); // Update URL without reloading

      let tunerCar = document.getElementById('tuner-car');
      tunerCar.innerHTML = `Selected Car: ${selectedCar[0]}`;
    }
  });
}

async function loadCategory(category) {
  try {
      let response = await fetch(`../tuner-categories/${category}.html`);
      let categoryHTML = await response.text();
      const tuneInput = document.getElementById('tune-input');
      tuneInput.innerHTML = categoryHTML;
      initializeValues(category);
  } catch (error) {
      console.error("Error loading tuning category:", error);
  }
}

function initializeValues(category) {
  switch(category) {
    case 'overview':
      const content = document.getElementById('overview-content');
      content.innerHTML = `${selectedCar[0]}, ${selectedCar[1]}`;
      break;
    default:
      break;
  }
}

function stageSelect(number) {
  const cont = document.getElementById('stages-container');
  Array.from(cont.children).forEach(child => {
    if (child.innerHTML == number) {
      child.classList.add('selected-stage');
    }
    else {
      child.classList.remove('selected-stage');
    }
  });

  const desc = document.getElementById('stage-description');
  const x = JSON.parse(desc.getAttribute('data-values'));
  desc.innerHTML = `Stage ${number}: ${x[number]}% increase`;

  // TODO: update tune code
}

function ecu(n) {
  stageSelect(n);
  const calc = document.getElementById('stage-calc');
  const desc = document.getElementById('stage-description');
  const x = JSON.parse(desc.getAttribute('data-values'));
  calc.innerHTML = `horsepower: ${x[n]}`;
}