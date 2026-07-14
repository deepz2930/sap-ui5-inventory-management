sap.ui.define([], function () {
  "use strict";

  return {
    // ObjectStatus "state" controls the badge COLOR
    stockState: function (iUnits) {
      if (iUnits === 0 || iUnits === undefined) {
        return "Error";      // red
      } else if (iUnits < 10) {
        return "Warning";    // amber
      }
      return "Success";      // green
    },

    // ObjectStatus "text" controls the badge LABEL
    stockText: function (iUnits) {
      if (iUnits === 0 || iUnits === undefined) {
        return "Out of Stock";
      } else if (iUnits < 10) {
        return "Low Stock";
      }
      return "In Stock";
    },

    countAll: function (aProducts) {
      return aProducts ? aProducts.length : 0;
    },

    countInStock: function (aProducts) {
      return aProducts ? aProducts.filter(function (p) { return p.UnitsInStock >= 10; }).length : 0;
    },

    countLowStock: function (aProducts) {
      return aProducts ? aProducts.filter(function (p) { return p.UnitsInStock > 0 && p.UnitsInStock < 10; }).length : 0;
    },

    countOutOfStock: function (aProducts) {
      return aProducts ? aProducts.filter(function (p) { return !p.UnitsInStock; }).length : 0;
    }
  };
});
