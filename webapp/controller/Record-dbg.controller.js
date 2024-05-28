"use strict";

sap.ui.define(["sap/m/Button", "sap/m/CheckBox", "sap/m/Dialog", "sap/m/Label", "sap/m/library", "sap/ui/core/HTML", "sap/m/VBox", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/UploadCollectionParameter", "sap/ui/comp/smartfield/SmartField", "sap/ui/core/Core", "sap/ui/core/format/DateFormat", "sap/ui/core/format/FileSizeFormat", "sap/ui/core/Fragment", "sap/ui/core/message/ControlMessageProcessor", "sap/ui/layout/VerticalLayout", "sap/ui/model/ChangeReason", "sap/ui/model/json/JSONModel", "zqm/nc/recdefectfast/controller/Base.controller", "zqm/nc/recdefectfast/util/ODataHelper", "zqm/nc/recdefectfast/util/Validator", "zqm/nc/recdefectfast/util/ValueHelp", "zqm/nc/recdefectfast/util/types", "zqm/nc/recdefectfast/util/debounce", "sap/base/util/array/uniqueSort"], function (Button, CheckBox, Dialog, Label, sap_m_library, HTML, VBox, MessageBox, MessageToast, UploadCollectionParameter, SmartField, Core, DateFormat, FileSizeFormat, Fragment, ControlMessageProcessor, VerticalLayout, ChangeReason, JSONModel, __BaseController, __zqm_nc_recdefectfast_util_ODataHelper, __Validator, __ValueHelp, __zqm_nc_recdefectfast_util_types, __zqm_nc_recdefectfast_util_debounce, uniqueSort) {
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

  function _continueIgnored(value) {
    if (value && value.then) {
      return value.then(_empty);
    }
  }

  function _rethrow(thrown, value) {
    if (thrown) throw value;
    return value;
  }

  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }

    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }

    return finalizer(false, result);
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

  var ButtonType = sap_m_library["ButtonType"];
  var DialogType = sap_m_library["DialogType"];
  var FlexAlignItems = sap_m_library["FlexAlignItems"];
  var Action = MessageBox["Action"];

  var BaseController = _interopRequireDefault(__BaseController);

  var getAffectedPropertiesByChangedProperties = __zqm_nc_recdefectfast_util_ODataHelper["getAffectedPropertiesByChangedProperties"];
  var getAllODataNavigationPropertiesForSapText = __zqm_nc_recdefectfast_util_ODataHelper["getAllODataNavigationPropertiesForSapText"];
  var getEntitySetNameByBindingContextPath = __zqm_nc_recdefectfast_util_ODataHelper["getEntitySetNameByBindingContextPath"];

  var Validator = _interopRequireDefault(__Validator);

  var ValueHelp = _interopRequireDefault(__ValueHelp);

  var isInstanceOf = __zqm_nc_recdefectfast_util_types["isInstanceOf"];
  var debounce = __zqm_nc_recdefectfast_util_debounce["debounce"];
  var FormFieldGroup;

  (function (FormFieldGroup) {
    FormFieldGroup["VALIDATION"] = "validation";
    FormFieldGroup["TEMPLATE"] = "template";
  })(FormFieldGroup || (FormFieldGroup = {}));

  var DEFAULT_UUID = "00000000-0000-0000-0000-000000000000";
  /**
   * @namespace zqm.nc.recdefectfast.controller
   */

  var RecordController = BaseController.extend("zqm.nc.recdefectfast.controller.RecordController", {
    onInit: function _onInit() {
      BaseController.prototype.onInit.call(this);
      this.validator = new Validator(this.getView());
      this.getView().setModel(this.oODataModel); // register model twice to get another binding context for value helps that allows to compare

      this.getView().setModel(this.oODataModel, "vh");
      this.oAttachmentODataModel = this.oOwnerComponent.getModel("odata-attachment");
      this.oAttachmentModel = new JSONModel({
        items: []
      });
      this.getView().setModel(this.oAttachmentModel, "__attachmentData"); // register message manager

      var x = new ControlMessageProcessor();
      this.messageManager = sap.ui.getCore().getMessageManager();
      this.messageManager.registerMessageProcessor(x);
      this.getView().setModel(this.messageManager.getMessageModel(), "message");
      this.messageManager.registerObject(this.getView(), true); // init route
      // eslint-disable-next-line @typescript-eslint/unbound-method

      this.oRouter.getRoute("record").attachPatternMatched(this.onRouteMatched, this); // eslint-disable-next-line @typescript-eslint/unbound-method

      this.oODataModel.attachPropertyChange(this.handleModelPropertyChange, this); // eslint-disable-next-line @typescript-eslint/no-misused-promises,@typescript-eslint/ban-ts-comment
      // @ts-ignore

      this.submitChanges = debounce(this.submitChanges.bind(this), 200);
    },
    onExit: function _onExit() {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      this.oODataModel.detachPropertyChange(this.handleModelPropertyChange, this);
    },
    handleModelPropertyChange: function _handleModelPropertyChange(oEvent) {
      try {
        var _this2 = this;

        var oDraftContext = _this2.oDraftController.getDraftContext();

        var oContext = oEvent.getParameter("context"); // Ignore all cases which are non-draft

        if (!oDraftContext.hasDraft(oContext)) {
          return _await();
        }

        var oMetaModel = _this2.oODataModel.getMetaModel(); // for parameters of function imports special paths are introduced in the model, that are not known in the metamodel
        // as we don't need a merge call for changes to these properties, we can just ignore them


        if (!oMetaModel.getODataEntitySet(getEntitySetNameByBindingContextPath(oContext.getPath()))) {
          return _await();
        }

        return _await(_awaitIgnored(_this2.submitChanges()));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    submitChanges: function _submitChanges() {
      try {
        var _this4 = this;

        var pendingChanges = _this4.oODataModel.getPendingChanges();

        var oContext = _this4.getView().getBindingContext();

        var defectPath = oContext.getPath().replace(/^\/+/, ''); // get changes & affected fields

        var oCurrentChanges = pendingChanges[defectPath] || {};
        var aChangedProperties = Object.keys(oCurrentChanges).filter(function (key) {
          return key !== "__metadata";
        });
        var aAffectedProperties = getAffectedPropertiesByChangedProperties(_this4.oODataModel.getMetaModel(), "C_DefectRecord", aChangedProperties);

        var aAffectedSmartFields = _this4.getView().getControlsByFieldGroupId("").filter(function (oControl) {
          return isInstanceOf(oControl, SmartField);
        }).filter(function (oSmartField) {
          var oProperty = oSmartField.getDataProperty();
          return oProperty != null && oProperty.property != null && aAffectedProperties.indexOf(oProperty.property.name) !== -1;
        });

        return _await(_this4.oDraftController.triggerSubmitChanges({
          noShowSuccessToast: false,
          noShowResponse: true,
          noBlockUI: true,
          failedMsg: "",
          successMsg: ""
        }), function () {
          // Workaround: displayed value of smart fields may be invalid if display value depends on another field
          // that's why we need to refresh the smart field
          aAffectedSmartFields.forEach(function (oSmartField) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (oSmartField._oFactory && oSmartField._oFactory.reBind) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
              oSmartField._oFactory.reBind();
            }
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    valueListChanged: function _valueListChanged(oControlEvent) {
      // Workaround: there is no model property change event by value help
      // we need this to submit changes & to update dependent smart fields
      var oSmartField = oControlEvent.getSource();
      var oBindingContext = this.getView().getBindingContext();
      var oModel = oBindingContext.getModel();
      var changes = oControlEvent.getParameters().changes;
      var sPropertyName = oSmartField.getDataProperty().property.name;
      var sPropertyValue = oSmartField.getValue();

      var enhancedChanges = _objectSpread(_defineProperty({}, sPropertyName, sPropertyValue), changes); // ensure that all attributes from value list are stored in our model


      Object.keys(enhancedChanges).map(function (sProperty) {
        var sPropertyPath = oBindingContext.getPath(sProperty);
        var sValue = enhancedChanges[sProperty];
        return {
          sProperty: sProperty,
          sPropertyPath: sPropertyPath,
          sValue: sValue
        };
      }).forEach(function (item) {
        oModel.setProperty(item.sPropertyPath, item.sValue);
        oModel.firePropertyChange({
          reason: ChangeReason.Change,
          path: item.sProperty,
          value: item.sValue,
          // provided types are wrong
          context: oBindingContext
        });
      });
    },
    onEdit: function _onEdit() {
      try {
        var _this6 = this;

        return _await(_continueIgnored(_catch(function () {
          return _await(_this6.oDraftController.createEditDraftEntity(_this6.getView().getBindingContext(), true), function (_this5$oDraftControll) {
            var _ref = _this5$oDraftControll,
                oEntryContext = _ref.context;

            _this6.navigateToDefectRecord(oEntryContext.getPath());
          });
        }, function (oError) {
          var sErrorMessage = _this6.parseError(oError.response != null ? oError.response : oError);

          MessageBox.error(sErrorMessage, {
            title: _this6.translate("common_text_error")
          });
        })));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    onSave: function _onSave() {
      try {
        var _this8 = this;

        _this8.messageManager.removeAllMessages(); // validate input fields


        return _await(_this8.validator.validateFieldGroup(FormFieldGroup.VALIDATION), function (invalid) {
          if (invalid) {
            _this8.validator.focusFirstError(FormFieldGroup.VALIDATION);

            return;
          }

          return _await(_this8.requestUserConfirmation(), function (confirmed) {
            if (!confirmed) {
              return;
            }

            var oContext = _this8.getView().getBindingContext();

            var bWasDraft = !oContext.getProperty("HasActiveEntity");

            _this8.getView().setBusy(true);

            return _continueIgnored(_catch(function () {
              return _await(_this8.oDraftController.triggerSubmitChanges({
                noShowSuccessToast: false,
                noShowResponse: true,
                noBlockUI: true,
                failedMsg: "",
                successMsg: ""
              }), function () {
                return _await(_this8.oOwnerComponent.getDraftController().prepareDraftEntity(oContext), function () {
                  return _await(_this8.oOwnerComponent.getDraftController().activateDraftEntity(oContext, "to_DefectCategory,to_DefectLongTextTP"), function (_this7$oOwnerComponen) {
                    var _ref2 = _this7$oOwnerComponen,
                        oEntryContext = _ref2.context;

                    _this8.getView().setBusy(false);

                    _this8.navigateToDefectRecord(oEntryContext.getPath());

                    MessageToast.show(_this8.translate(bWasDraft ? "defect_status_create_success" : "defect_status_update_success"));
                  });
                });
              });
            }, function (oError) {
              _this8.getView().setBusy(false);

              var sErrorMessage = _this8.parseError(oError);

              MessageBox.error(sErrorMessage, {
                title: _this8.translate("defect_status_save_error")
              });
            }));
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    onDiscardDraft: function _onDiscardDraft() {
      var _this9 = this;

      var oContext = this.getView().getBindingContext();
      var bHasActiveEntity = oContext.getProperty("HasActiveEntity");
      var sDefectInternalID = oContext.getProperty("DefectInternalID");
      MessageBox.warning(bHasActiveEntity ? this.translate("defect_discard_defect_changes_text") : this.translate("defect_discard_defect_draft_text"), {
        title: bHasActiveEntity ? this.translate("defect_discard_defect_changes_title") : this.translate("defect_discard_defect_draft_title"),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: missing type actions
        actions: [Action.OK, Action.CANCEL],
        emphasizedAction: Action.OK,
        onClose: function onClose(sAction) {
          if (sAction === Action.OK) {
            _this9.oODataModel.remove(oContext.getPath(), {
              success: function success() {
                if (bHasActiveEntity) {
                  // there is a non-draft version -> navigate to it
                  var sPathNonDraft = _this9.oODataModel.createKey("/C_DefectRecord", {
                    DefectInternalID: sDefectInternalID,
                    DraftUUID: DEFAULT_UUID,
                    IsActiveEntity: true
                  });

                  _this9.navigateToDefectRecord(sPathNonDraft, true);
                } else {
                  // back to launchpad
                  _this9.navigateBack();
                }
              },
              error: function error(oError) {
                var sErrorMessage = _this9.parseError(oError);

                MessageBox.error(sErrorMessage, {
                  title: _this9.translate("defect_discard_status_error")
                });
              }
            });
          }
        }
      });
    },
    onCreateDefect: function _onCreateDefect() {
      var _this10 = this;

      var oModelContext = this.getView().getBindingContext();
      var oSubmitDialog = new Dialog({
        type: DialogType.Message,
        title: this.translate("defect_create_new_dialog_title"),
        content: [new VerticalLayout({
          content: [new Label({
            text: this.translate("defect_create_new_dialog_text")
          }), new CheckBox("createDefectWithTemplate", {
            text: this.translate("defect_create_new_dialog_current_as_template"),
            selected: true
          })]
        })],
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: this.translate("common_action_create"),
          press: function press() {
            var bCreateDefectWithTemplate = Core.byId("createDefectWithTemplate").getSelected();
            oSubmitDialog.setBusy(true);
            var sDefectCategory = oModelContext.getProperty("DefectCategory");
            var sLayoutVariant = oModelContext.getProperty("ZZ1_NC_LAYOUT_VARIANT_NIT");

            var oPredefinedValues = _objectSpread(_objectSpread({}, bCreateDefectWithTemplate ? _this10.getTemplateValues() : {}), {}, {
              ZZ1_NC_LAYOUT_VARIANT_NIT: sLayoutVariant,
              DefectCategory: sDefectCategory
            });

            _this10.navigateToCreateDefect(oPredefinedValues, false);

            oSubmitDialog.close();
            oSubmitDialog.destroy();
          }
        }),
        endButton: new Button({
          text: this.translate("common_action_cancel"),
          press: function press() {
            oSubmitDialog.close();
            oSubmitDialog.destroy();
          }
        })
      });
      oSubmitDialog.open();
    },
    onPrintBlockingCard: function _onPrintBlockingCard() {
      var _this11 = this;

      var oDataModelManageDefect = this.oOwnerComponent.getModel("odata-manage-defect");
      var oModelContext = this.getView().getBindingContext();
      var sDefectInternalID = oModelContext.getProperty("DefectInternalID");
      var oSubmitDialog = new Dialog({
        type: DialogType.Message,
        title: this.translate("blocking_card_print_dialog_title"),
        content: [new VerticalLayout({
          content: [new Label({
            text: this.translate("blocking_card_print_dialog_text")
          })]
        })],
        beginButton: new Button({
          type: ButtonType.Emphasized,
          text: this.translate("common_action_print"),
          press: function press() {
            oSubmitDialog.setBusy(true);
            oDataModelManageDefect.callFunction("/C_DefectMng_Print_Blocking_Card", {
              method: "POST",
              urlParameters: {
                "DefectInternalId": sDefectInternalID
              },
              success: function success() {
                oSubmitDialog.setBusy(false);
                oSubmitDialog.close();
                oSubmitDialog.destroy();
                MessageToast.show(_this11.translate("blocking_card_print_status_success"));
              },
              error: function error(oError) {
                var sErrorMessage = _this11.parseError(oError);

                oSubmitDialog.setBusy(false);
                MessageBox.error(sErrorMessage, {
                  title: _this11.translate("blocking_card_print_status_error")
                });
              }
            });
          }
        }),
        endButton: new Button({
          text: this.translate("common_action_cancel"),
          press: function press() {
            oSubmitDialog.close();
            oSubmitDialog.destroy();
          }
        })
      });
      oSubmitDialog.open();
    },
    onMessagePopoverPress: function _onMessagePopoverPress(oEvent) {
      try {
        var _this13 = this;

        var source = oEvent.getSource();
        return _await(_this13.getMessagePopover(), function (messagePopover) {
          messagePopover.openBy(source);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    isValueEqual: function _isValueEqual(value1, value2) {
      return value1 === value2;
    },
    onSelectRadioButton: function _onSelectRadioButton(oEvent, propertyName) {
      var iIndex = oEvent.getParameter("selectedIndex");
      var oRadioButtonGroup = oEvent.getSource();
      var oSelectedButton = oRadioButtonGroup.getButtons()[iIndex];
      var sSelectedValue = oSelectedButton.data("value");
      var sAbsoluteModelPropertyPath = oRadioButtonGroup.getBindingContext().getPath(propertyName);
      var oModel = oRadioButtonGroup.getBindingContext().getModel();
      oModel.setProperty(sAbsoluteModelPropertyPath, sSelectedValue);
      oModel.firePropertyChange({
        reason: ChangeReason.Change,
        path: propertyName,
        value: sSelectedValue,
        // provided types are wrong
        context: oRadioButtonGroup.getBindingContext()
      }); // reset validation state

      oRadioButtonGroup.setValueState(undefined);
    },
    onSelectCheckbox: function _onSelectCheckbox(oEvent) {
      var _this14 = this;

      var oCheckbox = oEvent.getSource();
      var sValidationName = oCheckbox.data("validationname");

      if (!sValidationName) {
        return;
      }

      var aAllCheckboxesForSameVirtualField = this.getView().getControlsByFieldGroupId(sValidationName).filter(function (c) {
        return c.isA(["sap.m.CheckBox"]);
      });
      aAllCheckboxesForSameVirtualField.forEach(function (c) {
        _this14.validator.validateFieldCheckbox(c);
      });
    },
    onValueHelpRequested: function _onValueHelpRequested(oEvent, sPropertyName) {
      try {
        var _this16 = this;

        return _await(_awaitIgnored(ValueHelp.showValueHelp(_this16.getView().getBindingContext(), sPropertyName)));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    onElementHiddenResetValue: function _onElementHiddenResetValue(oEvent) {
      var oControl = oEvent.getSource();

      if (!oControl.getVisible()) {
        var oPropertyBinding = oControl.getBinding("value");
        oPropertyBinding.setValue("");
      }
    },
    onRouteMatched: function _onRouteMatched(oEvent) {
      try {
        var _this18 = this;

        var oArguments = oEvent.getParameter("arguments");
        var sDefectRecordPath = "/" + oArguments.defectRecordPath;

        _this18.getView().setBusy(true); // determine navigation properties that we have to expand to get the texts or data


        return _await(_this18.oODataModel.metadataLoaded(), function () {
          var aNavigationPropertiesForText = getAllODataNavigationPropertiesForSapText(_this18.oODataModel.getMetaModel(), "C_DefectRecord");
          var aNavigationPropertiesForCustomFields = aNavigationPropertiesForText.filter(function (item) {
            return item.startsWith("to_ZZ1");
          });
          var aNavigationPropertiesForStandardFields = ["to_Product", "to_DefectCode", "to_DefectCodeGroup", "to_DefectCategory", "to_DefectLongTextTP", "to_ProductionOrderStdVH", "to_ProdnOrdOpBySemKeyStdVH", "to_StorageLocation"];
          var aNavigationPropertiesToExpand = [].concat(aNavigationPropertiesForCustomFields, aNavigationPropertiesForStandardFields).sort(); // read defect

          _this18.oODataModel.read(sDefectRecordPath, {
            urlParameters: {
              $expand: aNavigationPropertiesToExpand.join(",")
            },
            success: _async(function () {
              _this18.getView().bindElement({
                path: sDefectRecordPath,
                parameters: {
                  expand: aNavigationPropertiesToExpand.join(",")
                }
              });

              var sDefectCategory = _this18.oODataModel.getProperty(sDefectRecordPath + "/DefectCategory");

              var sLayoutVariant = _this18.oODataModel.getProperty(sDefectRecordPath + "/ZZ1_NC_LAYOUT_VARIANT_NIT");

              if (!sLayoutVariant) {
                // set layout variant for existing errors
                sLayoutVariant = "STANDARD";

                _this18.oODataModel.setProperty(sDefectRecordPath + "/ZZ1_NC_LAYOUT_VARIANT_NIT", sLayoutVariant);
              }

              return _continueIgnored(_finallyRethrows(function () {
                return _catch(function () {
                  return _awaitIgnored(Promise.all([_this18.initDefectCategory(sDefectCategory, sLayoutVariant), _this18._readAttachments()]));
                }, function (error) {
                  var sErrorMessage = _this18.parseError(error);

                  MessageBox.error(sErrorMessage, {
                    title: _this18.translate("common_text_error")
                  });
                });
              }, function (_wasThrown, _result) {
                _this18.getView().setBusy(false);

                return _rethrow(_wasThrown, _result);
              }));
            }),
            error: function error(_error) {
              var sErrorMessage = _this18.parseError(_error);

              MessageBox.error(sErrorMessage, {
                title: _this18.translate("common_text_error")
              });
            }
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    onBeforeStartAttachmentUpload: function _onBeforeStartAttachmentUpload(oEvent) {
      var oContext = this.getView().getBindingContext();
      var sDefectInternalID = oContext.getProperty("DefectInternalID");
      var sFileName = oEvent.getParameter("fileName");
      var addHeaderParameter = oEvent.getParameter("addHeaderParameter");
      addHeaderParameter(new UploadCollectionParameter({
        name: "objectKey",
        value: btoa(encodeURIComponent(sDefectInternalID))
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "objectType",
        value: "QFGEN"
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "documentType",
        value: "A03"
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "documentNumber",
        value: ""
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "documentVersion",
        value: ""
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "documentPart",
        value: ""
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "semanticobjecttype",
        value: ""
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "Accept",
        value: "application/json"
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "slug",
        value: btoa(encodeURIComponent(sFileName))
      }));
      addHeaderParameter(new UploadCollectionParameter({
        name: "x-csrf-token",
        value: this.oAttachmentODataModel.getSecurityToken()
      }));
    },
    onCompletedAttachmentUpload: function _onCompletedAttachmentUpload(oEvent) {
      var _this19 = this;

      var oAttachmentData = this.oAttachmentModel.getData();
      var aFiles = oEvent.getParameter("files");
      aFiles.forEach(function (oFile) {
        try {
          if (oFile.status === 200 || oFile.status === 201) {
            var oResponse = JSON.parse(oFile.responseRaw);
            oAttachmentData.items.unshift(_this19._mapOriginalContentToAttachmentItem(oResponse.d));
          } else if (oFile.responseRaw) {
            throw new Error(_this19.parseError({
              responseText: oFile.responseRaw
            }));
          } else {
            throw new Error();
          }
        } catch (error) {
          var sErrorMessage = _this19.parseError(error);

          MessageBox.error(sErrorMessage, {
            title: _this19.translate("defect_attachment_upload_error")
          });
        }
      });
      this.oAttachmentModel.setData(oAttachmentData, false);
      this.oAttachmentModel.refresh(true);
    },
    onDeleteAttachmentUpload: function _onDeleteAttachmentUpload(oEvent) {
      var _this20 = this;

      var oContext = this.getView().getBindingContext();
      var sDefectInternalID = oContext.getProperty("DefectInternalID");
      var oItem = oEvent.getParameter("item");
      var oItemData = oItem.getBindingContext("__attachmentData").getObject();
      var sAttachmentUri = this.oAttachmentODataModel.createKey("/OriginalContentSet", {
        FileId: oItemData.FileId,
        ApplicationId: oItemData.ApplicationId,
        Filename: oItemData.Filename,
        Documentnumber: oItemData.Documentnumber,
        Documenttype: oItemData.Documenttype,
        Documentpart: oItemData.Documentpart,
        Documentversion: oItemData.Documentversion
      });
      this.oAttachmentODataModel.remove(sAttachmentUri, {
        // this is needed -> otherwise draft handling does not work
        headers: {
          "objectkey": btoa(encodeURIComponent(sDefectInternalID)),
          "objecttype": "QFGEN",
          "semanticobjecttype": "",
          "markfordeletion": "true"
        },
        success: function success() {
          var _ref3 = _this20.oAttachmentModel.getData(),
              items = _ref3.items;

          var aFilteredItems = items.filter(function (item) {
            return item !== oItemData;
          });

          _this20.oAttachmentModel.setData({
            items: aFilteredItems
          });
        },
        error: function error(oError) {
          var sErrorMessage = _this20.parseError(oError);

          MessageBox.error(sErrorMessage, {
            title: _this20.translate("defect_attachment_delete_error")
          });
        }
      });
    },
    onTakePictureAsAttachment: function _onTakePictureAsAttachment() {
      var _this21 = this;

      var oVideoElement = undefined;
      var oStream = undefined;
      var sVideoPlayerId = "video-player-".concat(new Date().getTime());
      var dialog = new Dialog({
        busy: true,
        title: this.translate("take_picture_dialog_title"),
        beginButton: new Button({
          text: this.translate("common_action_capture"),
          type: ButtonType.Emphasized,
          press: function press() {
            dialog.setBusy(true);
            oVideoElement.pause(); // // create a canvas and draw image by video

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = oVideoElement.videoWidth;
            canvas.height = oVideoElement.videoHeight;
            ctx.drawImage(oVideoElement, 0, 0); // request a Blob from the canvas

            var contentType = "image/jpeg";
            canvas.toBlob(function (blob) {
              _this21._uploadFile(new File([blob], "image.jpg", {
                type: contentType
              }));

              dialog.close();
            }, contentType);
          }
        }),
        content: [new VBox({
          alignItems: FlexAlignItems.Center,
          fitContainer: true,
          items: [new HTML({
            content: "<video id='".concat(sVideoPlayerId, "' autoplay/>")
          })]
        })],
        afterOpen: function afterOpen() {
          oVideoElement = document.getElementById(sVideoPlayerId);
          navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: 'environment'
            }
          }).then(function (stream) {
            // if this no longer open -> clean up stream and cancel
            if (!dialog.isOpen()) {
              stream.getTracks().forEach(function (track) {
                return track.stop();
              });
              return;
            }

            dialog.setBusy(false);
            oStream = stream;

            if (oVideoElement) {
              oVideoElement.srcObject = stream;
            }
          })["catch"](function (e) {
            dialog.setBusy(false);
            dialog.close();

            var sErrorMessage = _this21.parseError(e);

            MessageBox.error(sErrorMessage, {
              title: _this21.translate("common_text_error")
            });
          });
        },
        afterClose: function afterClose() {
          dialog.close();

          if (oStream) {
            oStream.getTracks().forEach(function (track) {
              return track.stop();
            });
            oStream = undefined;
            oVideoElement = undefined;
          }

          if (oVideoElement) {
            oVideoElement.pause();
            oVideoElement.src = "";
            oVideoElement.srcObject = null;
            oVideoElement = undefined;
          }
        },
        endButton: new Button({
          text: this.translate("common_action_cancel"),
          press: function press() {
            dialog.close();
          }
        })
      });
      dialog.open();
    },
    _uploadFile: function _uploadFile(oFile) {
      var oAttachmentUpl = this.getView().byId("attachmentServiceFileUpload"); // workaround: there is no API to upload a file programmatically, that's why we have to simulate the user file dialog action
      // prepare files

      var dataTransfer = new DataTransfer();
      dataTransfer.items.add(oFile); // replace files on input

      var oFileUploader = oAttachmentUpl._oFileUploader;
      var oFileUpload = oFileUploader.oFileUpload;
      oFileUpload.files = dataTransfer.files; // trigger change event

      oFileUpload.dispatchEvent(new window.Event('change'));
    },
    _readAttachments: function _readAttachments() {
      try {
        var _this23 = this;

        var oContext = _this23.getView().getBindingContext();

        var sDefectInternalID = oContext.getProperty("DefectInternalID");
        var bIsActiveEntity = oContext.getProperty("IsActiveEntity");
        return _await(_awaitIgnored(new Promise(function (resolve, reject) {
          _this23.oAttachmentODataModel.callFunction("/GetAllOriginals", {
            method: "GET",
            urlParameters: {
              ObjectType: "QFGEN",
              ObjectKey: sDefectInternalID,
              SemanticObjectType: "",
              IsDraft: JSON.stringify(!bIsActiveEntity),
              AttachmentFramework: ""
            },
            success: function success(oData) {
              var aItems = oData.results.map(function (oItem) {
                return _this23._mapOriginalContentToAttachmentItem(oItem);
              });

              _this23.oAttachmentModel.setData({
                items: aItems
              });

              _this23.oAttachmentModel.refresh(true);

              resolve();
            },
            error: reject
          });
        })));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _mapOriginalContentToAttachmentItem: function _mapOriginalContentToAttachmentItem(oFile) {
      var dCreatedAt = oFile.CreatedAt == null ? null : oFile.CreatedAt instanceof Date ? oFile.CreatedAt : new Date(parseInt(oFile.CreatedAt.substr(6)));
      var bThumbnailForContentTypeSupported = typeof oFile.ContentType === "string" ? oFile.ContentType.toLowerCase().indexOf("image/") === 0 : false;
      return {
        FileId: oFile.FileId,
        ApplicationId: oFile.ApplicationId,
        Filename: oFile.Filename,
        Documentnumber: oFile.Documentnumber ? oFile.Documentnumber : "",
        Documenttype: oFile.Documenttype,
        Documentversion: oFile.Documentversion ? oFile.Documentversion : "",
        Documentpart: oFile.Documentpart ? oFile.Documentpart : "",
        thumbnailUrl: bThumbnailForContentTypeSupported && oFile.__metadata.media_src ? this._removeHostFromSapUrl(oFile.__metadata.media_src) : null,
        createdAt: dCreatedAt != null ? dCreatedAt.getTime() : null,
        attributes: [{
          title: this.oAttachmentODataModel.getProperty("/#OriginalContent/CreatedAt/@sap:label"),
          text: this._formatDate(dCreatedAt),
          visible: true
        }, {
          title: this.oAttachmentODataModel.getProperty("/#OriginalContent/Filesize/@sap:label"),
          text: this._formatFileSize(oFile.Filesize),
          visible: true
        }],
        markers: oFile.AttachmentStatus !== "DRAFT" ? [] : [{
          type: "Draft"
        }]
      };
    },
    _removeHostFromSapUrl: function _removeHostFromSapUrl(sLink) {
      return sLink.substring(sLink.indexOf("/sap/opu/odata/"), sLink.length);
    },
    _formatDate: function _formatDate(dDate) {
      return DateFormat.getDateTimeInstance({
        style: "medium"
      }).format(dDate);
    },
    _formatFileSize: function _formatFileSize(sValue) {
      return FileSizeFormat.getInstance({
        binaryFilesize: false,
        maxFractionDigits: 2,
        maxIntegerDigits: 3
      }).format(sValue);
    },
    initDefectCategory: function _initDefectCategory(sDefectCategory, sLayoutVariant) {
      try {
        var _this25 = this;

        // abort if already initialized
        if (_this25.defectCategory === sDefectCategory && _this25.layoutVariant === sLayoutVariant) {
          return _await();
        }

        _this25.defectCategory = sDefectCategory;
        _this25.layoutVariant = sLayoutVariant;
        var sFragmentName = "zqm.nc.recdefectfast.fragment.form.".concat(_this25.defectCategory, "-").concat(_this25.layoutVariant, "-Form");
        return _await(Fragment.load({
          id: _this25.getView().getId(),
          controller: _this25,
          name: sFragmentName
        }), function (_Fragment$load) {
          var oControl = _Fragment$load;

          var oPanel = _this25.getView().byId("form-fragment-content");

          oPanel.removeAllContent();
          oPanel.addContent(oControl);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    showMessageBox: function _showMessageBox(oOptions) {
      try {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        var msgFn = oOptions.type === "confirm" ? MessageBox.confirm : oOptions.type === "warning" ? MessageBox.warning : MessageBox.confirm;
        return _await(new Promise(function (resolve) {
          msgFn(oOptions.message, {
            title: oOptions.title,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore: missing type actions
            actions: [Action.OK, Action.CANCEL],
            emphasizedAction: Action.OK,
            onClose: function onClose(sAction) {
              resolve(sAction === Action.OK);
            }
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    requestUserConfirmation: function _requestUserConfirmation() {
      try {
        var _this27 = this;

        var oContext = _this27.getView().getBindingContext();

        var sDefectCategory = oContext.getProperty("DefectCategory");
        var sLayoutVariant = oContext.getProperty("ZZ1_NC_LAYOUT_VARIANT_NIT");
        var sMaterial = oContext.getProperty("Material");

        if (sDefectCategory === "ZL" && sLayoutVariant === "STANDARD" && !sMaterial) {
          // STAP Warehouse: confirmation for missing material
          return _await(_this27.showMessageBox({
            type: "confirm",
            message: _this27.translate("defect_confirm_missing_material")
          }));
        }

        return _await(true);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    getTemplateProperties: function _getTemplateProperties() {
      var fieldProperites = this.getView().getControlsByFieldGroupId(FormFieldGroup.TEMPLATE).filter(function (c) {
        return ["sap.m.Input", "sap.m.ComboBox", "sap.m.Switch", "sap.ui.comp.smartfield.SmartField"].indexOf(c.getMetadata().getName()) !== -1;
      }).map(function (c) {
        switch (c.getMetadata().getName()) {
          case "sap.m.ComboBox":
          case "sap.m.Input":
          case "sap.ui.comp.smartfield.SmartField":
            {
              return c.getBinding("value").getPath();
            }

          case "sap.m.Switch":
            return c.getBinding("state").getPath();

          default:
            {
              return;
            }
        }
      }).filter(function (sPropertyPath) {
        return sPropertyPath != null;
      });
      return uniqueSort(fieldProperites);
    },
    getTemplateValues: function _getTemplateValues() {
      var _this28 = this;

      var aTemplateProperties = this.getTemplateProperties();
      var aTemplateAndAffectedProperties = getAffectedPropertiesByChangedProperties(this.oODataModel.getMetaModel(), "C_DefectRecord", aTemplateProperties);
      return aTemplateAndAffectedProperties.filter(function (sPropertyPath) {
        return sPropertyPath != null;
      }).map(function (sPropertyPath) {
        return {
          property: sPropertyPath,
          value: _this28.getView().getBindingContext().getProperty(sPropertyPath)
        };
      }).reduce(function (oValueMap, oField) {
        return _objectSpread(_objectSpread({}, oValueMap), {}, _defineProperty({}, oField.property, oField.value));
      }, {});
    },
    getMessagePopover: function _getMessagePopover() {
      var _this29 = this;

      // create popover lazily (singleton)
      if (this.messagePopover == null) {
        this.messagePopover = Fragment.load({
          id: this.getView().getId(),
          name: "zqm.nc.recdefectfast.fragment.MessagePopover"
        }).then(function (oMessagePopover) {
          _this29.getView().addDependent(oMessagePopover);

          return oMessagePopover;
        });
      }

      return this.messagePopover;
    }
  });
  return RecordController;
});
//# sourceMappingURL=Record.controller.js.map