async function loadDatabase() {
  try {
      let response = await fetch('https://peepastrider.github.io/mrtweb/database.db');
      let buffer = await response.arrayBuffer();

      const SQL = await initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm`
      });

      let db = new SQL.Database(new Uint8Array(buffer));
      let result = db.exec("SELECT * FROM Car");

      const carList = document.getElementById('car-list');
      carList.innerHTML = "";

      if (result.length > 0) {
          let rows = result[0].values;
          rows.forEach(row => {
              let li = document.createElement('li');
              li.textContent = `${row[0]}: ${row[1]} - ${row[2]}`;
              carList.appendChild(li);
          });
      } else {
          carList.innerHTML = "<li>No cars found.</li>";
      }
  } catch (error) {
      console.error("Error loading database:", error);
      document.getElementById('car-list').textContent = "Failed to load database.";
  }
}
loadDatabase();