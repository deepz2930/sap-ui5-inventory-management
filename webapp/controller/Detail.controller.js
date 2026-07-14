sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "learning/northwind/model/formatter"
], function (Controller, JSONModel, MessageToast, MessageBox, formatter) {
  "use strict";

  return Controller.extend("learning.northwind.controller.Detail", {

    formatter: formatter,

    onInit: function () {
      // A small local view model just for UI state (not product data)
      this.getView().setModel(new JSONModel({ editMode: false }), "ui");

      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("detail").attachPatternMatched(this._onProductMatched, this);
    },

    _onProductMatched: function (oEvent) {
      var sProductID = oEvent.getParameter("arguments").productID;
      var oProductsModel = this.getOwnerComponent().getModel("products");
      var aProducts = oProductsModel.getProperty("/Products");

      var iIndex = aProducts.findIndex(function (oProduct) {
        // productID from the URL is always a string; compare loosely
        return String(oProduct.ProductID) === String(sProductID);
      });

      if (iIndex === -1) {
        MessageToast.show("Product not found");
        this.onNavBack();
        return;
      }

      this._sBindingPath = "/Products/" + iIndex;
      this.getView().bindElement({
        path: this._sBindingPath,
        model: "products"
      });

      this.getView().getModel("ui").setProperty("/editMode", false);
    },

    // ---------------- UPDATE ----------------
    onEdit: function () {
      // Snapshot the current record so Cancel can restore it exactly
      // (bindings are two-way, so typing already updates the model
      // live — this snapshot is what makes Cancel actually work).
      var oProductsModel = this.getOwnerComponent().getModel("products");
      this._oSnapshot = JSON.parse(JSON.stringify(oProductsModel.getProperty(this._sBindingPath)));
      this.getView().getModel("ui").setProperty("/editMode", true);
    },

    onSave: function () {
      var oProductsModel = this.getOwnerComponent().getModel("products");
      oProductsModel.refresh(); // pushes edits out to the list + KPI tiles
      this.getView().getModel("ui").setProperty("/editMode", false);
      MessageToast.show("Product updated (demo mode — saved locally)");
    },

    onCancel: function () {
      var oProductsModel = this.getOwnerComponent().getModel("products");
      oProductsModel.setProperty(this._sBindingPath, this._oSnapshot);
      this.getView().getModel("ui").setProperty("/editMode", false);
    },

    // ---------------- DELETE ----------------
    onDelete: function () {
      var oProductsModel = this.getOwnerComponent().getModel("products");
      var sProductName = oProductsModel.getProperty(this._sBindingPath + "/ProductName");

      MessageBox.confirm(
        "Delete \"" + sProductName + "\"? This cannot be undone.",
        {
          title: "Confirm Delete",
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
              var iIndex = parseInt(this._sBindingPath.split("/").pop(), 10);
              var aProducts = oProductsModel.getProperty("/Products");
              aProducts.splice(iIndex, 1);
              oProductsModel.setProperty("/Products", aProducts);
              MessageToast.show("Product deleted");
              this.onNavBack();
            }
          }.bind(this)
        }
      );
    },

    onNavBack: function () {
      window.history.go(-1);
    }
  });
});
