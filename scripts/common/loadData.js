export async function loadCars() {
  const sheetID = '1uThRBT6DRzCn_vGh_2uAs9odGktC_Cg7_DQWgciZ-BY'; 
  const sheetName = 'Cars';
  return loadFromSpreadsheet(sheetID, sheetName, formatCars);
}

export async function loadTunes() {
  const sheetID = '1Eco30_8EtgNr4YuUzkCGX26-NoP5AR4-pkHRKKByLJE';
  const sheetName = 'Tunes';
  return loadFromSpreadsheet(sheetID, sheetName, formatTunes);
}

async function loadFromSpreadsheet(sheetID, sheetName, formatter) {
  const apiURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  try {
    let response = await fetch(apiURL);
    let data = await response.text();
    const rows = csvToArray(data);
    return formatter(rows);
} catch (error) {
    console.error("Error fetching data:", error);
}
}

function csvToArray(csv) {
  return csv.split("\n").slice(1).map(row => 
      row.split(",").map(cell => cell.replace(/^"|"$/g, '').trim())  // Remove surrounding quotes and trim
  );
}

function formatCars(rows) {
  let i = 0;
  let result = [];
  rows.forEach(row => {
    let car = {};
    car.carID = row[0];
    car.realName = row[7];
    car.price = row[8];
    car.tier = row[9];
    car.gears = row[11];
    car.weight = row[12].split(' ')[0];
    car.baseHP = row[13].split(' ')[0];
    car.peakHP = row[14].split(' ')[0];
    car.maxHP = row[15].split(' ')[0];
    car.brakeForce = row[16].split(' ')[0];
    car.redline = row[29].split(' ')[0];
    if(row[33])
      car.stockRatios = row[33].split(' | ').map(Number);
    car.stockFD = Number(row[34]);
    result[i] = car;
    i++;
  })
  return result;
}

function formatTunes(rows) {
  let result = [];
  for (let i = 0; i < rows.length; i++){
    let tune = {};
    const row = rows[i];

    tune.tuneID = Number(row[0]);
    tune.carID = row[1];
    tune.name = row[2];
    tune.category = row[3];
    tune.author = row[4];
    tune.tuneCode = row[5];
    tune.description = row[6];

    result[i] = tune;
  }
  return result;
}