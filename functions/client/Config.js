'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _preact = require('preact');

var isBool = function isBool(val) {
  return typeof val === 'boolean';
};

var Config = function Config(_ref) {
  var config = _ref.config;
  return (0, _preact.h)(
    'article',
    null,
    (0, _preact.h)(
      'h2',
      null,
      'Config'
    ),
    config && (0, _preact.h)(
      'ul',
      null,
      Object.keys(config).map(function (prop) {
        return (0, _preact.h)(
          'li',
          null,
          prop,
          ': ',
          isBool(config[prop]) ? config[prop].toString() : config[prop]
        );
      })
    )
  );
};

exports.default = Config;