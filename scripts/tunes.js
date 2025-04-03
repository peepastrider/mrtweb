import { loadTunes } from './common/loadData.js';
import { decompressTune } from './common/compression.js';

let tunes = [];

// Initialize the page when loaded
window.addEventListener("load", () => {
  loadData();
});

async function loadData() {
  tunes = await loadTunes();
  const tuneContainer = document.getElementById('tune-container');
  if (!tuneContainer) return;

  tuneContainer.innerHTML = ''; // Clear existing content

  const params = new URLSearchParams(window.location.search);
  const tuneID = params.get("tuneID"); // Get the tuneID query parameter
  if (tuneID)
      displayTune(tuneID);
  else 
      displayTunes(tunes); 
}

function displayTunes(tunes) {
  const tuneContainer = document.getElementById('tune-container');
  tuneContainer.innerHTML = ``;

  // remove params if there is any
  history.replaceState({}, "", window.location.pathname);

  tunes.forEach(tune => {
    let panel = document.createElement('div');
    panel.classList.add('car-panel');
    panel.innerHTML = `
    <h2>${tune.name}</h2>
    <p>${tune.carID}</p>
    <p>Category: ${tune.category}</p>
    <p>Author: ${tune.author}</p>
    `;
    panel.addEventListener('click', () => {
      let url = new URL(window.location.href);
      url.searchParams.set("tuneID", tune.tuneID); // Set new query parameter
      history.pushState({}, "", url); // Update URL without reloading
      displayTune(tune.tuneID);
    });

    tuneContainer.appendChild(panel);
  });
}

function displayTune(tuneID) {
  const tuneContainer = document.getElementById('tune-container');
  const tuneDesc = tunes.filter(tune => tune.tuneID == tuneID)[0];
  const tune = decompressTune(tuneDesc.tuneCode);

  tuneContainer.innerHTML = `
    <button class="backbutton">Back</button>
    <button class="tuner-viewer">View in Tuner</button>
    <h2>${tuneDesc.name}</h2>
    <p>Car: ${tuneDesc.carID}</p>
    <p>Category: ${tuneDesc.category}</p>
    <p>Author: ${tuneDesc.author}</p>
    <br>
    <p>"${tuneDesc.description}"</p>
    <br>
    <div class="tune-container">
      <div class="tune-column">
        <h3>Upgrades</h3>
        <p>Brakes: ${tune.brakes}</p>
        <p>Weight Reduction: ${tune.weightreduction}</p>
        <p>Injectors: ${tune.injectors}</p>
        <p>ECU: ${tune.ecu}</p>
        <p>Intake: ${tune.intake}</p>
        <p>Exhaust: ${tune.exhaust}</p>
        <p>Forced Induction: ${tune.forcedinduction}, Stage ${tune[tune.forcedinduction] ? tune[tune.forcedinduction] : 0}</p>
        <p>Internals: ${tune.internals}</p>
        <p>Block: ${tune.block}</p>
      </div>
      <div class="column">
        <h3>Tuning</h3>
        <p>Brake Bias: ${tune.brakebias}</p>
        <p>Steering Aggressiveness: ${tune.aggressiveness}</p>
        <p>Steering Ratio: ${tune.ratio}</p>
        <p>Front Offset: ${tune.foffset}</p>
        <p>Rear Offset: ${tune.roffset}</p>
        <p>Front Height: ${tune.fheight}</p>
        <p>Front Camber: ${tune.fcamber}</p>
        <p>Rear Height: ${tune.rheight}</p>
        <p>Rear Camber: ${tune.rcamber}</p>
        <p>Front Dampening: ${tune.fdamp}</p>
        <p>Front Stiffness: ${tune.fstiff}</p>
        <p>Rear Dampening: ${tune.rdamp}</p>
        <p>Rear Stiffness: ${tune.rstiff}</p>
        <p>Final Drive: ${tune.finaldrive}</p>
        <p>Gear 1: ${tune.gear1}</p>
        <p>Gear 2: ${tune.gear2}</p>
        <p>Gear 3: ${tune.gear3}</p>
        <p>Gear 4: ${tune.gear4}</p>
        <p>Gear 5: ${tune.gear5}</p>
        <p>Gear 6: ${1}</p>
        <p>Gear 7: ${1}</p>
        <p>Gear 8: ${1}</p>
        <p>Gear 9: ${1}</p>
        <p>Gear 10: ${1}</p>
      </div>
    </div>
  `;
  document.querySelector('#tune-container .backbutton').addEventListener('click', () => displayTunes(tunes));
  document.querySelector('#tune-container .tuner-viewer').addEventListener('click', () => gotoTuner(tuneDesc.carID.replace(/ /g, '_'), tuneDesc.tuneCode));
}

function gotoTuner(carID, tuneCode) {
  window.location.href = `tuner.html?carID=${carID}&tuneCode=${tuneCode}`;
}