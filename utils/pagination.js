const Product = require("../models/productModel");

const paginationProduct = async (req, res) => {
  const pagination = {
    currentPage: 1,
    limitItems: 4,
  };
  if (req.query.page) {
    pagination.currentPage = parseInt(req.query.page);
  }
  pagination.skip = (pagination.currentPage - 1) * pagination.limitItems;
  const countProduct = await Product.countDocuments(find);
  const totalPage = Math.ceil(countProduct / pagination.limitItems);
  pagination.totalPage = totalPage;

  return pagination;
};

module.exports = { paginationProduct };
