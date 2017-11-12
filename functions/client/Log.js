"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _preact = require("preact");

var Log = function Log(_ref) {
  var log = _ref.log,
      onClear = _ref.onClear;
  return (0, _preact.h)(
    "article",
    null,
    (0, _preact.h)(
      "h2",
      null,
      "Log"
    ),
    log && (0, _preact.h)(
      "button",
      { className: "log-button", onClick: onClear, disabled: !log },
      "CLEAR LOG"
    ),
    log ? (0, _preact.h)(
      "ul",
      null,
      Object.keys(log).reverse().map(function (id) {
        return (0, _preact.h)(
          "li",
          null,
          (0, _preact.h)(
            "pre",
            null,
            JSON.stringify(log[id], null, 2)
          )
        );
      })
    ) : (0, _preact.h)(
      "p",
      null,
      "No items"
    )
  );
};

exports.default = Log;