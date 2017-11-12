'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _configModel = require('./configModel');

var _configModel2 = _interopRequireDefault(_configModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var teebot = function teebot() {

  var config = Object.keys(_configModel2.default).reduce(function (acc, key) {
    acc[key] = _configModel2.default[key][1];
    return acc;
  }, {});

  var shuffle = function shuffle(array) {
    var arr = array.concat([]);
    if (config.deterministic) return arr;
    for (var i = arr.length - 1; i >= 0; i--) {
      var index = Math.floor(Math.random() * (i + 1));
      var item = arr[index];
      arr[index] = arr[i];
      arr[i] = item;
    }
    return arr;
  };

  var coordEq = function coordEq(p, q) {
    return p.x == q.x && p.y == q.y && p.z == q.z;
  };

  var helpers = function helpers(data) {
    return {
      hasBomb: function hasBomb(p) {
        return data.items.some(function (it) {
          return it.type === 'BOMB' && coordEq(it, p);
        });
      },
      hasPlayer: function hasPlayer(p) {
        return data.players.some(function (it) {
          return coordEq(it, p);
        });
      },
      inBounds: function inBounds(p) {
        return [p.x, p.y, p.z].every(function (c) {
          return c >= 0 && c < data.gameInfo.edgeLength;
        });
      },
      me: data.players.find(function (p) {
        return p.name === data.currentPlayer.name;
      })
    };
  };

  var explode = function explode(tx, ty, tz, n, data) {
    var queue = [{ x: tx, y: ty, z: tz }];
    var done = [];
    var tasks = [];

    var _helpers = helpers(data),
        hasBomb = _helpers.hasBomb,
        inBounds = _helpers.inBounds,
        me = _helpers.me;

    var isDone = function isDone(p) {
      return done.some(function (it) {
        return coordEq(it, p);
      });
    };

    var prioritize = function prioritize(xs) {
      if (config.randomSpread) {
        return shuffle(xs);
      } else {
        return xs.map(function (x) {
          return Object.assign({ score: positionDesirability(x, data.currentPlayer.name, data) }, x);
        }).sort(function (a, b) {
          return a.score - b.score;
        });
      }
    };

    while (queue.length && tasks.length < n) {
      var pos = queue.shift();

      if (!hasBomb(pos)) {
        tasks.push({ task: 'BOMB', x: pos.x, y: pos.y, z: pos.z });
      }

      if (tasks.length < n) {
        var neighbors = [{ x: pos.x + 1, y: pos.y + 0, z: pos.z + 0 }, { x: pos.x - 1, y: pos.y + 0, z: pos.z + 0 }, { x: pos.x + 0, y: pos.y + 1, z: pos.z + 0 }, { x: pos.x + 0, y: pos.y - 1, z: pos.z + 0 }, { x: pos.x + 0, y: pos.y + 0, z: pos.z + 1 }, { x: pos.x + 0, y: pos.y + 0, z: pos.z - 1 }].filter(function (p) {
          return inBounds(p) && !isDone(p) && !coordEq(p, me);
        });
        queue = queue.concat(prioritize(neighbors));
      }

      done.push(pos);
    }

    return tasks;
  };

  var implode = function implode(tx, ty, tz, n, data) {
    var queue = [{ x: tx, y: ty, z: tz, d: 0 }];
    var done = [];

    var _helpers2 = helpers(data),
        hasBomb = _helpers2.hasBomb,
        inBounds = _helpers2.inBounds,
        me = _helpers2.me;

    var isDone = function isDone(p) {
      return done.some(function (it) {
        return coordEq(it, p);
      });
    };
    var implodeRadius = Math.ceil(data.gameInfo.numOfTasksPerTick / config.implodeRadiusFraction);
    var prioritize = function prioritize(xs) {
      if (config.randomSpread) {
        return shuffle(xs);
      } else {
        return xs.map(function (x) {
          return Object.assign({ score: positionDesirability(x, data.currentPlayer.name, data) }, x);
        }).sort(function (a, b) {
          return a.score - b.score;
        });
      }
    };

    while (queue.length) {
      var pos = queue.shift();

      if (pos.d < implodeRadius) {
        var neighbors = [{ x: pos.x + 1, y: pos.y + 0, z: pos.z + 0, d: pos.d + 1 }, { x: pos.x - 1, y: pos.y + 0, z: pos.z + 0, d: pos.d + 1 }, { x: pos.x + 0, y: pos.y + 1, z: pos.z + 0, d: pos.d + 1 }, { x: pos.x + 0, y: pos.y - 1, z: pos.z + 0, d: pos.d + 1 }, { x: pos.x + 0, y: pos.y + 0, z: pos.z + 1, d: pos.d + 1 }, { x: pos.x + 0, y: pos.y + 0, z: pos.z - 1, d: pos.d + 1 }].filter(function (p) {
          return inBounds(p) && !isDone(p) && !coordEq(p, me) && !hasBomb(p);
        });
        queue = queue.concat(prioritize(neighbors));
      }

      done.push(pos);
    }

    var tasks = done.sort(function (a, b) {
      return b.d - a.d;
    }).splice(0, n).map(function (pos) {
      return { task: 'BOMB', x: pos.x, y: pos.y, z: pos.z };
    });

    return tasks;
  };

  var pickTargets = function pickTargets(n, data) {
    var others = data.players.filter(function (p) {
      return p.name != data.currentPlayer.name;
    });
    var prioritize = function prioritize(xs) {
      if (config.randomTargeting) {
        return shuffle(xs);
      } else {
        return xs.map(function (x) {
          return Object.assign({ score: positionDesirability(x, x.name, data) }, x);
        }).sort(function (a, b) {
          return a.score - b.score;
        });
      }
    };
    var targets = prioritize(others).splice(0, n).map(function (t) {
      return Object.assign(t, { n: 1 });
    });

    if (targets.length < n) {
      var left = n - targets.length;
      for (var i = 0; i < left; ++i) {
        targets[i % targets.length].n += 1;
      }
    }

    return targets;
  };

  var positionDesirability = function positionDesirability(pos, player, data) {
    var distSq = function distSq(a, b) {
      return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y) + (b.z - a.z) * (b.z - a.z);
    };
    var bombProximityScore = data.items.filter(function (i) {
      return i.type === 'BOMB';
    }).map(function (i) {
      return distSq(i, pos);
    }).reduce(function (sum, x) {
      return sum + x;
    }, 0);

    var playerProximityScore = data.players.filter(function (p) {
      return p.name != player;
    }).map(function (p) {
      return distSq(p, pos);
    }).reduce(function (sum, x) {
      return sum + x;
    }, 0);

    return bombProximityScore + playerProximityScore;
  };

  var moveDistance = function moveDistance(n, data) {
    var _helpers3 = helpers(data),
        hasBomb = _helpers3.hasBomb,
        hasPlayer = _helpers3.hasPlayer,
        inBounds = _helpers3.inBounds,
        me = _helpers3.me;

    var queue = [{ x: me.x, y: me.y, z: me.z, moves: [] }];
    var tasks = [];
    var done = [];
    var isDone = function isDone(p) {
      return done.some(function (it) {
        return coordEq(it, p);
      });
    };

    while (queue.length) {
      var pos = queue.shift();

      if (pos.moves.length >= n) {
        // Desired distance reached
        return pos.moves.map(function (m) {
          return { task: 'MOVE', direction: m };
        }).splice(0, n);
      } else {
        var neighbors = [{
          x: pos.x + 1,
          y: pos.y + 0,
          z: pos.z + 0,
          moves: pos.moves.concat(['+X'])
        }, {
          x: pos.x - 1,
          y: pos.y + 0,
          z: pos.z + 0,
          moves: pos.moves.concat(['-X'])
        }, {
          x: pos.x + 0,
          y: pos.y + 1,
          z: pos.z + 0,
          moves: pos.moves.concat(['+Y'])
        }, {
          x: pos.x + 0,
          y: pos.y - 1,
          z: pos.z + 0,
          moves: pos.moves.concat(['-Y'])
        }, {
          x: pos.x + 0,
          y: pos.y + 0,
          z: pos.z + 1,
          moves: pos.moves.concat(['+Z'])
        }, {
          x: pos.x + 0,
          y: pos.y + 0,
          z: pos.z - 1,
          moves: pos.moves.concat(['-Z'])
        }].filter(function (p) {
          return inBounds(p) && !isDone(p) && !hasBomb(p) && !hasPlayer(p);
        });
        if (config.randomMovement) {
          queue = queue.concat(shuffle(neighbors));
        } else {
          var rankedNeighbors = neighbors.map(function (n) {
            return Object.assign({ score: positionDesirability(n, data.currentPlayer.name, data) }, n);
          }).sort(function (a, b) {
            return b.score - a.score;
          });
          queue = queue.concat(rankedNeighbors);
        }
      }
      done.push(pos);
    }

    // Find the longest path as fallback
    var best = done.reduce(function (best, x) {
      return best.moves.length < x.moves.length ? x : best;
    }, { moves: [] });
    return best.moves.map(function (m) {
      return { task: 'MOVE', direction: m };
    });
  };

  var getDirections = function getDirections(data) {
    var numTasks = data.gameInfo.numOfTasksPerTick;
    var moves = moveDistance(Math.max(config.minMoves, numTasks / config.moveFraction), data);
    if (config.verbose) console.log('Moves:', JSON.stringify(moves));
    var targets = pickTargets(numTasks - moves.length, data);
    if (config.verbose) console.log('Targets:', JSON.stringify(targets));
    var flatMap = function flatMap(xs, f) {
      return xs.reduce(function (ts, x) {
        return ts.concat(f(x));
      }, []);
    };
    var strategy = function strategy() {
      return Math.random() < config.explodeImplodeRatio ? explode : implode;
    };
    var tasks = moves.concat(flatMap(targets, function (t) {
      return strategy()(t.x, t.y, t.z, t.n, data);
    }));
    if (config.verbose) console.log('Tasks:', JSON.stringify(tasks));
    return tasks;
  };

  return {
    getDirections: getDirections,
    setConfig: function setConfig(opts) {
      return config = Object.assign(config, opts);
    }
  };
};

exports.default = teebot;
