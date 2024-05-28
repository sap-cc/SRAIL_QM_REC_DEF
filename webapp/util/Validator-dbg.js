"use strict";

sap.ui.define(["sap/ui/core/Core", "sap/m/library", "sap/ui/comp/smartfield/SmartField", "sap/ui/core/library", "sap/ui/model/ValidateException", "zqm/nc/recdefectfast/util/types", "sap/m/RadioButtonGroup", "sap/m/CheckBox"], function (Core, sap_m_library, SmartField, sap_ui_core_library, ValidateException, __zqm_nc_recdefectfast_util_types, RadioButtonGroup, CheckBox) {
  function _await(value, then, direct) {
    if (direct) {
      return then ? then(value) : value;
    }

    if (!value || !value.then) {
      value = Promise.resolve(value);
    }

    return then ? value.then(then) : value;
  }

  function _empty() {}

  function _awaitIgnored(value, direct) {
    if (!direct) {
      return value && value.then ? value.then(_empty) : Promise.resolve();
    }
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

  function _invoke(body, then) {
    var result = body();

    if (result && result.then) {
      return result.then(then);
    }

    return then(result);
  }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

  var getScrollDelegate = sap_m_library["getScrollDelegate"];
  var ValueState = sap_ui_core_library["ValueState"];
  var isInstanceOf = __zqm_nc_recdefectfast_util_types["isInstanceOf"];

  /**
   * @namespace zqm.nc.recdefectfast.util
   */
  var Validator = /*#__PURE__*/function () {
    function Validator(view) {
      _classCallCheck(this, Validator);

      this.view = view;
    }

    _createClass(Validator, [{
      key: "validateFieldGroup",
      value: function validateFieldGroup(fieldGroup) {
        try {
          var _this2 = this;

          var inputs = _this2.getFields(fieldGroup);

          return _await(Promise.all(inputs.map(function (input) {
            return _this2.validateField(input);
          })), function (validationErrors) {
            return validationErrors.some(Boolean);
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "focusFirstError",
      value: function focusFirstError(fieldGroup) {
        var inputs = this.getFields(fieldGroup);
        var firstErrorInput = inputs.find(function (input) {
          return input.getValueState() === ValueState.Error;
        });

        if (firstErrorInput) {
          firstErrorInput.focus();
          var oScrollEnablement = getScrollDelegate(firstErrorInput, false);

          if (oScrollEnablement) {
            oScrollEnablement.scrollToElement(firstErrorInput.getDomRef());
          }
        }
      }
    }, {
      key: "getFields",
      value: function getFields(fieldGroup) {
        var _this3 = this;

        return this.view.getControlsByFieldGroupId(fieldGroup).filter(function (c) {
          return c.isA(["sap.m.Input", "sap.m.TextArea", "sap.m.ComboBox", "sap.m.RadioButtonGroup", "sap.m.CheckBox", "sap.ui.comp.smartfield.SmartField"]) && !_this3.surroundedByParent(c, "sap.ui.comp.smartfield.SmartField");
        });
      }
    }, {
      key: "surroundedByParent",
      value: function surroundedByParent(uiElement, name) {
        return uiElement == null ? false : uiElement.getParent() != null && uiElement.getParent().isA("sap.ui.comp.smartfield.SmartField") || this.surroundedByParent(uiElement.getParent(), name);
      }
      /**
       * Validates ui element.
       *
       * @param uiElement
       * @private
       * @returns true if there is an validation error, false if there are no errors
       */

    }, {
      key: "validateField",
      value: function validateField(uiElement) {
        try {
          var _exit2 = false;

          var _this5 = this;

          if (isInstanceOf(uiElement, RadioButtonGroup)) {
            return _await(_this5.validateFieldRadioButton(uiElement));
          }

          if (isInstanceOf(uiElement, CheckBox)) {
            return _await(_this5.validateFieldCheckbox(uiElement));
          }

          var oBinding = uiElement.getBinding("value");

          if (oBinding == null) {
            // no value binding -> nothing to validate -> no error
            return _await(false);
          }

          var oValueType = oBinding.getType();
          var sDataProperty = oBinding.getPath(); // note: we need to get the binding value to get the real internal value instead of the display value

          var vRawValue = oBinding.getValue();
          var vUiValue = uiElement.getValue(); // smartfield validation is kind of special

          return _await(_invoke(function () {
            if (isInstanceOf(uiElement, SmartField)) {
              //         // workaround: custom fields by custom fields & logic are always optional, but we need mandatory fields and
              //         // mandatory property does not work for all types smart fields
              //         const oMandatory = uiElement.data("mandatory") as boolean | string | null | undefined;
              //         if (oMandatory === "true" || oMandatory === true) {
              //             // workaround: 1 let's override the original odata definition to get the only reliable way to validate with smart fields
              //             const oDataProperty = uiElement.getDataProperty() as { property?: { nullable?: string } };
              //             if ("property" in oDataProperty) {
              //                 oDataProperty.property.nullable = "false";
              //             }
              //             // workaround 2: just set mandatory again
              //             if (!uiElement.getMandatory()) {
              //                 uiElement.setMandatory(true);
              //             }
              //         }
              return _continue(_catch(function () {
                return _awaitIgnored(uiElement.checkValuesValidity());
              }, function (error) {
                if (error instanceof TypeError) {
                  // workaround: smart field accesses properties that doesn't exist (e.g. Cannot read properties of undefined (reading 'decimals'))
                  console.error(error);
                } else {
                  _exit2 = true;
                  return true;
                }
              }), function (_result) {
                if (_exit2) return _result;

                // smart fields validation passed, let's check custom rules
                var bMandatory = uiElement.getMandatory() || _this5.valueAsBoolean(uiElement.data("mandatory")) || _this5.valueAsBoolean(uiElement.data("required"));

                var bValueMissing = vRawValue === '' || vRawValue == null || uiElement.getDataType() === "Edm.Decimal" && Number(vRawValue) === 0;

                if (bMandatory && bValueMissing) {
                  // field is mandatory but the value is missing
                  var sMessage = _this5.getResourceBundleText("SMARTFIELD_INVALID_ENTRY");

                  var oException = new ValidateException(sMessage);

                  _this5.fireValidationError(uiElement, sDataProperty, undefined, vUiValue, vRawValue, oException, sMessage);

                  _exit2 = true;
                  return true;
                } // everything is ok


                _this5.fireValidationSuccess(uiElement, sDataProperty, undefined, vUiValue, vRawValue);

                _exit2 = true;
                return false;
              });
            } else return function () {
              if (oValueType != null) {
                // other fields -> let's validate by binding type
                // TODO get source type
                var vParsedValue = oValueType.parseValue(vUiValue, "string");
                return _continue(_catch(function () {
                  return _awaitIgnored(oValueType.validateValue(vParsedValue));
                }, function (error) {
                  // validation error by binding type
                  _this5.fireValidationError(uiElement, sDataProperty, oValueType, vParsedValue, vUiValue, error, error.message);

                  _exit2 = true;
                  return true;
                }), function (_result3) {
                  if (_exit2) return _result3;

                  // everything is ok
                  _this5.fireValidationSuccess(uiElement, sDataProperty, oValueType, vUiValue, vRawValue);

                  _exit2 = true;
                  return false;
                });
              }
            }();
          }, function (_result2) {
            return _exit2 ? _result2 : false;
          })); // not-supported, just report no error
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "validateFieldRadioButton",
      value: function validateFieldRadioButton(uiElement) {
        var bMandatory = this.valueAsBoolean(uiElement.data("mandatory"));
        var sPropertyName = uiElement.data("name");

        if (!bMandatory || !sPropertyName) {
          // not required or no name, no validation necessary/possible
          return false;
        }

        var oBindingContext = uiElement.getBindingContext();

        if (oBindingContext == null) {
          return false;
        }

        var sPropertyValue = oBindingContext.getProperty(sPropertyName);

        if (!sPropertyValue) {
          this.fireValidationError(uiElement, sPropertyName, undefined, sPropertyValue, sPropertyValue, undefined, undefined);
          return true;
        }

        this.fireValidationSuccess(uiElement, sPropertyName, undefined, sPropertyValue, sPropertyValue);
        return false;
      }
    }, {
      key: "validateFieldCheckbox",
      value: function validateFieldCheckbox(uiElement) {
        var bMandatory = this.valueAsBoolean(uiElement.data("mandatory"));
        var sValidationName = uiElement.data("validationname");

        if (!bMandatory || !sValidationName) {
          // not required or no virtual group name, no validation necessary/possible
          return false;
        }

        var oBinding = uiElement.getBinding("selected");

        if (oBinding == null) {
          // no value binding -> nothing to validate -> no error
          return false;
        }

        var oBindingContext = oBinding.getContext();

        if (oBindingContext == null) {
          return false;
        }

        var sDataProperty = oBinding.getPath();
        var bValue = uiElement.getSelected();
        var aAllCheckboxesToValidate = this.view.getControlsByFieldGroupId(sValidationName).filter(function (c) {
          return c.isA(["sap.m.CheckBox"]);
        });
        var bSomeCheckboxIsSelected = aAllCheckboxesToValidate.some(function (c) {
          return c.getSelected();
        });

        if (!bSomeCheckboxIsSelected) {
          // field is mandatory but the value is missing
          var sMessage = this.getResourceBundleText("SMARTFIELD_INVALID_ENTRY");
          var oException = new ValidateException(sMessage);
          this.fireValidationError(uiElement, sDataProperty, undefined, bValue, bValue, oException, sMessage);
          return true;
        }

        this.fireValidationSuccess(uiElement, sDataProperty, undefined, bValue, bValue);
        return false;
      }
      /**
       * Converts any value to boolean. Default will be false.
       * @param vValue value to convert to boolean
       */

    }, {
      key: "valueAsBoolean",
      value: function valueAsBoolean(vValue) {
        return vValue === true || vValue === "true";
      }
    }, {
      key: "fireValidationError",
      value: function fireValidationError(oUiElement, sDataProperty, oType, vParsedValue, vRawValue, error, message) {
        oUiElement.fireValidationError({
          element: oUiElement,
          property: sDataProperty,
          type: oType,
          newValue: vParsedValue,
          oldValue: vRawValue,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          exception: error,
          message: message
        }); // update state & message

        oUiElement.setValueState(ValueState.Error);

        if ("setValueStateText" in oUiElement) {
          oUiElement.setValueStateText(message);
        }
      }
    }, {
      key: "fireValidationSuccess",
      value: function fireValidationSuccess(oUiElement, sDataProperty, oType, vParsedValue, vRawValue) {
        oUiElement.fireValidationSuccess({
          element: oUiElement,
          property: sDataProperty,
          type: oType,
          newValue: vParsedValue,
          oldValue: vRawValue
        }); // reset state & message

        oUiElement.setValueState(undefined);

        if ("setValueStateText" in oUiElement) {
          oUiElement.setValueStateText(undefined);
        }
      }
    }, {
      key: "getResourceBundleText",
      value: function getResourceBundleText(sKey, aParams) {
        // based on smartfield
        var resourceBundle = Core.getLibraryResourceBundle("sap.ui.comp");
        return resourceBundle.getText(sKey, aParams);
      }
    }]);

    return Validator;
  }();

  return Validator;
});
//# sourceMappingURL=Validator.js.map