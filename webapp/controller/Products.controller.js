sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "learning/northwind/model/formatter"
], function (Controller, Fragment, JSONModel, Filter, FilterOperator, MessageToast, MessageBox, formatter) {
  "use strict";

  return Controller.extend("learning.northwind.controller.Products", {

    formatter: formatter,

    onInit: function () {
      // Track current search text + stock filter separately so we
      // can combine them (AND logic) whichever one changes.
      this._sSearchQuery = "";
      this._sStockFilter = "all";
    },

    // ---------------- READ (navigate to detail) ----------------
    onViewProduct: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("products");
      var sProductID = oContext.getProperty("ProductID");
      this.getOwnerComponent().getRouter().navTo("detail", {
        productID: sProductID
      });
    },

    // ---------------- CREATE ----------------
    onAddProduct: function () {
      var oView = this.getView();

      if (!this._pDialog) {
        this._pDialog = Fragment.load({
          id: oView.getId(),
          name: "learning.northwind.view.fragment.AddProduct",
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          return oDialog;
        });
      }

      this._pDialog.then(function (oDialog) {
        // Fresh, empty form model each time the dialog opens
        oView.setModel(new JSONModel({
          ProductName: "",
          QuantityPerUnit: "",
          UnitPrice: 0,
          UnitsInStock: 0
        }), "newProduct");
        oDialog.open();
      });
    },

    onSaveNewProduct: function () {
      var oNewProduct = this.getView().getModel("newProduct").getData();

      if (!oNewProduct.ProductName || !oNewProduct.ProductName.trim()) {
        MessageToast.show("Product name is required");
        return;
      }

      var oProductsModel = this.getOwnerComponent().getModel("products");
      var aProducts = oProductsModel.getProperty("/Products");

      // Generate the next ProductID locally, same idea as an
      // auto-increment primary key on a real backend.
      var iNextId = aProducts.reduce(function (iMax, oProduct) {
        return Math.max(iMax, oProduct.ProductID);
      }, 0) + 1;

      oNewProduct.ProductID = iNextId;
      oNewProduct.UnitPrice = parseFloat(oNewProduct.UnitPrice) || 0;
      oNewProduct.UnitsInStock = parseInt(oNewProduct.UnitsInStock, 10) || 0;
      oNewProduct.Discontinued = false;

      aProducts.push(oNewProduct);
      oProductsModel.setProperty("/Products", aProducts);

      MessageToast.show("Product added");
      this._pDialog.then(function (oDialog) { oDialog.close(); });
    },

    onCancelNewProduct: function () {
      this._pDialog.then(function (oDialog) { oDialog.close(); });
    },

    // ---------------- DELETE ----------------
    onDeleteProduct: function (oEvent) {
      var oContext = oEvent.getSource().getBindingContext("products");
      var sProductName = oContext.getProperty("ProductName");
      var sPath = oContext.getPath(); // e.g. "/Products/3"

      MessageBox.confirm(
        "Delete \"" + sProductName + "\"? This cannot be undone.",
        {
          title: "Confirm Delete",
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {
              var oProductsModel = this.getOwnerComponent().getModel("products");
              var iIndex = parseInt(sPath.split("/").pop(), 10);
              var aProducts = oProductsModel.getProperty("/Products");
              aProducts.splice(iIndex, 1);
              oProductsModel.setProperty("/Products", aProducts);
              MessageToast.show("Product deleted");
            }
          }.bind(this)
        }
      );
    },

    // ---------------- Search + filter ----------------
    onSearch: function (oEvent) {
      this._sSearchQuery = oEvent.getParameter("newValue");
      this._applyFilters();
    },

    onFilterChange: function (oEvent) {
      this._sStockFilter = oEvent.getParameter("selectedItem").getKey();
      this._applyFilters();
    },

    _applyFilters: function () {
      var aFilters = [];

      if (this._sSearchQuery) {
        aFilters.push(new Filter("ProductName", FilterOperator.Contains, this._sSearchQuery));
      }

      if (this._sStockFilter === "in") {
        aFilters.push(new Filter("UnitsInStock", FilterOperator.GE, 10));
      } else if (this._sStockFilter === "low") {
        aFilters.push(new Filter("UnitsInStock", FilterOperator.BT, 1, 9));
      } else if (this._sStockFilter === "out") {
        aFilters.push(new Filter("UnitsInStock", FilterOperator.EQ, 0));
      }

      var oBinding = this.byId("productTable").getBinding("items");
      // Passing an array with and=true means ALL filters must match
      oBinding.filter(new Filter({ filters: aFilters, and: true }));
    }
  });
});
