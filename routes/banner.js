const express = require("express");
const router = express.Router();
const { uploadSingle } = require("multermate");
const bannerController = require("../controllers/banner");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const imageConfig = {
  destination: "uploads",
  filename: "image",
  fileTypes: ["images"],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
};

// Banner routes
router.post(
  "/banner",
  isAdmin,
  uploadSingle(imageConfig),
  bannerController.createBanner
);
router.get("/banners", bannerController.getBanners);
router.get("/banner/:id", bannerController.getBannerById);
router.put(
  "/banner/:id",
  isAdmin,
  uploadSingle(imageConfig),
  bannerController.updateBannerById
);
router.delete("/banner/:id", isAdmin, bannerController.deleteBannerById);

module.exports = router;
