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
  "/user",
  isAdmin,
  uploadSingle(imageConfig),
  userController.createUser
);
router.get("/users", userController.getAllUsers);
router.get("/user/:id", userController.getUserById);
router.put(
  "/user/:id",
  isAdmin,
  uploadSingle(imageConfig),
  userController.updateUser
);
router.delete("/user/:id", isAdmin, userController.deleteUser);

module.exports = router;
