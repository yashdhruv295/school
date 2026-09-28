import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/* =========================================================
   FIREBASE ENVIRONMENT CONFIGURATION
========================================================= */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID,

  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID,

  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


/* =========================================================
   REQUIRED ENV VALIDATION
========================================================= */

const requiredFirebaseValues = [
  {
    name: "VITE_FIREBASE_API_KEY",
    value: firebaseConfig.apiKey,
  },
  {
    name: "VITE_FIREBASE_AUTH_DOMAIN",
    value: firebaseConfig.authDomain,
  },
  {
    name: "VITE_FIREBASE_PROJECT_ID",
    value: firebaseConfig.projectId,
  },
  {
    name: "VITE_FIREBASE_STORAGE_BUCKET",
    value: firebaseConfig.storageBucket,
  },
  {
    name: "VITE_FIREBASE_MESSAGING_SENDER_ID",
    value: firebaseConfig.messagingSenderId,
  },
  {
    name: "VITE_FIREBASE_APP_ID",
    value: firebaseConfig.appId,
  },
];


const missingValues =
  requiredFirebaseValues.filter(
    (item) => !item.value
  );


if (missingValues.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingValues
      .map((item) => item.name)
      .join(", ")}`
  );
}


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

const app =
  initializeApp(firebaseConfig);


/* =========================================================
   FIRESTORE
========================================================= */

export const db =
  getFirestore(app);


/* =========================================================
   EXPORT APP
========================================================= */

export default app;