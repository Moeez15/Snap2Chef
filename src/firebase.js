// src/firebase.js
// Replace the below config object with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAcEc81x2xV4n7S1SliMyOVeWf1lLKbkjc",
  authDomain: "snap2chef-69d77.firebaseapp.com",
  projectId: "snap2chef-69d77",
  storageBucket: "snap2chef-69d77.appspot.com",
  messagingSenderId: "559813542395",
  appId: "1:559813542395:web:81d5b775b54b7dfa8a8b5e",
  measurementId: "G-WHW5LS12HC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 