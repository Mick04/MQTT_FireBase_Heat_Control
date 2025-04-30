import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDkJinA0K6NqBLGR4KYnX8AdDNgXp2-FDI",
  //authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "https://esp32-heater-controler-6d11f-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "esp32-heater-controler-6d11f",
  //storageBucket: "YOUR_STORAGE_BUCKET",
  //messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  //appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };