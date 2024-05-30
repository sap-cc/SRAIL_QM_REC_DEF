"use strict";

sap.ui.define(["sap/ui/model/json/JSONModel", "zqm/nc/recdefectfast/controller/Base.controller"], function (JSONModel, __BaseController) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }

  function _empty() {}

  function _awaitIgnored(value, direct) {
    if (!direct) {
      return value && value.then ? value.then(_empty) : Promise.resolve();
    }
  }

  function _await(value, then, direct) {
    if (direct) {
      return then ? then(value) : value;
    }

    if (!value || !value.then) {
      value = Promise.resolve(value);
    }

    return then ? value.then(then) : value;
  }

  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }

    if (result && result.then) {
      return result.then(void 0, recover);
    }

    return result;
  }

  function _continue(value, then) {
    return value && value.then ? value.then(then) : then(value);
  }

  function _continueIgnored(value) {
    if (value && value.then) {
      return value.then(_empty);
    }
  }

  function _async(f) {
    return function () {
      for (var args = [], i = 0; i < arguments.length; i++) {
        args[i] = arguments[i];
      }

      try {
        return Promise.resolve(f.apply(this, args));
      } catch (e) {
        return Promise.reject(e);
      }
    };
  }

  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  var BaseController = _interopRequireDefault(__BaseController);

  /**
   * @namespace zqm.nc.recdefectfast.controller
   */
  var MainController = BaseController.extend("zqm.nc.recdefectfast.controller.MainController", {
    onInit: function _onInit() {
      BaseController.prototype.onInit.call(this);
      this.oViewModel = new JSONModel({
        defectCategory: null,
        loading: true,
        error: null
      });
      this.getView().setModel(this.oViewModel); // eslint-disable-next-line @typescript-eslint/unbound-method

      this.oRouter.getRoute("main").attachPatternMatched(this.onRouteMatched, this);
    },
    onExit: function _onExit() {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.oRouter.getRoute("main").detachPatternMatched(this.onRouteMatched, this);
    },
    onRouteMatched: function _onRouteMatched(oEvent) {
      try {
        var _exit2 = false;

        var _this2 = this;

        // Note: need to read route parameters at first, later it becomes null
        var oRouteParameters = oEvent.getParameter("arguments");

        _this2.oViewModel.setData({
          defectCategory: null,
          loading: true,
          error: null
        });

        _this2.oViewModel.refresh();

        return _await(_continue(_catch(function () {
          return _await(_this2.oODataModel.metadataLoaded(true), function () {
            return _awaitIgnored(_this2.oODataModel.getMetaModel().loaded());
          });
        }, function (oError) {
          var errorMessage = _this2.parseError(oError);

          _this2.oViewModel.setData({
            loading: false,
            error: errorMessage
          }, true);

          _exit2 = true;
        }), function (_result) {
          var _oRouteParameters$Qu;

          if (_exit2) return _result;

          // determine supported property names for predinfed values
          var oEntityType = _this2.oODataModel.getMetaModel().getODataEntityType("QM_DEFECT_RECORD_SRV.C_DefectRecordType");

          var aSupportedProperties = oEntityType.property.map(function (oProperty) {
            return {
              name: oProperty.name,
              type: oProperty.type
            };
          }); // get the predefined values

          var oPredefinedValuesFromRoute = _this2.getRouteParameters((_oRouteParameters$Qu = oRouteParameters["?query"]) !== null && _oRouteParameters$Qu !== void 0 ? _oRouteParameters$Qu : {}, aSupportedProperties);

          var oPredefinedValuesFromStartup = _this2.getStartupParameters(aSupportedProperties);

          var oPredefinedValuesMerged = _objectSpread(_objectSpread({
            ZZ1_NC_LAYOUT_VARIANT_NIT: "STANDARD"
          }, oPredefinedValuesFromStartup), oPredefinedValuesFromRoute);
debugger;
          if (!oPredefinedValuesMerged.DefectCategory) {
            _this2.oViewModel.setData({
              loading: false,
              error: "Defect category is missing"
            }, true);

            return;
          }

          _this2.oODataModel.read("/C_DefectCatVH('".concat(oPredefinedValuesMerged.DefectCategory, "')"), {
            success: _async(function () {
              // create draft & redirect to form page
              return _continueIgnored(_catch(function () {
                return _await(_this2.oDraftController.createNewDraftEntity("C_DefectRecord", "/C_DefectRecord", oPredefinedValuesMerged), function (_this2$oDraftControll) {
                  var _ref = _this2$oDraftControll,
                      oEntryContext = _ref.context;

                  _this2.navigateToDefectRecord(oEntryContext.getPath(), true);
                });
              }, function (oError) {
                var errorMessage = _this2.parseError(oError);

                _this2.oViewModel.setData({
                  loading: false,
                  error: errorMessage
                }, true);
              }));
            }),
            error: function error(oError) {
              var errorMessage = _this2.parseError(oError);

              _this2.oViewModel.setData({
                loading: false,
                error: errorMessage
              }, true);
            }
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getRouteParameters: function _getRouteParameters(oRouteParameters, aFieldsToExtract) {
      var _this3 = this;

      return aFieldsToExtract.reduce(function (oParameterMap, _ref2) {
        var sKey = _ref2.name,
            type = _ref2.type;

        if (oRouteParameters[sKey] != null) {
          // prefer url parameters
          oParameterMap[sKey] = _this3.convertParameter(oRouteParameters[sKey], type);
        }

        return oParameterMap;
      }, {});
    }
  });
  return MainController;
});
//# sourceMappingURL=Main.controller.js.map