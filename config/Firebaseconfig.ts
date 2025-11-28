// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSMnClr60mM6QjymG4bl-z8RsvRJRwYPY",
  authDomain: "brahma-ai-ec14b.firebaseapp.com",
  projectId: "brahma-ai-ec14b",
  storageBucket: "brahma-ai-ec14b.appspot.com",
  messagingSenderId: "694237647274",
  appId: "1:694237647274:web:55524a7a4d911c464a5bd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestoreDb=getFirestore(app);
export const storage=getStorage(app);