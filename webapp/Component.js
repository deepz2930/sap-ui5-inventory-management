sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("learning.northwind.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      // The "" model from manifest.json is a READ-ONLY OData model
      // pointed at Northwind. We use it once, here, to fetch the
      // initial data. We then copy that data into a JSONModel named
      // "products" — every view in the app binds to "products>...",
      // and all Create/Update/Delete logic works against this local
      // copy, since the public Northwind service itself doesn't allow
      // writes. In a real project, you'd skip this copy step and call
      // oDataModel.create() / .update() / .remove() directly.
      var oDataModel = this.getModel();
      var oProductsModel = new JSONModel({ Products: [] });
      this.setModel(oProductsModel, "products");

      oDataModel.read("/Products", {
        urlParameters: { "$top": "30" },
        success: function (oData) {
          oProductsModel.setProperty("/Products", oData.results);
        },
        error: function (oError) {
          // eslint-disable-next-line no-console
          console.error("Failed to load Northwind products", oError);
        }
      });

      this.getRouter().initialize();
    }
  });
});

