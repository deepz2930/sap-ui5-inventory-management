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

            var oProductsModel = new JSONModel();
            oProductsModel.loadData(
                sap.ui.require.toUrl("learning/northwind/model/products.json")
            );

            this.setModel(oProductsModel, "products");

            this.getRouter().initialize();
        }
    });
});