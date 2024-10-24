const Joi = require("joi");
const { deleteFile } = require("../utils/file");
const CustomError = require("../utils/error");
const response = require("../utils/response");
const Movie = require("../models/Movie");

const movieSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  imageUrl: Joi.string().uri().optional(),
  videoLink: Joi.string().uri().optional(),
  source: Joi.string().required(),
  status: Joi.string().valid("PUBLISHED", "PENDING").default("PENDING"),
  categoryId: Joi.string().required(),
});

exports.createMovie = async (req, res, next) => {
  let imagePath, videoPath;
  try {
    const { error, value } = movieSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    if (req.files) {
      if (req.files.image) {
        imagePath = req.files.image[0].path;
        value.imageUrl = imagePath;
      }
      if (req.files.movie) {
        videoPath = req.files.movie[0].path;
        value.videoLink = videoPath;
      }
    }

    const newMovie = await Movie.create({
      ...value,
      categoryId: value.categoryId,
    });

    res
      .status(201)
      .json(response(201, true, "Movie created successfully", newMovie));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    if (videoPath) await deleteFile(videoPath);
    console.log(`Error in createMovie: ${error.message}`);
    next(error);
  }
};

exports.getMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "", categoryId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const movies = await Movie.find(where)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .populate("categoryId");

    const totalMovies = await Movie.countDocuments(where);

    if (!movies.length) {
      throw new CustomError("No movies found", 404);
    }

    res.status(200).json(
      response(200, true, "Movies retrieved successfully", {
        data: movies,
        totalPages: Math.ceil(totalMovies / Number(limit)),
        currentPage: Number(page),
        totalMovies,
      })
    );
  } catch (error) {
    console.log(`Error in getMovies: ${error.message}`);
    next(error);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id).populate("categoryId");

    if (!movie) {
      throw new CustomError("Movie not found", 404);
    }

    res
      .status(200)
      .json(response(200, true, "Movie found successfully", movie));
  } catch (error) {
    console.log(`Error in getMovieById: ${error.message}`);
    next(error);
  }
};

exports.updateMovieById = async (req, res, next) => {
  let imagePath, videoPath;
  try {
    const { id } = req.params;
    const { error, value } = movieSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const existingMovie = await Movie.findById(id);
    if (!existingMovie) {
      throw new CustomError("Movie not found", 404);
    }

    if (req.files) {
      if (req.files.image) {
        imagePath = req.files.image[0].path;
        value.imageUrl = imagePath;
        if (existingMovie.imageUrl) {
          await deleteFile(existingMovie.imageUrl);
        }
      }
      if (req.files.movie) {
        videoPath = req.files.movie[0].path;
        value.videoLink = videoPath;
        if (existingMovie.videoLink) {
          await deleteFile(existingMovie.videoLink);
        }
      }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(id, value, {
      new: true,
    }).populate("categoryId");

    res
      .status(200)
      .json(response(200, true, "Movie updated successfully", updatedMovie));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    if (videoPath) await deleteFile(videoPath);
    console.log(`Error in updateMovieById: ${error.message}`);
    next(error);
  }
};

exports.deleteMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new CustomError("Movie not found", 404);
    }

    if (movie.imageUrl) {
      await deleteFile(movie.imageUrl);
    }
    if (movie.videoLink) {
      await deleteFile(movie.videoLink);
    }

    await Movie.findByIdAndDelete(id);
    res.status(200).json(response(200, true, "Movie deleted successfully"));
  } catch (error) {
    console.log(`Error in deleteMovieById: ${error.message}`);
    next(error);
  }
};
