import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"; 
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0Jzamxj5uLEdPO1AOeNxmoIFALJ2wwW4",
  authDomain: "database-b6cad.firebaseapp.com",
  databaseURL: "https://database-b6cad-default-rtdb.firebaseio.com",
  projectId: "database-b6cad",
  storageBucket: "database-b6cad.appspot.com",
  messagingSenderId: "1086225114987",
  appId: "1:1086225114987:web:b3954c353d2c522fbb8e2e",
  measurementId: "G-6Y79ESY35K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// DOM elements
const userNameElement = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const carInfoBtn = document.getElementById('carInfoBtn');
const devicelocation = document.getElementById('location');
const sensorDataBtn = document.getElementById('sensorDataBtn');
const dataTitle = document.getElementById('dataTitle');
const dataContent = document.getElementById('dataContent');
const buttons = document.querySelectorAll(".button-container button");
const dataDisplay = document.getElementById("dataDisplay");
const allowedButtons = ["carInfoBtn", "sensorDataBtn"];
const toggleButton = "location"; // Button to toggle visibility

buttons.forEach(button => {
  button.addEventListener("click", () => {
    if (allowedButtons.includes(button.id)) {
      dataDisplay.style.display = "block"; // Show dataDisplay
    } else if (button.id === toggleButton) {
      dataDisplay.style.display = dataDisplay.style.display === "block" ? "none" : "block"; // Toggle visibility
    }
  });
});




logoutBtn.addEventListener('click', handleLogout);
carInfoBtn.addEventListener('click', () => {
    clearSensorDataInterval();
    fetchAndDisplayCarInfo('CarInfo');
});
devicelocation.addEventListener('click', () => {
  clearSensorDataInterval();

  openMapModal(); 
});

let map, marker;

        // Retrieve device coordinates from local storage
        const deviceLat = parseFloat(localStorage.getItem('deviceLat')) || 30.766301;
        const deviceLng = parseFloat(localStorage.getItem('deviceLng')) || 76.576126;

        function initMap() {
            const deviceLocation = { lat: deviceLat, lng: deviceLng };

            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13,
                center: deviceLocation,
            });

            marker = new google.maps.Marker({
                position: deviceLocation,
                map: map,
                title: `Latitude: ${deviceLat}, Longitude: ${deviceLng}`,
            });
        }

        function openMapModal() {
            document.getElementById("mapModal").style.display = "flex"; // Show modal
            initMap(); // Initialize the map
        }
        function closeMapModal() {
          document.getElementById("mapModal").style.display = "none"; // Hide modal
      }
        

        // Close modal if clicking outside content box
        window.onclick = function(event) {
            const modal = document.getElementById("mapModal");
            if (event.target === modal) {
                closeMapModal();
            }
        }

sensorDataBtn.addEventListener('click', startAutoUpdateSensorData);
let sensorDataInterval = null;

function fetchAndDisplayCarInfo(nodeName) {
  const user = auth.currentUser;
  if (!user) {
    displayData(nodeName, "Error: User not authenticated");
    return;
  }

  const dataRef = ref(database, `/${nodeName}/${user.uid}`);
  get(dataRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      displayData(nodeName, data);
      dataContent.scrollIntoView({ behavior: 'smooth' });
    } else {
      displayData(nodeName, "No car information available");
    }
  }).catch((error) => {
    displayData(nodeName, `Error: ${error.message}`);
  });
}

function startAutoUpdateSensorData() {
  sensorDataBtn.disabled = true;
  fetchAndDisplayData('SensorData');
  sensorDataInterval = setInterval(() => {
    fetchAndDisplayData('SensorData');
  }, 1000);
}

function clearSensorDataInterval() {
  if (sensorDataInterval !== null) {
    clearInterval(sensorDataInterval);
    sensorDataInterval = null;
    sensorDataBtn.disabled = false;
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    userNameElement.textContent = user.displayName || user.email;
  } else {
    window.location.href = "login.html";
  }
});

function handleLogout() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  }).catch((error) => {
    console.error("Error signing out: ", error);
  });
}

function fetchAndDisplayData(nodeName) {
  const user = auth.currentUser;
  if (!user) {
    displayData(nodeName, "Error: User not authenticated");
    return;
  }

  const dataRef = ref(database, `/${nodeName}`);
  get(dataRef).then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      displayData(nodeName, data);
    } else {
      displayData(nodeName, "No data available");
    }
  }).catch((error) => {
    displayData(nodeName, `Error: ${error.message}`);
  });
}

function displayData(title, content) {
  dataTitle.textContent = title;
  dataContent.innerHTML = ''; // Clear previous content

  let deviceLat = null;
  let deviceLng = null;

  if (typeof content === 'object' && content !== null) {
    for (const [key, value] of Object.entries(content)) {
      const dataBox = document.createElement('div');
      dataBox.classList.add('data-box');

      const keyElement = document.createElement('h3');
      keyElement.textContent = key;
      dataBox.appendChild(keyElement);

      // Check if the value is an object
      if (typeof value === 'object') {
        // Nested loop to handle sub-keys
        for (const [subKey, subValue] of Object.entries(value)) {
          const subElement = document.createElement('p');
          subElement.textContent = `${subKey}: ${subValue}`;
          dataBox.appendChild(subElement);
          
       

          // Check if the subValue is an image URL
          if (subKey === 'imageURL') {
            const imageElement = document.createElement('img');
            imageElement.src = subValue;
            imageElement.alt = "Image";
            imageElement.style.maxWidth = "10%"; // Adjust as needed
            imageElement.style.height = "auto"; // Maintain aspect ratio
            dataBox.appendChild(imageElement);
          }
        }
      } else {
        // If the value is not an object, just display it
        const valueElement = document.createElement('p');
        valueElement.textContent = value;
        dataBox.appendChild(valueElement);

        // Set latitude and longitude directly if they exist at the top level
        if (key === 'latitude') {
          deviceLat = value;
        }
        if (key === 'longitude') {
          deviceLng = value;
        }
      }

      // Append the data box to the main content area (do it only once)
      dataContent.appendChild(dataBox);
    }

    // Check if latitude and longitude are set and display the map
    if (deviceLat !== null && deviceLng !== null) {
      console.log("Latitude:", deviceLat, "Longitude:", deviceLng);
      // displayMap(deviceLat, deviceLng);
    } else {
      console.log("Latitude or Longitude not set.");
    }
    localStorage.setItem('deviceLat', deviceLat);
    localStorage.setItem('deviceLng', deviceLng);

// Function to navigate to map.html
    

    
  } else {
    // If content is not an object, display it directly
    dataContent.textContent = content;
  }
}
