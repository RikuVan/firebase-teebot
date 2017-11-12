const firebase = global.firebase || require('firebase/app');
require('firebase/database');
import firConfig from './firebaseConfig';

// Initialize Firebase SDK
// Only should be called once on the server
// the client should already be initialized from hosting init script
const initializeApp = (config = firConfig) => {
  if (firebase.apps.length === 0) {
    firebase.initializeApp(config);
  }
};

const logRef = () => firebase.database().ref('log');
const configRef = () => firebase.database().ref('config');
const dbRef = () => firebase.database().ref();

export {
  initializeApp,
  logRef,
  configRef,
  dbRef
};
