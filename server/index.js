import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import { h } from 'preact';
import express from 'express';
import { render } from 'preact-render-to-string';
import App from './client/App';
import fs from 'fs'
import configModel from './configModel';
import teebot from './teebot';
import {initializeApp, logRef, configRef, dbRef} from './client/firebaseDb';

const bot = teebot();
const app = express();
let cache = null;

initializeApp(functions.config().firebase);

const LOG_ITEMS_LIMIT = 200;

const Logger = (() => {
  let instance;
  function createLogger() {
    return {
      log: logRef(),
      push: function(item) {
        this.log.push().set(item);
        this.log.once('value').then(snapshot => {
          const log = snapshot.val();
          const ids = Object.keys(log);
          const isOverLimit = ids.length > LOG_ITEMS_LIMIT;
          if (isOverLimit) {
            this.log.remove();
          }
        })
      }
    };
  }
  return {
    init: () => {
      if (!instance) {
        instance = createLogger();
      }
      return instance;
    }
  };
})();

const getConfig = (req, res, next) => {
  if (req.type === 'POST' && !req.path.includes('config')) {
    if (!cache) {
      configRef()
        .once('value')
        .then(snapshot => {
          const config = snapshot.val();
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

const renderApp = (req, res) => {
  fs.readFile(__dirname + '/index.html', 'utf8', (err, index) => {
    dbRef().once('value').then(snapshot => {
      if (err) console.log(err);
      const appHtml = render(<App />);
      const html = index.replace('<!-- ::APP:: --->', appHtml);
      const htmlWithData = html.replace('/** ::DATA:: */', JSON.stringify(snapshot.val()));
      res.send(htmlWithData);
    })
  });
};

const setConfig = (req, res) => {
  const config = req.body;
  if (!config) {
    return res.status(400).send('Missing config')
  }
  cache = null;
  const validatedConfig = Object.keys(config).reduce((acc, key) => {
    if (configModel[key]) {
      if (configModel[key][0](config[key])) {
        acc[key] = config[key];
      } else {
        acc[key] = configModel[key][1];
      }
    }
    return acc;
  }, {});
  configRef().set(validatedConfig);
  res.status(200).send('ok')
};

app.post('/config', setConfig);

app.get('/', renderApp);

app.post('/', (req, res) => {
  let jsonString = '';

  req.on('data', (data) => {
    jsonString += data;
  });

  req.on('end', () => {
    const nextTickInfo = JSON.parse(jsonString);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const directions = bot.getDirections(nextTickInfo);
    const logger = Logger.init();
    logger.push({nextTickInfo, directions});
    res.end(JSON.stringify(directions));
  });
});

exports.teebot = functions.https.onRequest((req, res) => {
  // without trailing "/" will have req.path = null, req.url = null
  // which won't match to your app.get('/', ...) route
  if (!req.path) req.url = `/${req.url}`;
  return app(req, res);
});

