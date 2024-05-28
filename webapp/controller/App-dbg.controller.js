"use strict";

sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  /**
   * @namespace zqm.nc.recdefectfast.controller
   */
  var App = Controller.extend("zqm.nc.recdefectfast.controller.App", {
    onInit: function _onInit() {
      // apply content density mode to root view
      this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
    }
  });
  return App;
});
//# sourceMappingURL=App.controller.js.map