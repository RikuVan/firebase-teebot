'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isBool = function isBool(val) {
  return typeof val === 'boolean';
};
var isNumber = function isNumber(val) {
  return !isNaN(parseFloat(val)) && isFinite(val);
};

var configModel = {
  minMoves: [isNumber, 1],
  moveFraction: [isNumber, 2],
  implodeRadiusFraction: [isNumber, 2],
  explodeImplodeRatio: [isNumber, 0.8],
  randomMovement: [isBool, false],
  randomTargeting: [isBool, false],
  randomSpread: [isBool, false],
  deterministic: [isBool, false],
  verbose: [isBool, false]
};

exports.default = configModel;
