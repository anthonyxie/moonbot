import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, runTransaction, child } from 'firebase/database';


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

function writeUserData(userId, type, balance) {
    set(ref(db, 'users/' + userId), {
      type: type,
      balance: balance,
    });
}

import tmi from 'tmi.js';

// Define configuration options
const opts = {
  identity: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD
  },
  channels: [
    'moonlimes'
  ]
};



var coin = 0;

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, userstate, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } 
  else if (commandName === '!type') {
    if (userstate['user-type'] === 'mod') {
      client.say(target, `${userstate['display-name']}, you are a mod!`);
    }
    else if (userstate['user-type'] === 'vip') {
      client.say(target, `${userstate['display-name']}, you are a VIP!`);
    }
    else {
      client.say(target, `${userstate['display-name']}, you are a viewer!`);  
    }
  }
  else if (commandName === '!disconnect' && userstate['display-name'] === 'moonlimes') {
    client.say('moonlimes', `MrDestructoid WE ARE DISCONNECTING MrDestructoid`);
    client.disconnect();
  }
  else if (commandName === 'COPING' && (userstate['user-type'] === 'mod' ||  userstate['display-name'] === 'moonlimes')) {
    if (coin == 0) {
      coin = Math.floor(Math.random() * 5) + 1;
      client.say('moonlimes', `${coin} copium coins have dropped! Use !claimcoin to grab yourself one! COPIUMcoin`);
    }
    else {
      client.say('moonlimes', `There are still ${coin} copium coins left to claim!`);
    }
  }
  else if (commandName === '!claimcoin' && coin > 0) {
    coin = coin - 1;
    var userId = userstate['display-name'];
    var usertype = userstate['user-type'];
    console.log(usertype);
    if (usertype === null) {
      if (userId === 'moonlimes') {
        usertype = 'broadcaster';
      }
      else {
        usertype = 'viewer';
      }
    }
    console.log(usertype + 'new');
    //add coins to database
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/${userId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val().balance + 1);
        var balance = snapshot.val().balance + 1;
        //update balance
        writeUserData(userstate['display-name'], usertype, balance);
        client.say('moonlimes', `${userstate['display-name']}, you have claimed a copium coin, you now have ${balance} coins! There are ${coin} coins left!`);
        
      } else {
        console.log("No data available");
        writeUserData(userstate['display-name'], userstate['user-type'], 1);
        var balance = 1;
        console.log("New data written");
        client.say('moonlimes', `${userstate['display-name']}, you have claimed a copium coin, you now have ${balance} coins! There are ${coin} coins left!`);
      }
    }).catch((error) => {
      console.error(error);
    });
    

    /** 
    var dbRef = ref(getDatabase());
    var balance = get(child(dbRef, `users/${userstate['display-name']}`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
    */
    
  }
  else {
    console.log(`* Unknown command ${commandName}`);
  }

}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  client.say('moonlimes', `MrDestructoid WE ARE CONNECTED MrDestructoid`)
  console.log(`* Connected to ${addr}:${port}`);
}

function onDisconnectedHandler (reason) {
  console.log(`Disconnected: ${reason}`)
  process.exit(1)
}