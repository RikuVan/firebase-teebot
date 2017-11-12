const isBool = (val) => typeof val === 'boolean';
const isNumber = (val) => !isNaN(parseFloat(val)) && isFinite(val);

const configModel = {
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

export default configModel;


