let cars = [];
let selectedCar = [];
let tune = {'forcedinduction':'stock', 'brakebias': 50};

const subcategories = {
  'ecu':['ecu'],
  'brakes':['brakes'],
  'weightreduction':['weightreduction'],
  'injectors':['injectors'],
  'engine':['internals','block'],
  'airflow':['intake','exhaust'],
  'forcedinduction':['turbo','sequential','supercharger']
};

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
      //cars = rows; // Store all rows in the global variable
      cars = formatResponse(rows);

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

function formatResponse(rows) {
  let i = 0;
  let result = [];
  rows.forEach(row => {
    let car = {};
    car.carID = row[0];
    car.realName = row[7];
    car.price = row[8];
    car.tier = row[9];
    car.weight = row[12].split(' ')[0];
    car.baseHP = row[13];
    car.peakHP = row[14];
    car.maxHP = row[15];
    car.brakeForce = row[16].split(' ')[0];
    result[i] = car;
    i++;
  })
  return result;
}

function selectCar(carID) {
  cars.forEach(car => {
    if (car.carID == carID) {
      selectedCar = car;
      console.log(`selected car: ${selectedCar.carID}`);

      let url = new URL(window.location.href);
      let carID = car.carID.replace(/ /g, '_')
      url.searchParams.set("carID", carID); // Set new query parameter
      history.pushState({}, "", url); // Update URL without reloading

      let tunerCar = document.getElementById('tuner-car');
      tunerCar.innerHTML = `Selected Car: ${selectedCar.carID}`;
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
      content.innerHTML = `
      ${selectedCar.carID} ///
      HP: ${selectedCar.peakHP} -> ${calculateHP()}
      `;
      break;
    case 'forcedinduction':
      selectInduction(tune['forcedinduction']);
    case 'engine':
    case 'ecu':
    case 'airflow':
    case 'injectors':
    case 'weightreduction':
    case 'brakes':
      selectGeneralDefault(category);
      break;
    default:
      break;
  }
}

function selectGeneralDefault(category) {
  const subcats = subcategories[category];
  let i = 0;
  subcats.forEach(subcat => {
    selectGeneral(tune[subcat] ? tune[subcat] : 0, subcat, i);
    i = i+1;
  });
}

function selectInduction(category) {
  tune['forcedinduction'] = category;
  const x = subcategories['forcedinduction'];

  // Set old categories value to 0
  let i = 0;
  x.forEach(subcat => {
    if (subcat != category)
      selectGeneral(0, subcat, i)
    i = i + 1;
  });

  // Update visual
  const conts = document.getElementsByClassName('induction-select');
  Array.from(conts).forEach(cont => {
    if (cont.getAttribute('id') == category)
      cont.classList.add('selected-induction');
    else
      cont.classList.remove('selected-induction');
  });
}

function selectInductionStage(n, category, i) {
  if (tune['forcedinduction'] == category)
    selectGeneral(n, category, i);
}

function selectGeneral(n, category, i) {
  stageSelect(n,i);
  tune[category] = n;
  //console.log(tune);
  switch(category) {
    case 'internals':
    case 'block':
    case 'turbo':
    case 'supercharger':
    case 'sequential':
    case 'ecu':
    case 'intake':
    case 'exhaust':
    case 'injectors':
      updateHPDescription(n, category,i);
      break;
    case 'weightreduction':
      updateWeightDescription(n, category);
      break;
    case 'brakes':
      updateBRDescription(n, category);
      incrementInput('brakebias', 0);
      break;
  }
}

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function incrementInput(category, x) {
  const inputs = document.getElementsByClassName('input-value');
  const input = inputs[0];
  const maxVal = input.max;
  const minVal = input.min;
  let newVal = clamp(tune[category] + x, minVal, maxVal);
  input.value = newVal;
  tune[category] = newVal;
}

function editInput(category) {
  const inputs = document.getElementsByClassName('input-value');
  const input = inputs[0];
  const maxVal = input.max;
  const minVal = input.min;
  let newVal = clamp(input.value, minVal, maxVal);
  input.value = newVal;
  tune[category] = newVal;
}

function updateHPDescription(n, category, i) {
  const calc = document.getElementsByClassName('stage-calc');
  const desc = document.getElementsByClassName('stage-description');
  const x = JSON.parse(desc[i].getAttribute('data-values'));
  desc[i].innerHTML = `Stage ${n}: ${x[n]}% increase`;
  calc[i].innerHTML = `horsepower: ${calculateHP()} HP`;
}

function updateBRDescription(n, category) {
  const calc = document.getElementsByClassName('stage-calc');
  const desc = document.getElementsByClassName('stage-description');
  const x = JSON.parse(desc[0].getAttribute('data-values'));
  let brakeForce = Number(selectedCar.brakeForce) * (x[n] / 100);
  desc[0].innerHTML = `Stage ${n}: ${x[n] - 100}% increase`;
  calc[0].innerHTML = `Brake Force: ${brakeForce} Nm`;
}

function updateWeightDescription(n, category) {
  const calc = document.getElementsByClassName('stage-calc');
  const desc = document.getElementsByClassName('stage-description');
  const x = JSON.parse(desc[0].getAttribute('data-values'));
  let weight = Number(selectedCar.weight) * (x[n] / 100);
  desc[0].innerHTML = `Stage ${n}: ${100 - x[n]}% decrease`;
  calc[0].innerHTML = `Weight: ${weight} lbs`;
}

function stageSelect(stage, i) {
  const cont = document.getElementsByClassName('stages-container');
  Array.from(cont[i].children).forEach(child => {
    if (!child.classList.contains('induction-select'))
    {
      if (child.innerHTML == stage)
        child.classList.add('selected-stage');
      else 
        child.classList.remove('selected-stage');
    }
  });
}

function calculateHP() {
  let baseHP = tune.forcedinduction == 'stock' ? Number(selectedCar.peakHP) : Number(selectedCar.baseHP);
  const dHP = Number(selectedCar.maxHP) - Number(selectedCar.baseHP);
  const categories = [[tune.sequential, 60], [tune.turbo, 50], [tune.supercharger, 45], [tune.internals, 14], [tune.injectors, 10], [tune.block, 6], [tune.intake, 4], [tune.ecu, 3], [tune.exhaust,3]];
  categories.forEach(tuple => {
    const stage = tuple[0];
    const contribution = tuple[1];
    if (stage)
      baseHP = baseHP + (dHP * (contribution / 100) * (stage / 3));
  });
  return baseHP;
}