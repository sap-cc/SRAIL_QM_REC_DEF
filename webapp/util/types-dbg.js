"use strict";

sap.ui.define(["sap/ui/base/Object"], function (UI5Object) {
  var isInstanceOf = function isInstanceOf(oObject, ui5ObjectClass) {
    return UI5Object.isA(oObject, ui5ObjectClass.getMetadata().getName());
  };

  var __exports = {
    __esModule: true
  };
  __exports.isInstanceOf = isInstanceOf;
  return __exports;
});
//# sourceMappingURL=types.js.map