// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBUpQjCUjgA76-Vqx0P-ZSHkRkNjsxZa0g",
  authDomain: "inventory-managment-b0335.firebaseapp.com",
  projectId: "inventory-managment-b0335",
  storageBucket: "inventory-managment-b0335.appspot.com",
  messagingSenderId: "1016034953358",
  appId: "1:1016034953358:web:ca28e9ee2c21d9a91de1df",
  measurementId: "G-D379DLGJZE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export {firestore}