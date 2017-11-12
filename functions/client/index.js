'use strict';

var _preact = require('preact');

var _App = require('./App');

var _App2 = _interopRequireDefault(_App);

require('./styles.scss');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var data = window.__data__;

(0, _preact.render)((0, _preact.h)(_App2.default, { data: data }), document.querySelector('body'), document.getElementById('app'));