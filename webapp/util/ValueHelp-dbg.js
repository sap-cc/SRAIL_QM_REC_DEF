"use strict";

sap.ui.define(["sap/m/CheckBox", "sap/m/Label", "sap/m/Text", "sap/ui/comp/valuehelpdialog/ValueHelpDialog", "sap/ui/model/ChangeReason", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/table/Column", "zqm/nc/recdefectfast/util/ODataHelper"], function (CheckBox, Label, Text, ValueHelpDialog, ChangeReason, Filter, FilterOperator, Column, __zqm_nc_recdefectfast_util_ODataHelper) {
  function _await(value, then, direct) {
    if (direct) {
      return then ? then(value) : value;
    }

    if (!value || !value.then) {
      value = Promise.resolve(value);
    }

    return then ? value.then(then) : value;
  }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  var getEntitySetNameByBindingContextPath = __zqm_nc_recdefectfast_util_ODataHelper["getEntitySetNameByBindingContextPath"];
  var getODataEntityTypeByEntitySet = __zqm_nc_recdefectfast_util_ODataHelper["getODataEntityTypeByEntitySet"];
  var getODataPropertyForEntitySet = __zqm_nc_recdefectfast_util_ODataHelper["getODataPropertyForEntitySet"];
  var ODataValueListParameterRecordType = __zqm_nc_recdefectfast_util_ODataHelper["ODataValueListParameterRecordType"];
  /**
   * @namespace zqm.nc.recdefectfast.util
   */

  var ValueHelp = /*#__PURE__*/function () {
    function ValueHelp() {
      _classCallCheck(this, ValueHelp);
    }

    _createClass(ValueHelp, null, [{
      key: "showValueHelp",
      value: function showValueHelp(oBindingContext, sPropertyName) {
        try {
          var oModel = oBindingContext.getModel();

          if (oModel.getMetadata().getName() !== "sap.ui.model.odata.v2.ODataModel") {
            // todo log unsupported
            return _await();
          } // ensure odata model & metadata are completely loaded


          return _await(oModel.metadataLoaded(true), function () {
            var oMetaModel = oModel.getMetaModel();
            return _await(oMetaModel.loaded(), function () {
              var sModelEntitySet = getEntitySetNameByBindingContextPath(oBindingContext.getPath());
              var oEntityTypeDefinition = getODataPropertyForEntitySet(oMetaModel, sModelEntitySet, sPropertyName);
              var oValueHelpDefinition = oEntityTypeDefinition["com.sap.vocabularies.Common.v1.ValueList"];

              if (oValueHelpDefinition == null) {
                return;
              }

              var oValueHelpDefinitionEntityType = getODataEntityTypeByEntitySet(oMetaModel, oValueHelpDefinition.CollectionPath.String);

              if (oValueHelpDefinitionEntityType == null) {
                return;
              }

              var aValueHelpDefinitionEntityTypeKeys = oValueHelpDefinitionEntityType.key.propertyRef.map(function (k) {
                return k.name;
              });
              var aKeyParameters = oValueHelpDefinition.Parameters.filter(function (p) {
                return p.ValueListProperty.String != null && aValueHelpDefinitionEntityTypeKeys.indexOf(p.ValueListProperty.String) !== -1;
              });
              var oOriginalKey = aKeyParameters.find(function (p) {
                return p.LocalDataProperty != null && p.LocalDataProperty.PropertyPath === sPropertyName;
              });
              var aOtherKeys = aKeyParameters.filter(function (p) {
                return p !== oOriginalKey;
              }); // init value help

              var oValueHelpDialog = new ValueHelpDialog({
                title: oEntityTypeDefinition["sap:label"],
                key: oOriginalKey === null || oOriginalKey === void 0 ? void 0 : oOriginalKey.ValueListProperty.String,
                keys: aOtherKeys.map(function (p) {
                  return p.ValueListProperty.String;
                }),
                // keys: aValueHelpDefinitionEntityTypeKeys,
                supportMultiselect: false,
                supportRanges: false,
                supportRangesOnly: false,
                ok: function ok(oControlEvent) {
                  // Note: tokens doesn't work, cause they contain only a single value, but we need the fully identified object
                  // TODO async table
                  var oTable = oValueHelpDialog.getTable();
                  var iSelectedIndex = oTable.getSelectedIndices().shift();

                  if (iSelectedIndex != null) {
                    var oSelectedItemBindingContext = oTable.getContextByIndex(iSelectedIndex); // sync selected item back to original odata model

                    oValueHelpDefinition.Parameters.filter(function (p) {
                      return p.RecordType === ODataValueListParameterRecordType.ValueListParameterInOut || p.RecordType === ODataValueListParameterRecordType.ValueListParameterOut;
                    }).forEach(function (p) {
                      var sValue = oSelectedItemBindingContext.getProperty(p.ValueListProperty.String);
                      var sAbsolutePath = oBindingContext.getPath(p.LocalDataProperty.PropertyPath);
                      console.log("setting", sAbsolutePath, "to", sValue);
                      oModel.setProperty(sAbsolutePath, sValue);
                      oModel.firePropertyChange({
                        reason: ChangeReason.Change,
                        path: p.LocalDataProperty.PropertyPath,
                        value: sValue,
                        // provided types are wrong
                        context: oBindingContext
                      });
                    });
                  }

                  oValueHelpDialog.close();
                },
                cancel: function cancel() {
                  oValueHelpDialog.close();
                },
                afterClose: function afterClose() {
                  oValueHelpDialog.destroy();
                }
              });
              var cols = oValueHelpDefinition.Parameters.filter(function (p) {
                return p.RecordType === ODataValueListParameterRecordType.ValueListParameterInOut || p.RecordType === ODataValueListParameterRecordType.ValueListParameterDisplayOnly || p.RecordType === ODataValueListParameterRecordType.ValueListParameterOut;
              }).map(function (p) {
                var _oValueHelpDefinition, _oValueHelpDefinition2;

                return {
                  label: (_oValueHelpDefinition = oValueHelpDefinitionEntityType.property.find(function (oPropDefinition) {
                    return oPropDefinition.name === p.ValueListProperty.String;
                  })) === null || _oValueHelpDefinition === void 0 ? void 0 : _oValueHelpDefinition["sap:label"],
                  type: (_oValueHelpDefinition2 = oValueHelpDefinitionEntityType.property.find(function (oPropDefinition) {
                    return oPropDefinition.name === p.ValueListProperty.String;
                  })) === null || _oValueHelpDefinition2 === void 0 ? void 0 : _oValueHelpDefinition2.type,
                  property: p.ValueListProperty.String
                };
              }).filter(function (col) {
                return col.label != null;
              }).map(function (p) {
                return new Column({
                  label: new Label({
                    text: p.label
                  }),
                  template: p.type === "Edm.Boolean" ? new CheckBox({
                    selected: {
                      path: p.property
                    },
                    enabled: false
                  }) : new Text({
                    text: {
                      path: p.property
                    }
                  })
                });
              }); // todo async table

              var oTable = oValueHelpDialog.getTable();
              cols.forEach(function (column) {
                oTable.addColumn(column);
              });
              var aFilters = oValueHelpDefinition.Parameters.filter(function (p) {
                return p.RecordType === ODataValueListParameterRecordType.ValueListParameterInOut || p.RecordType === ODataValueListParameterRecordType.ValueListParameterIn;
              }).filter(function (p) {
                return p.LocalDataProperty.PropertyPath != null && p.LocalDataProperty.PropertyPath !== sPropertyName;
              }).map(function (p) {
                var sValue = oBindingContext.getProperty(p.LocalDataProperty.PropertyPath);

                if (sValue != null && sValue !== "") {
                  return new Filter(p.ValueListProperty.String, FilterOperator.EQ, sValue);
                }

                return null;
              }).filter(function (f) {
                return f != null;
              });
              oTable.setModel(oModel);
              oTable.bindRows({
                path: "/" + oValueHelpDefinition.CollectionPath.String,
                filters: aFilters
              });
              oValueHelpDialog.open(); // oValueHelpDialog.update();
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);

    return ValueHelp;
  }();

  return ValueHelp;
});
//# sourceMappingURL=ValueHelp.js.map