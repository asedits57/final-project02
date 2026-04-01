import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
})

interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
}

const firebaseConfig: FirebaseConfig = {
    apiKey: "YOUR_KEY",
    authDomain: "YOUR_DOMAIN",
    projectId: "YOUR_ID"
};

const app: FirebaseApp = initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
