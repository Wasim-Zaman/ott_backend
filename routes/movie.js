const express = require('express');
const router = express.Router();
const { uploadSingle, ALLOWED_FILE_TYPES } = require('multermate');
const movieController = require('../controllers/movie');
const isAuth = require('../middleware/isAuth');
const isAdmin = require('../middleware/isAdmin');

const imageConfig = {
  destination: 'uploads',
  filename: 'image',
  fileTypes: ['images'],
  fileSizeLimit: 5 * 1024 * 1024, // 5MB limit
};

const videoConfig = {
  destination: 'uploads',
  filename: 'movie',
  fileTypes: ['videos'],
};

// Movie routes
router.post('/v1/movie', isAdmin, uploadSingle(imageConfig), uploadSingle(videoConfig), movieController.createMovie);
router.get('/v1/movies', movieController.getMovies);
router.get('/v1/movie/:id', movieController.getMovieById);
router.put(
  '/v1/movie/:id',
  isAdmin,
  uploadSingle(imageConfig),
  uploadSingle(videoConfig),
  movieController.updateMovieById
);
router.delete('/v1/movie/:id', isAdmin, movieController.deleteMovieById);

module.exports = router;
