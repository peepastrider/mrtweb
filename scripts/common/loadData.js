export async function loadData() {
  const sheetID = '1uThRBT6DRzCn_vGh_2uAs9odGktC_Cg7_DQWgciZ-BY'; 
  const apiURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv`;

  try {
      let response = await fetch(apiURL);
      let data = await response.text();
      const rows = csvToArray(data);
      return formatResponse(rows);
  } catch (error) {
      console.error("Error fetching data:", error);
  }
}

function csvToArray(csv) {
  return csv.split("\n").slice(1).map(row => 
      row.split(",").map(cell => cell.replace(/^"|"$/g, '').trim())  // Remove surrounding quotes and trim
  );
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
    car.gears = row[11];
    car.weight = row[12].split(' ')[0];
    car.baseHP = row[13];
    car.peakHP = row[14];
    car.maxHP = row[15];
    car.brakeForce = row[16].split(' ')[0];
    car.redline = row[29].split(' ')[0];
    result[i] = car;
    i++;
  })
  return result;
}