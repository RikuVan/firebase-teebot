'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dbRef = exports.configRef = exports.logRef = exports.initializeApp = undefined;

var _firebaseConfig = require('./firebaseConfig');

var _firebaseConfig2 = _interopRequireDefault(_firebaseConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var firebase = global.firebase || require('firebase/app');
require('firebase/database');


// Initialize Firebase SDK
// Only should be called once on the server
// the client should already be initialized from hosting init script
var initializeApp = function initializeApp() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _firebaseConfig2.default;

  if (firebase.apps.length === 0) {
    firebase.initializeApp(config);
  }
};

var logRef = function logRef() {
  return firebase.database().ref('log');
};
var configRef = function configRef() {
  return firebase.database().ref('config');
};
var dbRef = function dbRef() {
  return firebase.database().ref();
};

exports.initializeApp = initializeApp;
exports.logRef = logRef;
exports.configRef = configRef;
exports.dbRef = dbRef;