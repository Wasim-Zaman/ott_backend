const Movie = require("../models/Movie");
const CustomError = require("../utils/error");
const response = require("../utils/response");
const { deleteFile } = require("../utils/file");
const Joi = require("joi");

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
  let imagePath;
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

    const newMovie = await Movie.create(value);
    await newMovie.populate("categoryId");

    res
      .status(201)
      .json(response(201, true, "Movie created successfully", newMovie));
  } catch (error) {
    if (imagePath) await deleteFile(imagePath);
    if (videoPath) await deleteFile(videoPath);
    next(error);
  }
};

exports.getMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "", categoryId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = {};
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }
    if (categoryId) filter.categoryId = categoryId;
    if (status) filter.status = status;

    const movies = await Movie.find(filter)
      .populate("categoryId")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalMovies = await Movie.countDocuments(filter);

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
    next(error);
  }
};
