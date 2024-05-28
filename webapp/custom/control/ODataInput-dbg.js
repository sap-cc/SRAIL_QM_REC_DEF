"use strict";

sap.ui.define(["sap/m/Input", "sap/ui/model/type/String", "sap/ui/model/odata/type/Decimal", "zqm/nc/recdefectfast/util/ODataHelper"], function (Input, ModelString, ModelDecimal, __zqm_nc_recdefectfast_util_ODataHelper) {
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

  function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }

  function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

  function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }

  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }

  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }

  function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

  var getEntitySetNameByBindingContextPath = __zqm_nc_recdefectfast_util_ODataHelper["getEntitySetNameByBindingContextPath"];
  var getODataPropertyForEntitySet = __zqm_nc_recdefectfast_util_ODataHelper["getODataPropertyForEntitySet"];
  var isODataModel = __zqm_nc_recdefectfast_util_ODataHelper["isODataModel"];
  var isODataPropertyBinding = __zqm_nc_recdefectfast_util_ODataHelper["isODataPropertyBinding"];
  /**
   * @namespace zqm.nc.recdefectfast.custom.control
   *
   * Improved version of input that sap.m.Input that sets constraints for the property from odata metadata automatically
   */

  var ODataInput = /*#__PURE__*/function (_Input) {
    _inherits(ODataInput, _Input);

    var _super = _createSuper(ODataInput);

    function ODataInput() {
      _classCallCheck(this, ODataInput);

      return _super.apply(this, arguments);
    }

    _createClass(ODataInput, [{
      key: "init",
      value: function init() {
        _get(_getPrototypeOf(ODataInput.prototype), "init", this).call(this); // eslint-disable-next-line @typescript-eslint/unbound-method


        this.attachModelContextChange(this.handleBinding, this);
      }
    }, {
      key: "exit",
      value: function exit() {
        _get(_getPrototypeOf(ODataInput.prototype), "exit", this).call(this); // eslint-disable-next-line @typescript-eslint/unbound-method


        this.detachModelContextChange(this.handleBinding, this);
      }
    }, {
      key: "onBeforeRendering",
      value: function onBeforeRendering() {
        _get(_getPrototypeOf(ODataInput.prototype), "onBeforeRendering", this).call(this);
      }
    }, {
      key: "handleBinding",
      value: function handleBinding() {
        try {
          var _this2 = this;

          var binding = _this2.getBinding("value");

          if (binding == null) {
            return _await();
          }

          var context = binding.getContext();
          var model = binding.getModel();

          if (context == null || !isODataPropertyBinding(binding) || !isODataModel(model)) {
            return _await();
          } // wait until model & metadata loaded


          return _await(model.metadataLoaded(), function () {
            var metaModel = model.getMetaModel();
            return _await(metaModel.loaded(), function () {
              // determine oData property definition
              var property = binding.getPath();
              var bindingContextPath = context.getPath();
              var entitySet = getEntitySetNameByBindingContextPath(bindingContextPath);
              var oODataProperty = getODataPropertyForEntitySet(metaModel, entitySet, property);

              if (oODataProperty == null) {
                return;
              } // update value binding with type from odata metadata


              if (oODataProperty.type === "Edm.String") {
                var required = !!_this2.getProperty("required");
                var oType = new ModelString({
                  parseKeepsEmptyString: false
                }, {
                  minLength: required || oODataProperty.nullable === "false" ? 1 : 0,
                  maxLength: oODataProperty.maxLength != null ? Number(oODataProperty.maxLength) : undefined
                });
                binding.setType(oType, "string");
              } else if (oODataProperty.type === "Edm.Decimal") {
                var _required = !!_this2.getProperty("required");

                var scale = oODataProperty.scale != null ? Number(oODataProperty.scale) : undefined;

                var _oType = new ModelDecimal({}, {
                  nullable: !_required || oODataProperty.nullable == null ? true : oODataProperty.nullable === "true",
                  precision: oODataProperty.precision != null ? Number(oODataProperty.precision) : undefined,
                  scale: scale
                });

                var internalType = scale == null || scale === 0 ? "int" : "float";
                binding.setType(_oType, internalType);
              } else {
                console.warn("Error: Unsupported type '".concat(oODataProperty.type, "' for property ").concat(property));
              }
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }]);

    return ODataInput;
  }(Input);

  return ODataInput;
});
//# sourceMappingURL=ODataInput.js.map