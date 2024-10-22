const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Joi = require("joi");
const { deleteFile } = require("../utils/file");

const CustomError = require("../utils/error");
const response = require("../utils/response");

// Update Joi validation schema
const movieSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  imageUrl: Joi.string().uri().optional(),
  videoLink: Joi.string().uri().optional(),
  source: Joi.string().required(),
  status: Joi.string().valid("PUBLISHED", "PENDING").default("PENDING"),
  categoryId: Joi.string().required(),
});

// Create a new movie
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

    if (!value.videoLink && req.body.videoLink) {
      value.videoLink = req.body.videoLink;
    }

    const newMovie = await prisma.movie.create({
      data: {
        ...value,
        category: { connect: { id: value.categoryId } },
      },
      include: { category: true },
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

// Get all movies with pagination
exports.getMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, query = "", categoryId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      OR: [{ name: { contains: query } }, { description: { contains: query } }],
    };
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const movies = await prisma.movie.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    const totalMovies = await prisma.movie.count({ where });

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

// Get movie by ID
exports.getMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({
      where: { id },
      include: { category: true },
    });

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

// Update movie by ID
exports.updateMovieById = async (req, res, next) => {
  let imagePath, videoPath;
  try {
    const { id } = req.params;
    const { error, value } = movieSchema.validate(req.body);
    if (error) {
      throw new CustomError(error.details[0].message, 400);
    }

    const existingMovie = await prisma.movie.findUnique({ where: { id } });
    if (!existingMovie) {
      throw new CustomError("Movie not found", 404);
    }

    if (req.files) {
      if (req.files.image) {
        imagePath = req.files.image[0].path;
        value.imageUrl = imagePath;
        if (
          existingMovie.imageUrl &&
          (await fileExists(existingMovie.imageUrl))
        ) {
          await deleteFile(existingMovie.imageUrl);
        }
      }
      if (req.files.movie) {
        videoPath = req.files.movie[0].path;
        value.videoLink = videoPath;
        if (
          existingMovie.videoLink &&
          (await fileExists(existingMovie.videoLink))
        ) {
          await deleteFile(existingMovie.videoLink);
        }
      }
    }

    if (!value.videoLink && req.body.videoLink) {
      value.videoLink = req.body.videoLink;
    }

    const updatedMovie = await prisma.movie.update({
      where: { id },
      data: {
        ...value,
        category: { connect: { id: value.categoryId } },
      },
      include: { category: true },
    });

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

// Delete movie by ID
exports.deleteMovieById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new CustomError("Movie not found", 404);
    }

    if (movie.imageUrl && (await fileExists(movie.imageUrl))) {
      await deleteFile(movie.imageUrl);
    }
    if (movie.videoLink && (await fileExists(movie.videoLink))) {
      await deleteFile(movie.videoLink);
    }

    await prisma.movie.delete({ where: { id } });
    res.status(200).json(response(200, true, "Movie deleted successfully"));
  } catch (error) {
    if (error.code === "P2025") {
      next(new CustomError("Movie not found", 404));
    } else {
      console.log(`Error in deleteMovieById: ${error.message}`);
      next(error);
    }
  }
};

// Get paginated movies
exports.getPaginatedMovies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, categoryId, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const movies = await prisma.movie.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    const totalMovies = await prisma.movie.count({ where });

    res.status(200).json(
      response(200, true, "Movies retrieved successfully", {
        data: movies,
        totalPages: Math.ceil(totalMovies / Number(limit)),
        currentPage: Number(page),
        totalMovies,
      })
    );
  } catch (error) {
    console.log(`Error in getPaginatedMovies: ${error.message}`);
    next(error);
  }
};
