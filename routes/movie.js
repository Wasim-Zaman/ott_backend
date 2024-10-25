const express = require("express");
const router = express.Router();
const { uploadMultiple, ALLOWED_FILE_TYPES } = require("multermate");
const movieController = require("../_controllers/movie");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const uploadConfig = {
  destination: "uploads",
  fields: [
    {
      name: "image",
      maxCount: 1,
      fileTypes: ["images"],
      fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
    },
    {
      name: "video",
      maxCount: 1,
      fileTypes: ["videos"],
    },
  ],
};

// Movie routes
router.post(
  "/movie",
  isAdmin,
  uploadMultiple(uploadConfig),
  movieController.createMovie
);

router.put(
  "/movie/:id",
  isAdmin,
  uploadMultiple(uploadConfig),
  movieController.updateMovieById
);

router.get("/movies", movieController.getMovies);
router.get("/movie/:id", movieController.getMovieById);
router.delete("/movie/:id", isAdmin, movieController.deleteMovieById);

module.exports = router;
