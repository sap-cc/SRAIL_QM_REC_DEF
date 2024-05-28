"use strict";

sap.ui.define([], function () {
  var debounce = function debounce(func, wait) {
    var timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        timeout = undefined;
        func();
      }, wait);
    };
  };

  var __exports = {
    __esModule: true
  };
  __exports.debounce = debounce;
  return __exports;
});
//# sourceMappingURL=debounce.js.map