const CustomError = require("../utils/error");
const response = require("../utils/response");
const Movie = require("../models/Movie");
const Category = require("../models/Category");
const Banner = require("../models/Banner");
const User = require("../models/User");

exports.getCounts = async (req, res, next) => {
  try {
    const [movieCount, categoryCount, bannerCount, userCount] =
      await Promise.all([
        Movie.countDocuments(),
        Category.countDocuments(),
        Banner.countDocuments(),
        User.countDocuments(),
      ]);

    const counts = {
      movies: movieCount,
      categories: categoryCount,
      banners: bannerCount,
      users: userCount,
    };

    res
      .status(200)
      .json(response(200, true, "Counts retrieved successfully", counts));
  } catch (error) {
    console.log(`Error in getCounts: ${error.message}`);
    next(error);
  }
};
