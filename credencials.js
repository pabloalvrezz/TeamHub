// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDROtnReDKtwZSm2su_fde75N7GRz0v_Rw",
  authDomain: "teamhub-8ab29.firebaseapp.com",
  projectId: "teamhub-8ab29",
  storageBucket: "teamhub-8ab29.appspot.com",
  messagingSenderId: "80608880736",
  appId: "1:80608880736:web:e2d0bd03036f2b32257b05",
  measurementId: "G-SPM4FE6MYZ"
};


// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);


export default appFirebase;