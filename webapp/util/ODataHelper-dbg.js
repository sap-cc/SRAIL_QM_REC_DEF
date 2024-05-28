"use strict";

sap.ui.define(["sap/ui/model/odata/ODataMetaModel", "sap/ui/model/odata/ODataPropertyBinding", "sap/ui/model/odata/v2/ODataModel", "zqm/nc/recdefectfast/util/types", "sap/base/util/array/uniqueSort"], function (ODataMetaModel, ODataPropertyBinding, ODataModel, __zqm_nc_recdefectfast_util_types, uniqueSort) {
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

  var isInstanceOf = __zqm_nc_recdefectfast_util_types["isInstanceOf"];

  function correctPath(sPath) {
    var sEntity;
    var oRegExp = /\((.+)\)*/;
    var aMatches = oRegExp.exec(sPath);

    if (aMatches) {
      sEntity = sPath.replace(aMatches[0], "");
    } else {
      sEntity = sPath || "";
    }

    return sEntity.replace("/", "");
  }

  var isODataPropertyBinding = function isODataPropertyBinding(oBinding) {
    return isInstanceOf(oBinding, ODataPropertyBinding);
  };

  var isODataModel = function isODataModel(oModel) {
    return isInstanceOf(oModel, ODataModel);
  };

  var getEntitySetNameByBindingContextPath = function getEntitySetNameByBindingContextPath(sBindingContextPath) {
    return correctPath(sBindingContextPath);
  };

  var ODataValueListParameterRecordType;

  (function (ODataValueListParameterRecordType) {
    ODataValueListParameterRecordType["ValueListParameterOut"] = "com.sap.vocabularies.Common.v1.ValueListParameterOut";
    ODataValueListParameterRecordType["ValueListParameterIn"] = "com.sap.vocabularies.Common.v1.ValueListParameterIn";
    ODataValueListParameterRecordType["ValueListParameterInOut"] = "com.sap.vocabularies.Common.v1.ValueListParameterInOut";
    ODataValueListParameterRecordType["ValueListParameterDisplayOnly"] = "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly";
  })(ODataValueListParameterRecordType || (ODataValueListParameterRecordType = {}));

  // export interface ODataEvaluatedValueHelpInfo {
  //     entitySet: string;
  //     entityType: string;
  //     parameterInNames: Array<string>;
  //     parameterOutNames: Array<string>;
  //     displayNames: Array<string>;
  // }
  var getODataEntityTypeByEntitySet = function getODataEntityTypeByEntitySet(oMetaModel, sEntitySet) {
    if (!isInstanceOf(oMetaModel, ODataMetaModel)) {
      return;
    }

    var odataEntitySet = oMetaModel.getODataEntitySet(sEntitySet);

    if (odataEntitySet == null || odataEntitySet.entityType == null) {
      return;
    }

    var odataEntityType = oMetaModel.getODataEntityType(odataEntitySet.entityType);

    if (odataEntityType == null || typeof odataEntityType === "string") {
      return;
    }

    return odataEntityType;
  };

  var getODataPropertyForEntitySet = function getODataPropertyForEntitySet(oMetaModel, sEntitySet, sPropertyName) {
    var oODataEntityType = getODataEntityTypeByEntitySet(oMetaModel, sEntitySet);

    if (oODataEntityType == null) {
      return;
    }

    var oODataProperty = oMetaModel.getODataProperty(oODataEntityType, sPropertyName);

    if (oODataProperty == null || typeof oODataProperty === "string") {
      return;
    }

    return oODataProperty;
  };

  var getAllODataNavigationPropertiesForSapText = function getAllODataNavigationPropertiesForSapText(oMetaModel, sEntitySet) {
    var oEntityTypeDefinition = getODataEntityTypeByEntitySet(oMetaModel, sEntitySet);
    return oEntityTypeDefinition.property.map(function (oProperty) {
      // we need all navigation properties for sap:text to show the correct labels
      if (typeof oProperty["sap:text"] !== "string") {
        return undefined;
      }

      var parts = oProperty["sap:text"].split("/");

      if (parts.length !== 2) {
        return undefined;
      }

      var sNavigationPropertyName = parts[0];

      if (oEntityTypeDefinition.navigationProperty.some(function (oNavigationProperty) {
        return oNavigationProperty.name === sNavigationPropertyName;
      })) {
        return sNavigationPropertyName;
      }

      return undefined;
    }).filter(function (sNavigationPropertyName) {
      return sNavigationPropertyName != null;
    });
  };

  var getAffectedPropertiesByChangedProperties = function getAffectedPropertiesByChangedProperties(oMetaModel, sEntitySet, aChangedProperties) {
    var _ref;

    var type = getODataEntityTypeByEntitySet(oMetaModel, sEntitySet);
    var allChanges = type.property.filter(function (property) {
      return aChangedProperties.indexOf(property.name) !== -1;
    }).map(function (property) {
      if (property["com.sap.vocabularies.Common.v1.ValueList"] && property["com.sap.vocabularies.Common.v1.ValueList"].Parameters) {
        var affectedProperties = property["com.sap.vocabularies.Common.v1.ValueList"].Parameters.filter(function (prop) {
          return "LocalDataProperty" in prop;
        }).map(function (prop) {
          return prop.LocalDataProperty.PropertyPath;
        }).filter(function (propertyName) {
          return property.name !== propertyName && propertyName != null;
        });
        return {
          name: property.name,
          affects: affectedProperties
        };
      }

      return {
        name: property.name,
        affects: []
      };
    });

    var aAffectedChangedProperties = (_ref = []).concat.apply(_ref, [aChangedProperties].concat(_toConsumableArray(allChanges.map(function (p) {
      return p.affects;
    }))));

    return uniqueSort(aAffectedChangedProperties.slice());
  };

  var __exports = {
    __esModule: true
  };
  __exports.isODataPropertyBinding = isODataPropertyBinding;
  __exports.isODataModel = isODataModel;
  __exports.getEntitySetNameByBindingContextPath = getEntitySetNameByBindingContextPath;
  __exports.ODataValueListParameterRecordType = ODataValueListParameterRecordType;
  __exports.getODataEntityTypeByEntitySet = getODataEntityTypeByEntitySet;
  __exports.getODataPropertyForEntitySet = getODataPropertyForEntitySet;
  __exports.getAllODataNavigationPropertiesForSapText = getAllODataNavigationPropertiesForSapText;
  __exports.getAffectedPropertiesByChangedProperties = getAffectedPropertiesByChangedProperties;
  return __exports;
});
//# sourceMappingURL=ODataHelper.js.map