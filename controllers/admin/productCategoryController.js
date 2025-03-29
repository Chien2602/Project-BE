const ProductCategory = require("../../models/productCategoryModel");
const { createTree } = require("../../utils/createTree");

// [GET] get all category
// /api/v1/admin/categories
const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find({ deleted: false });

    res.status(200).json({
      message: "Categories retrieved successfully!",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving categories!",
      error: error.message,
    });
  }
};

// [GET] get one category
// /api/v1/admin/category/:id
const getCategory = async (req, res) => {
  try {
    const { id } = req.params.id;

    const category = await ProductCategory.findOne({ _id: id, deleted: false });
    if (!category) {
      res.status(400).json({
        message: "Category not found!",
      });
    }
    res.status(200).json({
      message: "Category retrieved successfully!",
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving category!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/category/create
const createCategory = async (req, res) => {
  try {
    const categories = await ProductCategory.find({ deleted: false });
    const newCategories = createTreeHelper(categories);

    res.status(200).json(newCategories);
  } catch (error) {
    res.status(500).json({
      message: "Error loading product category creation page!",
      error: error.message,
    });
  }
};

// [POST] /api/v1/admin/category/create
const createPostCategory = async (req, res) => {
  try {
    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const countCategory = await ProductCategory.countDocuments({});
      req.body.position = countCategory + 1;
    }

    const newCategory = new ProductCategory(req.body);
    await newCategory.save();

    res.status(200).json({ message: "update successful!" });
  } catch (error) {
    res.status(500).json({
      message: "Error creating product category!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/category/edit/:id
const editCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const category = await ProductCategory.findOne({
      _id: id,
      deleted: false,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found!" });
    }

    const categories = await ProductCategory.find({ deleted: false });
    const newCategories = createTreeHelper(categories);

    res.status(200).json(newCategories);
  } catch (error) {
    res.status(500).json({
      message: "Error loading product category edit page!",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/admin/category/edit/:id
const editPatchCategory = async (req, res) => {
  try {
    const id = req.params.id;

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const countCategory = await ProductCategory.countDocuments({});
      req.body.position = countCategory + 1;
    }

    const updatedCategory = await ProductCategory.updateOne(
      { _id: id, deleted: false },
      req.body,
    );

    if (updatedCategory.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Category not found or not updated!" });
    }
    res.status(200).json({ message: "Product category updated successfully!" });
  } catch (error) {
    res.status(500).json({
      message: "Error updating product category!",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  createPostCategory,
  editCategory,
  editPatchCategory,
};
