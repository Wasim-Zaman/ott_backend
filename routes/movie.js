const express = require("express");
const router = express.Router();
const { uploadSingle, ALLOWED_FILE_TYPES } = require("multermate");
const movieController = require("../_controllers/movie");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const imageConfig = {
  destination: "uploads",
  filename: "image",
  fileTypes: ["images"],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
};

const videoConfig = {
  destination: "uploads",
  filename: "movie",
  fileTypes: ["videos"],
};

// Movie routes
router.post(
  "/movie",
  isAdmin,
  uploadSingle(imageConfig),
  uploadSingle(videoConfig),
  movieController.createMovie
);
router.get("/movies", movieController.getMovies);
router.get("/movie/:id", movieController.getMovieById);
router.put(
  "/movie/:id",
  isAdmin,
  uploadSingle(imageConfig),
  uploadSingle(videoConfig),
  movieController.updateMovieById
);
router.delete("/movie/:id", isAdmin, movieController.deleteMovieById);

module.exports = router;
