// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "Your api key",
  authDomain: "Your Auth",
  projectId: "todo-practice-app-smit",
  storageBucket: "todo-practice-app-smit.appspot.com",
  messagingSenderId: "452428561760",
  appId: "1:452428561760:web:9ec085e24926e516b4b205",
  measurementId: "G-D00NH4PY7R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);
export { analytics, auth,firestore }