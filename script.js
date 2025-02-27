const sheetID = '1uThRBT6DRzCn_vGh_2uAs9odGktC_Cg7_DQWgciZ-BY'; // Replace with your sheet ID

async function loadData() {
    const apiURL = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:csv`;

    try {
        let response = await fetch(apiURL);
        let data = await response.text();

        // Convert CSV data to an array of rows
        const rows = csvToArray(data);

        const carList = document.getElementById('car-list');
        carList.innerHTML = ''; // Clear previous data

        // Iterate over rows and display the data
        rows.forEach(row => {
            if (row.length > 1) { // Ensure the row is not empty
                let li = document.createElement('li');
                
                // Get the car ID from the first column (row[0])
                let carID = row[0];

                // Remove all spaces and / characters from the car ID
                const formattedCarID = carID.trim().replace(/\s+/g, '').replace(/\//g, ''); // Remove all spaces and slashes

                // Construct the image URL based on the car ID inside the "image" folder
                let imgPath = `image/${formattedCarID}.png`;

                // Log the image path for debugging
                console.log('Image Path:', imgPath);

                // Create and configure the image element
                let img = document.createElement('img');
                img.src = imgPath;
                img.alt = `Car ID: ${formattedCarID}`;

                // Check if image exists by logging it before appending
                img.onload = function() {
                    console.log('Image loaded successfully:', imgPath);
                };
                img.onerror = function() {
                    console.error('Error loading image:', imgPath);
                };

                // Append the image first
                li.appendChild(img);

                // Display other data from the sheet
                li.appendChild(document.createTextNode(` ${row[0]} (${row[4]}  ${row[7]}) ${row[8]}`)); // Adjust based on your sheet's structure
                
                // Append the li to carList
                carList.appendChild(li);

                console.log('Appended li to carList', li); // Log to verify it's being added
            }
        });
    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
    }
}

// Function to convert CSV string to an array of rows and remove quotes
function csvToArray(csv) {
    const rows = csv.split('\n');
    return rows.map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim())); // Remove quotes and trim spaces
}

loadData();