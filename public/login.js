// Import Firebase SDK for Authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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
const auth = getAuth(app);

const server = 
// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Sign in the user with email and password
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log('User signed in:', user);
      // Redirect to the dashboard page after successful login
      window.location.href = "dashboard.html"; 
    })
    .catch((error) => {
        // You can check the type or code of the error if needed
        const errorMessage = "Invalid ID or Password"; // Custom error message
        document.getElementById('error-message').innerText = errorMessage;
      });
});
