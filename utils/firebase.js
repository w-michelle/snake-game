import { initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.SNAKE_API_KEY,
  authDomain: process.env.SNAKE_AUTH_DOMAIN,
  projectId: process.env.SNAKE_PROJECT_ID,
  storageBucket: process.env.SNAKE_STORAGE_BUCKET,
  messagingSenderId: process.env.SNAKE_MESSAGING_SENDER_ID,
  appId: process.env.SNAKE_APP_ID,
  measurementId: process.env.SNAKE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
