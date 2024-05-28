"use strict";

sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "sap/ui/generic/app/transaction/DraftController", "sap/ui/model/BindingMode", "sap/ui/model/json/JSONModel"], function (UIComponent, sap_ui_Device, DraftController, BindingMode, JSONModel) {
  var support = sap_ui_Device["support"];
  var system = sap_ui_Device["system"];

  /**
   * @namespace zqm.nc.recdefectfast
   */
  var Component = UIComponent.extend("zqm.nc.recdefectfast.Component", {
    metadata: {
      manifest: "json"
    },
    init: function _init() {
      // call the base component's init function
      UIComponent.prototype.init.call(this); // prepare custom services & models

      this.oDeviceModel = new JSONModel({
        isTouch: support.touch,
        isNoTouch: !support.touch,
        isPhone: system.phone,
        isNoPhone: !system.phone,
        hasCameraSupport: "mediaDevices" in navigator && "getUserMedia" in navigator.mediaDevices
      });
      this.oDeviceModel.setDefaultBindingMode(BindingMode.OneWay);
      this.setModel(this.oDeviceModel, "device");
      var oModel = this.getModel();
      this.oDraftController = new DraftController(oModel, undefined); // create the views based on the url/hash

      this.getRouter().initialize();
    },
    exit: function _exit() {
      // clean up custom stuff
      this.oDraftController.destroy();
    },
    getDraftController: function _getDraftController() {
      return this.oDraftController;
    },
    getContentDensityClass: function _getContentDensityClass() {
      if (this.sContentDensityClass === undefined) {
        // check whether FLP has already set the content density class; do nothing in this case
        if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
          this.sContentDensityClass = "";
        } else if (!support.touch) {
          // apply "compact" mode if touch is not supported
          this.sContentDensityClass = "sapUiSizeCompact";
        } else {
          // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
          this.sContentDensityClass = "sapUiSizeCozy";
        }
      }

      return this.sContentDensityClass;
    }
  });
  return Component;
});
//# sourceMappingURL=Component.js.map