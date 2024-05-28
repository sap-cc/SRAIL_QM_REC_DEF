"use strict";

sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

  /**
   * @namespace zqm.nc.recdefectfast.controller
   */
  var BaseController = Controller.extend("zqm.nc.recdefectfast.controller.BaseController", {
    onInit: function _onInit() {
      this.oOwnerComponent = this.getOwnerComponent();
      this.oRouter = this.oOwnerComponent.getRouter();
      this.oODataModel = this.oOwnerComponent.getModel();
      this.oDraftController = this.oOwnerComponent.getDraftController();
    },
    getStartupParameters: function _getStartupParameters(aFieldsToExtract) {
      var _this = this;

      var oComponentData = this.getOwnerComponent().getComponentData() != null ? this.getOwnerComponent().getComponentData() : {};
      var oStartupParameters = oComponentData.startupParameters;
      return aFieldsToExtract.reduce(function (oParameterMap, _ref) {
        var sKey = _ref.name,
            type = _ref.type;

        if (oStartupParameters[sKey] != null) {
          var sParameterValue = Array.isArray(oStartupParameters[sKey]) ? oStartupParameters[sKey][0] : oStartupParameters[sKey];
          oParameterMap[sKey] = _this.convertParameter(sParameterValue, type);
        }

        return oParameterMap;
      }, {});
    },
    isLaunchpad: function _isLaunchpad() {
      return sap.ushell != null;
    },
    navigateBack: function _navigateBack() {
      if (this.isLaunchpad()) {
        sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (service) {
          service.toExternal({
            target: {
              shellHash: "#"
            }
          });
        })["catch"](function (error) {
          console.error(error);
          window.history.go(-1);
        });
      } else {
        window.history.go(-1);
      }
    },
    navigateToCreateDefect: function _navigateToCreateDefect(oPredefinedValues) {
      var bReplace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      this.oRouter.navTo("main", {
        "?query": oPredefinedValues
      }, {}, bReplace);
    },
    navigateToDefectRecord: function _navigateToDefectRecord(sPath) {
      var bReplace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      this.oRouter.navTo("record", {
        defectRecordPath: sPath.substring(1)
      }, {}, bReplace);
    },
    parseError: function _parseError(oError) {
      if (oError != null && _typeof(oError) === "object") {
        var responseText = undefined;

        if ("response" in oError && oError.response.responseText != null) {
          responseText = oError.response.responseText;
        } else if (oError.responseText != null) {
          responseText = oError.responseText;
        }

        if (responseText != null) {
          // try to parse JSON
          try {
            var response = JSON.parse(responseText);

            if (response.error && response.error.message && response.error.message.value) {
              return response.error.message.value;
            }
          } catch (_unused) {
            // might be XML, though => regexp parsing of message value
            var parsedText = responseText.replace(/.*<message>(.*)<\/message>.*/, "$1").trim(); // otherwise, just show the response text

            return parsedText || responseText;
          }
        } else if (oError.message != null) {
          return oError.message;
        }
      } // todo i18n


      return "Unknown Error";
    },
    translate: function _translate(i18nKey, args, ignoreKeyFallback) {
      return this.getResourceBundle().getText(i18nKey, args, ignoreKeyFallback);
    },
    convertParameter: function _convertParameter(sParameter, type) {
      switch (type) {
        case "boolean":
        case "Edm.Boolean":
          return typeof sParameter === "boolean" ? sParameter : sParameter === "true";

        default:
          {
            return sParameter;
          }
      }
    },
    getResourceBundle: function _getResourceBundle() {
      return this.oOwnerComponent.getModel("i18n").getResourceBundle();
    }
  });
  return BaseController;
});
//# sourceMappingURL=Base.controller.js.map