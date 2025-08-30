import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth"; // <--- importa o Auth

const firebaseConfig = {
  apiKey: "AIzaSyAVxtAgX7zxfPC_rcwpzm2w-1g1V8mo0A8",
  authDomain: "chale-da-praia.firebaseapp.com",
  databaseURL: "https://chale-da-praia-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chale-da-praia",
  storageBucket: "chale-da-praia.firebasestorage.app",
  messagingSenderId: "821449774368",
  appId: "1:821449774368:web:ca48ebaa62eb6bcc29b345"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app); // <--- cria o Auth

// exporta tudo
export { db, storage, auth };
