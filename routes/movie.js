const express = require("express");
const router = express.Router();
const { uploadMultiple } = require("multermate");
const movieController = require("../controllers/movie");
const isAuth = require("../middleware/isAuth");
const isAdmin = require("../middleware/isAdmin");

const uploadConfig = {
  destination: "uploads",
  fields: [
    {
      name: "image",
      maxCount: 1,
      fileTypes: ["images"],
    },
    {
      name: "movie",
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
