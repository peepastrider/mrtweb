import { loadData } from './common/loadData.js';

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
  'steering':['aggressiveness', 'ratio']
};

document.addEventListener('DOMContentLoaded', async () => {
  cars = await loadData();
  const params = new URLSearchParams(window.location.search);
  const carID = params.get("carID");
  if (carID)
    selectCar(carID.replace(/_/g, ' '));
  loadCategoryButtons();
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
      loadTuneCategory(category);
      initializeValues(category);
  } catch (error) {
      console.error("Error loading tuning category:", error);
  }
}

function loadTuneCategory(category) {
  // Stage buttons
  const upgrades = subcategories[category];
  if (upgrades) {
    upgrades.forEach(upgrade => {
      const container = document.getElementById(upgrade);
      const stages = Array.from(container.children);
      stages.forEach(stage => {
        stage.addEventListener('click', () => selectGeneral(stage.innerHTML,upgrade,0));
      });
    });
  }
  // Inputs
  const inputs = subtuning[category];
  if (inputs) {
    inputs.forEach(input => {
      const container = document.getElementsByClassName(input)[0];
      const children = Array.from(container.children);
      children.forEach(child => {
        if (child.classList.contains('button'))
          child.addEventListener('click', () => incrementInput(input, Number(child.innerHTML)));
        else 
          child.addEventListener('blur', () => editInput(container));
      });
    });
  }
  console.log(`Loaded category ${category}`);
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

      let tunerCar = document.getElementById('tuner-car');
      tunerCar.innerHTML = `Selected Car: ${selectedCar.carID}`;
    }
  });
}

function createGears() {
  const maxVal = 6.5;
  const minVal = 0.5;
  const container = document.getElementById('gears-container');
  for (let i = 1; i <= selectedCar.gears; i++) {
    let html = `
    <div>
      <div>Gear ${i}</div>
      <div class="gear${i}">
        <button class="button" onclick="incrementInput(this.parentElement.getAttribute('class'), Number(this.innerHTML))">-1</button>
        <button class="button" onclick="incrementInput(this.parentElement.getAttribute('class'), Number(this.innerHTML))">-0.02</button>
        <input type="number" max=${maxVal} min=${minVal} class="input-value" id="gear${i}" onblur="editInput(this.parentElement)">
        <button class="button" onclick="incrementInput(this.parentElement.getAttribute('class'), Number(this.innerHTML))">+0.02</button>
        <button class="button" onclick="incrementInput(this.parentElement.getAttribute('class'), Number(this.innerHTML))">+1</button>
      </div>
    </div>
              `;
    container.innerHTML += html;
  }
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
      createGears();
      break;
    default:
      break;
  }
}

function selectGeneralDefault(category) {
  const subcats = subcategories[category];
  if (subcats)
  {
    let i = 0;
    subcats.forEach(subcat => {
      selectGeneral(tune[subcat] ? tune[subcat] : 0, subcat, i);
      i = i+1;
    });
  }
  const subtune = subtuning[category];
  if (subtune)
    subtune.forEach(subtune => {
      incrementInput(subtune, 0);
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
    selectGeneral(n, category);
}

function selectGeneral(n, category) {
  stageSelect(n,category);
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
  const inputs = document.getElementsByClassName('input-value');
  let input = {};
  Array.from(inputs).forEach(inp => {
    if (inp.parentElement.classList.contains(category))
      input = inp;
  });
  const maxVal = input.max;
  const minVal = input.min;
  if(!tune[category])
    tune[category] = 0; 
  let newVal = clamp(tune[category] + x, minVal, maxVal);
  input.value = newVal;
  tune[category] = newVal;
}

function editInput(container) {
  const inputs = document.getElementsByClassName('input-value');
  let input = {};
  Array.from(inputs).forEach(inp => {
    if (inp.parentElement == container)
      input = inp;
  });
  let category = container.getAttribute('class');
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
  const cont = document.getElementById(category);
  Array.from(cont.children).forEach(child => {
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