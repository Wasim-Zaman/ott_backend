const express = require("express");
const router = express.Router();
const { uploadSingle } = require("multermate");
const categoryController = require("../_controllers/category");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const imageConfig = {
  destination: "uploads",
  filename: "image",
  fileTypes: ["images"],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
};

// Category routes
router.post(
  "/v1/category",
  isAdmin,
  uploadSingle(imageConfig),
  categoryController.createCategory
);
router.get("/v1/categories", categoryController.getAllCategories);
router.get(
  "/v1/categories/paginated",
  categoryController.getPaginatedCategories
);
router.get("/v1/category/:id", categoryController.getCategoryById);
router.put(
  "/v1/category/:id",
  isAdmin,
  uploadSingle(imageConfig),
  categoryController.updateCategoryById
);
router.delete(
  "/v1/category/:id",
  isAdmin,
  categoryController.deleteCategoryById
);

module.exports = router;
