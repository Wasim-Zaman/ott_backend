const Joi = require("joi");
const { deleteFile } = require("../utils/file");
const CustomError = require("../utils/error");
const response = require("../utils/response");
const Movie = require("../models/Movie");

const movieSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  videoType: Joi.string().valid("UPLOAD", "LINK").required(),
  videoUrl: Joi.string().when("videoType", {
    is: "LINK",
    then: Joi.string().uri().required(),
    otherwise: Joi.string().allow(null, ""),
  }),
  image: Joi.any(),
  movie: Joi.any(),
  categoryId: Joi.string().required(),
  status: Joi.string().valid("PUBLISHED", "PENDING").default("PENDING"),
}).unknown(true); // Add this to allow additional fields from multer

exports.createMovie = async (req, res, next) => {
  let imagePath, videoPath;
  try {
    const { error, value } = movieSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    // Handle image upload (required)
    if (!req.files?.image?.[0]) {
      throw new CustomError("Image is required", 400);
    }
    imagePath = req.files.image[0].path;
    value.imageUrl = imagePath;

    // Handle video based on type
    if (value.videoType === "UPLOAD") {
      if (!req.files?.movie?.[0]) {
        throw new CustomError("Video file is required for upload type", 400);
      }
      videoPath = req.files.movie[0].path;
      value.videoUrl = videoPath;
    } else if (!value.videoUrl) {
      throw new CustomError("Video URL is required for link type", 400);
    }

    const newMovie = await Movie.create(value);

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
      OR: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const movies = await Movie.find(where)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: "desc" });

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

    // Handle image upload
    if (req.files?.image?.[0]) {
      imagePath = req.files.image[0].path;
      value.imageUrl = imagePath;
      if (existingMovie.imageUrl) {
        await deleteFile(existingMovie.imageUrl);
      }
    }

    // Handle video based on type
    if (value.videoType === "UPLOAD") {
      if (req.files?.movie?.[0]) {
        videoPath = req.files.movie[0].path;
        value.videoUrl = videoPath;
        if (existingMovie.videoUrl && existingMovie.videoType === "UPLOAD") {
          await deleteFile(existingMovie.videoUrl);
        }
      } else if (
        !existingMovie.videoUrl ||
        existingMovie.videoType !== "UPLOAD"
      ) {
        throw new CustomError("Video file is required for upload type", 400);
      }
    } else if (!value.videoUrl) {
      throw new CustomError("Video URL is required for link type", 400);
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
