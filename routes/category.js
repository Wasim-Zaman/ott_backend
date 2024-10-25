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
  "/category",
  isAdmin,
  uploadSingle(imageConfig),
  categoryController.createCategory
);
router.get("/categories", categoryController.getAllCategories);
router.get("/categories/paginated", categoryController.getPaginatedCategories);
router.get("/category/:id", categoryController.getCategoryById);
router.put(
  "/category/:id",
  isAdmin,
  uploadSingle(imageConfig),
  categoryController.updateCategoryById
);
router.delete("/category/:id", isAdmin, categoryController.deleteCategoryById);

module.exports = router;
