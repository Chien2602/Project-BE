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

// [GET] /api/v1/products/:productId - Xem chi tiết sản phẩm
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu productId",
      });
    }
    const product = await Product.findById(id).populate("categoryId");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }
    const category = await productCategory.findById(product.categoryId);

    const productDetails = {
      id: product._id,
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: category ? category.name : "Không xác định",
    };

    res.status(200).json({
      success: true,
      message: "Lấy thông tin sản phẩm thành công!",
      data: productDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy thông tin sản phẩm!",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getCategories,
  getProductDetails
};
