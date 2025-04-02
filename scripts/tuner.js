import { loadCars } from './common/loadData.js';
import { compressTune, decompressTune } from './common/compression.js';

let cars = [];
let selectedCar = [];
let tune = {'forcedinduction':'stock', 'brakebias': 50, 'foffset': 0, 'roffset': 0, 'fstiff': 1000, 'fdamp': 100, 'rstiff': 1000, 'rdamp': 100, 
  'fheight': 0, 'rheight': 0, 'fcamber': 0, 'rcamber': 0, 'aggressiveness': 100, 'ratio': 22, 'finaldrive': 2};

const subcategories = {
  'ecu':['ecu'],
  'brakes':['brakes'],
  'weightreduction':['weightreduction'],
  'injectors':['injectors'],
  'engine':['internals','block'],
  'airflow':['intake','exhaust'],
  'forcedinduction':['turbo','sequential','supercharger']
};
const subtuning = {
  'brakes':['brakebias'],
  'offset':['foffset','roffset'],
  'coils':['fdamp','fstiff','rdamp','rstiff'],
  'stance':['fheight','fcamber','rheight','rcamber'],
  'steering':['aggressiveness', 'ratio'],
  'gears':['finaldrive']
};

// wip

function saveTune() {
  let code = compressTune(tune);
  let url = new URL(window.location.href);
  url.searchParams.set("tuneCode", code); // Set new query parameter
  history.pushState({}, "", url); // Update URL without reloading
  alert('URL has been updated with the tune code.');
  console.log(code);
}

document.addEventListener('DOMContentLoaded', async () => {
  cars = await loadCars();
  const params = new URLSearchParams(window.location.search);
  const carID = params.get("carID");
  const tuneCode = params.get("tuneCode");
  if (carID)
    selectCar(carID.replace(/_/g, ' '));
  loadCategoryButtons();

  if(tuneCode)
    tune = decompressTune(tuneCode);

  document.getElementById('search-bar').addEventListener('input', function() {
    selectCar(this.value);
  });
  document.getElementById('save-tune-button').addEventListener('click', () => saveTune());
});

function loadCategoryButtons() {
  const tuneOptions = document.querySelectorAll('#tune-options img');
  tuneOptions.forEach(img => {
      const category = img.src.split('/').pop().split('.')[0];
      img.addEventListener('click', () => loadCategory(category));
  });
}

async function loadCategory(category) {
  try {
      let response = await fetch(`../tuner-categories/${category}.html`);
      let categoryHTML = await response.text();
      const tuneInput = document.getElementById('tune-input');
      tuneInput.innerHTML = categoryHTML;
      selectCategoryVisual(category);
      loadTuneCategory(category);
      initializeValues(category);
  } 
  catch (error) {
      console.error("Error loading tuning category:", error);
  }
}

function selectCategoryVisual(category) {
  document.querySelectorAll('#tune-options img').forEach(img => {
    if (img.src.split('/').pop().split('.')[0] == category)
      img.classList.add('selected-category'); 
    else
      img.classList.remove('selected-category');
  });
}

function loadTuneCategory(category) {
  if (category == 'forcedinduction') {
    loadInduction();
    return;
  }
  // Stage buttons
  const upgrades = subcategories[category];
  if (upgrades) {
    upgrades.forEach(upgrade => {
      document.querySelectorAll(`#${upgrade} *`).forEach(stage => {
        stage.addEventListener('click', () => selectGeneral(stage.innerHTML,upgrade));
      });
    });
  }
  // Inputs
  const inputs = subtuning[category];
  if (inputs) {
    inputs.forEach(input => {
      document.querySelectorAll(`.${input} .button`).forEach(button => {
        button.addEventListener('click', () => incrementInput(input, Number(button.innerHTML)));
      });
      document.querySelectorAll(`.${input} .input-value`).forEach(input => {
        input.addEventListener('blur', () => editInput(input.getAttribute('id')));
      });
    });
  }
}

function loadInduction() {
  document.querySelectorAll('.stages-container').forEach(container => {
    let category = container.getAttribute('id');
    Array.from(container.children).forEach(child => {
      if(child.classList.contains('induction-select'))
        child.addEventListener('click', () => selectInduction(category));
      else
        child.addEventListener('click', () => selectInductionStage(child.innerHTML, category));
    });
  });
}

// -------------------------------
// to be reviewed code starts here
// -------------------------------

function selectCar(carID) {
  cars.forEach(car => {
    if (car.carID == carID) {
      selectedCar = car;
      console.log(`selected car: ${selectedCar.carID}`);

      let url = new URL(window.location.href);
      let carID = car.carID.replace(/ /g, '_')
      url.searchParams.set("carID", carID); // Set new query parameter
      history.pushState({}, "", url); // Update URL without reloading

      document.getElementById('tuner-car').innerHTML = `Selected Car: ${selectedCar.carID}`;
    }
  });
}

function createGears() {
  const maxVal = 6.5;
  const minVal = 0.5;
  const stockFD = 2.92;

  let stockGears = [2.7, 2.1, 1.85, 1.35, 1.02, 0, 0, 0, 0, 0];
  if (tune['gear1'])
    for (let i = 1; i <= selectedCar.gears; i++)
      stockGears[i-1] = tune[`gear${i}`];

  document.getElementById('finaldrive').setAttribute('value', stockFD);
  const container = document.getElementById('gears-container');
  for (let i = 1; i <= selectedCar.gears; i++) {
    let html = `
    <div>
      <div>Gear ${i}</div>
      <div class="gear${i}">
        <button class="button">-1</button>
        <button class="button">-0.02</button>
        <input type="number" max=${maxVal} min=${minVal} value=${stockGears[i-1]} class="input-value" id="gear${i}" onblur="editInput(this.parentElement)">
        <button class="button">+0.02</button>
        <button class="button">+1</button>
      </div>
    </div>
              `;
    tune[`gear${i}`] = stockGears[i-1];
    container.innerHTML += html;
  }
  // Make the buttons function
  document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('click', () => incrementInput(button.parentElement.getAttribute('class'), Number(button.innerHTML)));
  });
  document.querySelectorAll('.input-value').forEach(input => {
    input.addEventListener('blur', () => editInput(input.parentElement.getAttribute('class')));
  });
  //
  gearsGraph();
}

const gearCoeff = 100;
function gearsGraph() {
  let fd = tune['finaldrive'];
  let redline = selectedCar.redline;
  for (let i = 1; i <= selectedCar.gears; i++) {
    let ratio = tune[`gear${i}`];
    let length = gearCoeff / (ratio * fd);
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
      console.log(tune);
      break;
    case 'forcedinduction':
      selectInduction(tune['forcedinduction']);
    case 'engine':
    case 'ecu':
    case 'airflow':
    case 'injectors':
    case 'weightreduction':
    case 'brakes':
    case 'offset':
    case 'coils':
    case 'steering':
    case 'stance':
      selectGeneralDefault(category);
      break;
    case 'gears':
      selectGeneralDefault(category);
      createGears();
      break;
    default:
      console.error(`invalid tuning category selected: ${category}`);
      break;
  }
}

function selectGeneralDefault(category) {
  const subcats = subcategories[category];
  if (subcats)
    subcats.forEach(subcat => {
      selectGeneral(tune[subcat] ? tune[subcat] : 0, subcat);
    });
  const subtunes = subtuning[category];
  if (subtunes)
    subtunes.forEach(subtune => {
      incrementInput(subtune, 0);
    });
}

function selectInduction(category) {
  tune['forcedinduction'] = category;
  const x = subcategories['forcedinduction'];

  // Set old categories value to 0
  x.forEach(subcat => {
    if (subcat != category)
      selectGeneral(0, subcat)
  });

  // Update visual
  document.querySelectorAll('.stages-container').forEach(cont => {
    if (cont.getAttribute('id') == category)
      cont.children[0].classList.add('selected-induction');
    else
      cont.children[0].classList.remove('selected-induction');
  });
}

function selectInductionStage(n, category) {
  if (tune['forcedinduction'] == category)
    selectGeneral(n, category);
}

function selectGeneral(n, category) {
  stageSelect(n,category);
  tune[category] = n;
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
      updateHPDescription(n, category);
      break;
    case 'weightreduction':
      updateWeightDescription(n, category);
      break;
    case 'brakes':
      updateBRDescription(n, category);
      break;
  }
}

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

function incrementInput(category, x) {
  let input = document.querySelector(`.${category} .input-value`);
  if(!tune[category])
    tune[category] = 0; 
  const maxVal = input.max;
  const minVal = input.min;
  let newVal = clamp(tune[category] + x, minVal, maxVal);
  input.value = newVal;
  tune[category] = newVal;
}

function editInput(category) {
  let input = document.querySelector(`.${category} .input-value`);
  if(!tune[category])
    tune[category] = 0; 
  const maxVal = input.max;
  const minVal = input.min;
  let newVal = clamp(input.value, minVal, maxVal);
  input.value = newVal;
  tune[category] = newVal;
}

function updateHPDescription(n, category) {
  const calc = document.getElementsByClassName('stage-calc');
  const desc = document.getElementsByClassName('stage-description');
  const x = JSON.parse(desc[0].getAttribute('data-values'));
  desc[0].innerHTML = `Stage ${n}: ${x[n]}% increase`;
  calc[0].innerHTML = `horsepower: ${calculateHP()} HP`;
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

function stageSelect(stage, category) {
  document.querySelectorAll(`#${category} div`).forEach(child => {
    if (child.innerHTML == stage)
      child.classList.add('selected-stage');
    else 
      child.classList.remove('selected-stage');
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