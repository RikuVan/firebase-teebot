'use strict';

var _firebaseFunctions = require('firebase-functions');

var functions = _interopRequireWildcard(_firebaseFunctions);

var _firebaseAdmin = require('firebase-admin');

var _firebaseAdmin2 = _interopRequireDefault(_firebaseAdmin);

var _preact = require('preact');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _preactRenderToString = require('preact-render-to-string');

var _App = require('./client/App');

var _App2 = _interopRequireDefault(_App);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _configModel = require('./configModel');

var _configModel2 = _interopRequireDefault(_configModel);

var _teebot = require('./teebot');

var _teebot2 = _interopRequireDefault(_teebot);

var _firebaseDb = require('./client/firebaseDb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var bot = (0, _teebot2.default)();
var app = (0, _express2.default)();
var cache = null;

(0, _firebaseDb.initializeApp)(functions.config().firebase);

var LOG_ITEMS_LIMIT = 200;

var Logger = function () {
  var instance = void 0;
  function createLogger() {
    return {
      log: (0, _firebaseDb.logRef)(),
      push: function push(item) {
        var _this = this;

        this.log.push().set(item);
        this.log.once('value').then(function (snapshot) {
          var log = snapshot.val();
          var ids = Object.keys(log);
          var isOverLimit = ids.length > LOG_ITEMS_LIMIT;
          if (isOverLimit) {
            _this.log.remove();
          }
        });
      }
    };
  }
  return {
    init: function init() {
      if (!instance) {
        instance = createLogger();
      }
      return instance;
    }
  };
}();

var getConfig = function getConfig(req, res, next) {
  if (req.type === 'POST' && !req.path.includes('config')) {
    if (!cache) {
      (0, _firebaseDb.configRef)().once('value').then(function (snapshot) {
        var config = snapshot.val();
        bot.setConfig(config);
        cache = config;
        next();
      });
      bot.setConfig(cache);
      next();
    }
  }
  next();
};

app.use(getConfig);

var renderApp = function renderApp(req, res) {
  _fs2.default.readFile(__dirname + '/index.html', 'utf8', function (err, index) {
    (0, _firebaseDb.dbRef)().once('value').then(function (snapshot) {
      if (err) console.log(err);
      var appHtml = (0, _preactRenderToString.render)((0, _preact.h)(_App2.default, null));
      var html = index.replace('<!-- ::APP:: --->', appHtml);
      var htmlWithData = html.replace('/** ::DATA:: */', JSON.stringify(snapshot.val()));
      res.send(htmlWithData);
    });
  });
};

var setConfig = function setConfig(req, res) {
  var config = req.body;
  if (!config) {
    return res.status(400).send('Missing config');
  }
  cache = null;
  var validatedConfig = Object.keys(config).reduce(function (acc, key) {
    if (_configModel2.default[key]) {
      if (_configModel2.default[key][0](config[key])) {
        acc[key] = config[key];
      } else {
        acc[key] = _configModel2.default[key][1];
      }
    }
    return acc;
  }, {});
  (0, _firebaseDb.configRef)().set(validatedConfig);
  res.status(200).send('ok');
};

app.post('/config', setConfig);

app.get('/', renderApp);

app.post('/', function (req, res) {
  var jsonString = '';

  req.on('data', function (data) {
    jsonString += data;
  });

  req.on('end', function () {
    var nextTickInfo = JSON.parse(jsonString);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    var directions = bot.getDirections(nextTickInfo);
    var logger = Logger.init();
    logger.push({ nextTickInfo: nextTickInfo, directions: directions });
    res.end(JSON.stringify(directions));
  });
});

exports.teebot = functions.https.onRequest(function (req, res) {
  // without trailing "/" will have req.path = null, req.url = null
  // which won't match to your app.get('/', ...) route
  if (!req.path) req.url = '/' + req.url;
  return app(req, res);
});
