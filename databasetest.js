import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set } from 'firebase/database';

import 'dotenv/config'

// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGEBUCKET,
    messagingSenderId: process.env.MESSAGING_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function writeUserData(userId, name, email, imageUrl) {
    set(ref(db, 'users/' + userId), {
      username: name,
      email: email,
      profile_picture : imageUrl
    });
}

writeUserData(1,2,3,4);
writeUserData(1,3,4,5);
