const createTree = (categories, parentId = "") => {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category._doc,
      children: createTree(categories, category._id.toString()),
    }));
};

module.exports = { createTree };
