const express = require("express");
const router = express.Router();
const { uploadSingle } = require("multermate");
const userController = require("../controllers/user");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const imageConfig = {
  destination: "uploads",
  filename: "image",
  fileTypes: ["images"],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
};

router.post(
  "/v1/user",
  isAdmin,
  uploadSingle(imageConfig),
  userController.createUser
);
router.get("/v1/users", userController.getAllUsers);
router.get("/v1/user/:id", userController.getUserById);
router.put(
  "/v1/user/:id",
  isAdmin,
  uploadSingle(imageConfig),
  userController.updateUser
);
router.delete("/v1/user/:id", isAdmin, userController.deleteUser);

module.exports = router;
