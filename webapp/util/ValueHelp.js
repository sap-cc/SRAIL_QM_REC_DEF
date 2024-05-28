"use strict";sap.ui.define(["sap/m/CheckBox","sap/m/Label","sap/m/Text","sap/ui/comp/valuehelpdialog/ValueHelpDialog","sap/ui/model/ChangeReason","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/table/Column","zqm/nc/recdefectfast/util/ODataHelper"],function(e,t,r,a,n,o,l,i,u){function p(e,t,r){if(r){return t?t(e):e}if(!e||!e.then){e=Promise.resolve(e)}return t?e.then(t):e}function c(e,t){if(!(e instanceof t)){throw new TypeError("Cannot call a class as a function")}}function s(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||false;a.configurable=true;if("value"in a)a.writable=true;Object.defineProperty(e,a.key,a)}}function f(e,t,r){if(t)s(e.prototype,t);if(r)s(e,r);Object.defineProperty(e,"prototype",{writable:false});return e}var y=u["getEntitySetNameByBindingContextPath"];var P=u["getODataEntityTypeByEntitySet"];var d=u["getODataPropertyForEntitySet"];var m=u["ODataValueListParameterRecordType"];var v=function(){function u(){c(this,u)}f(u,null,[{key:"showValueHelp",value:function u(c,s){try{var f=c.getModel();if(f.getMetadata().getName()!=="sap.ui.model.odata.v2.ODataModel"){return p()}return p(f.metadataLoaded(true),function(){var u=f.getMetaModel();return p(u.loaded(),function(){var p=y(c.getPath());var v=d(u,p,s);var g=v["com.sap.vocabularies.Common.v1.ValueList"];if(g==null){return}var h=P(u,g.CollectionPath.String);if(h==null){return}var L=h.key.propertyRef.map(function(e){return e.name});var b=g.Parameters.filter(function(e){return e.ValueListProperty.String!=null&&L.indexOf(e.ValueListProperty.String)!==-1});var V=b.find(function(e){return e.LocalDataProperty!=null&&e.LocalDataProperty.PropertyPath===s});var O=b.filter(function(e){return e!==V});var S=new a({title:v["sap:label"],key:V===null||V===void 0?void 0:V.ValueListProperty.String,keys:O.map(function(e){return e.ValueListProperty.String}),supportMultiselect:false,supportRanges:false,supportRangesOnly:false,ok:function e(t){var r=S.getTable();var a=r.getSelectedIndices().shift();if(a!=null){var o=r.getContextByIndex(a);g.Parameters.filter(function(e){return e.RecordType===m.ValueListParameterInOut||e.RecordType===m.ValueListParameterOut}).forEach(function(e){var t=o.getProperty(e.ValueListProperty.String);var r=c.getPath(e.LocalDataProperty.PropertyPath);console.log("setting",r,"to",t);f.setProperty(r,t);f.firePropertyChange({reason:n.Change,path:e.LocalDataProperty.PropertyPath,value:t,context:c})})}S.close()},cancel:function e(){S.close()},afterClose:function e(){S.destroy()}});var D=g.Parameters.filter(function(e){return e.RecordType===m.ValueListParameterInOut||e.RecordType===m.ValueListParameterDisplayOnly||e.RecordType===m.ValueListParameterOut}).map(function(e){var t,r;return{label:(t=h.property.find(function(t){return t.name===e.ValueListProperty.String}))===null||t===void 0?void 0:t["sap:label"],type:(r=h.property.find(function(t){return t.name===e.ValueListProperty.String}))===null||r===void 0?void 0:r.type,property:e.ValueListProperty.String}}).filter(function(e){return e.label!=null}).map(function(a){return new i({label:new t({text:a.label}),template:a.type==="Edm.Boolean"?new e({selected:{path:a.property},enabled:false}):new r({text:{path:a.property}})})});var C=S.getTable();D.forEach(function(e){C.addColumn(e)});var R=g.Parameters.filter(function(e){return e.RecordType===m.ValueListParameterInOut||e.RecordType===m.ValueListParameterIn}).filter(function(e){return e.LocalDataProperty.PropertyPath!=null&&e.LocalDataProperty.PropertyPath!==s}).map(function(e){var t=c.getProperty(e.LocalDataProperty.PropertyPath);if(t!=null&&t!==""){return new o(e.ValueListProperty.String,l.EQ,t)}return null}).filter(function(e){return e!=null});C.setModel(f);C.bindRows({path:"/"+g.CollectionPath.String,filters:R});S.open()})})}catch(e){return Promise.reject(e)}}}]);return u}();return v});