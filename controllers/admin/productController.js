const Product = require("../../models/productModel");
const Account = require("../../models/accountModel");
const productCategory = require("../../models/productCategoryModel");
const moment = require("moment");
const { paginationProduct } = require("../../utils/pagination");
const { createTree } = require("../../utils/createTree");

// [GET] /api/v1/admin/products
const getProducts = async (req, res) => {
  try {
    const find = {
      deleted: false,
    };

    // Search
    let keyword = "";
    if (req.query.keyword) {
      const regex = new RegExp(req.query.keyword, "i");
      find.title = regex;
      keyword = req.query.keyword;
    }
    // End Search

    // Pagination
    const pagination = await paginationProduct(req, find);
    // End Pagination

    // Sort
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort.position = "desc";
    }
    // End Sort

    const products = await Product.find(find)
      .limit(pagination.limitItems)
      .skip(pagination.skip)
      .sort(sort);

    for (const item in products) {
      if (item.createdBy) {
        const accountCreate = await Account.findById(item.createdBy);
        item.createByFullName = accountCreate.fullname;
      } else {
        item.createByFullName = "";
      }
      item.createAtFormat = moment(item.createAt).format("DD/MM/YYYY HH:mm:ss");

      if (item.updatedBy) {
        const accountUpdate = await Account.findById(item.updatedBy);
        item.updateByFullName = accountUpdate.fullname;
      } else {
        item.updateByFullName = "";
      }
      item.updateAtFormat = moment(item.updateAt).format("DD/MM/YYYY HH:mm:ss");

      res.status(200).json(products);
    }
  } catch (error) {
    res.status(400).json({
      message: "Error while retrieving product list!",
      error: error.message,
    });
  }
};

// [PATCH] change status 1 product
// /api/v1/admin/product/status:id
const changeStatusProduct = async (req, res) => {
  try {
    if (
      !res.locals.role ||
      !res.locals.role.permissions.includes("product_edit")
    ) {
      return res
        .status(403)
        .json({
          message: "Forbidden! You do not have permission to edit products.",
        });
    }

    const { id, statusChange } = req.params;

    if (!id || !statusChange) {
      return res
        .status(400)
        .json({ message: "Bad Request! Missing required parameters." });
    }

    const result = await Product.updateOne(
      { _id: id },
      { status: statusChange },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found!" });
    }

    return res
      .status(200)
      .json({ message: "Product status updated successfully!" });
  } catch (error) {
    console.error("Error updating product status:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// [PATCH] Change status many product
// /api/v1/admin/product/status
const changeMulti = async (req, res) => {
  try {
    if (
      !res.locals.role ||
      !res.locals.role.permissions.includes("products_edit")
    ) {
      return res
        .status(403)
        .json({
          message: "Forbidden! You do not have permission to edit products.",
        });
    }

    const { status, ids } = req.body;

    if (!status || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Bad Request! Invalid parameters." });
    }

    let updateQuery = {};

    switch (status) {
      case "active":
      case "inactive":
        updateQuery = { status: status };
        break;
      case "delete":
        updateQuery = { deleted: true };
        break;
      default:
        return res
          .status(400)
          .json({ message: "Bad Request! Invalid status value." });
    }

    const result = await Product.updateMany({ _id: { $in: ids } }, updateQuery);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "No products found to update!" });
    }

    return res.status(200).json({
      message: "Products updated successfully!",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating multiple products:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// [PATCH] Delete product - soft delete
// /api/v1/admin/product/:id
const softDelete = async (req, res) => {
  try {
    if (res.locals.permissions.includes("products_delete")) {
      const id = req.params.id;
      await Product.updateOne(
        {
          _id: id,
        },
        {
          deleted: true,
          deletedBy: res.locals.account.id,
        },
      );
      res.status(200).json({ message: "Product deleted successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: "Product deleted fails" });
  }
};

// [PATCH] change position product
// /api/v1/admin/product/position
const changePosition = async (req, res) => {
  try {
    if (res.locals.permissions.includes("products_edit")) {
      const id = req.params.id;
      const position = req.body.position;
      await Product.updateOne(
        {
          _id: id,
        },
        {
          position: position,
        },
      );
      res.status(200).json({ message: "Product update successfully" });
    }
  } catch (error) {
    res.status(400).json({ message: "Product update fails" });
  }
};

// [PATCH] Update Product
// /api/v1/admin/product/:id
const updateProduct = async (req, res) => {
  if (res.locals.role.permissions.includes("products_edit")) {
    try {
      const id = req.params.id;

      req.body.price = parseInt(req.body.price);
      req.body.discount = parseInt(req.body.discount);
      req.body.stock = parseInt(req.body.stock);
      if (req.body.position) {
        req.body.position = parseInt(req.body.position);
      } else {
        const countProducts = await Product.countDocuments({});
        req.body.position = countProducts + 1;
      }

      req.body.updatedBy = res.locals.account.id;

      await Product.updateOne(
        {
          _id: id,
          deleted: false,
        },
        req.body,
      );

      res.status(200).json({ message: "update success!" });
    } catch (error) {
      res.status(400).json({ message: "id not found!" });
    }
  } else {
    res.send(`403`);
  }
};

// [GET] /api/v1/admin/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await productCategory.find({ deleted: false });

    const newCategories = createTree(categories);

    res.status(200).json({
      success: true,
      message: "Get your product catalog successfully!",
      data: newCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error while retrieving product list!",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  changeStatusProduct,
  changeMulti,
  softDelete,
  changePosition,
  updateProduct,
  getCategories,
};
