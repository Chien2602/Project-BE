const mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const productCategorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    parentId: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "ProductCategory",
  productCategorySchema,
  "productCategory",
);
