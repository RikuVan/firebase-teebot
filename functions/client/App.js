'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _preact = require('preact');

var _Config = require('./Config');

var _Config2 = _interopRequireDefault(_Config);

var _Log = require('./Log');

var _Log2 = _interopRequireDefault(_Log);

var _firebaseDb = require('./firebaseDb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(0, _firebaseDb.initializeApp)();

var App = function (_Component) {
  _inherits(App, _Component);

  function App(props) {
    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

    var data = props.data;

    _this.state = {
      log: data ? data.log : [],
      config: data ? data.config : {}
    };

    _this.onUpdate = _this.onUpdate.bind(_this);
    _this.clearLog = _this.clearLog.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      (0, _firebaseDb.dbRef)().on('value', this.onUpdate);
    }
  }, {
    key: 'componentDidUnmount',
    value: function componentDidUnmount() {
      (0, _firebaseDb.dbRef)().off();
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(snapshot) {
      var _snapshot$val = snapshot.val(),
          config = _snapshot$val.config,
          log = _snapshot$val.log;

      this.setState({ config: config, log: log });
    }
  }, {
    key: 'clearLog',
    value: function clearLog(e) {
      e.preventDefault();
      (0, _firebaseDb.logRef)().remove();
    }
  }, {
    key: 'render',
    value: function render(_p, state) {
      return (0, _preact.h)(
        'main',
        null,
        (0, _preact.h)(
          'h1',
          null,
          'Teebot'
        ),
        (0, _preact.h)(_Config2.default, { config: state.config }),
        (0, _preact.h)(_Log2.default, { log: state.log, onClear: this.clearLog })
      );
    }
  }]);

  return App;
}(_preact.Component);

exports.default = App;